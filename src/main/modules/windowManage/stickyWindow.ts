import { BrowserWindow, screen } from 'electron'
import { debounce } from 'lodash'
import { ipcMainService } from '@/main/ipcManager'

interface StickyOptions {
  visibleSize?: number
  animationDuration?: number
  animationSteps?: number
}

/**
 * 贴边窗口：托拉拽窗口顶部到屏幕边缘，会自动隐藏窗口，不会显示多余的窗口边缘，
 * 当窗口贴边后，鼠标移到屏幕边缘，窗口向下滑出显示。
 */
class StickyWindow {
  currentWindow: BrowserWindow | null = null
  // 是否贴边状态，即顶部和屏幕边缘贴在一起
  isSticky: boolean = false
  originalBounds: Electron.Rectangle | null = null
  isAnimating: boolean = false

  isShowing: boolean = false
  isHiding: boolean = false
  isEnableSticky: boolean = true // 控制贴边功能是否启用

  stickyOptions: StickyOptions = {
    visibleSize: 0, // 完全隐藏，不再露出任何部分
    animationDuration: 200, // 动画持续时间(ms)
    animationSteps: 10 // 动画步数
  }

  private mouseTrackingInterval: any = null
  private isDragging: boolean = false
  private dragTimeout: NodeJS.Timeout | null = null
  private lastMousePosition: { x: number; y: number } | null = null
  
  // 事件监听器引用
  private willMoveListener: (() => void) | null = null
  private movedListener: (() => void) | null = null

  // 传入electron的窗口实例进行初始化
  initWindow(window: BrowserWindow, options?: StickyOptions) {
    this.currentWindow = window
    this.stickyOptions = { ...this.stickyOptions, ...options }
    
    // 保存原始事件监听器引用
    this.willMoveListener = () => {
      if (!this.isDragging) {
        this.isDragging = true
        this.lastMousePosition = screen.getCursorScreenPoint()
      }
    }
    
    this.movedListener = () => {
      if (this.dragTimeout) {
        clearTimeout(this.dragTimeout)
      }

      if (this.isDragging) {
        const currentMousePos = screen.getCursorScreenPoint()
        
        // 检测是否是真实的用户拖拽
        if (this.lastMousePosition && 
            (Math.abs(currentMousePos.x - this.lastMousePosition.x) > 5 || 
             Math.abs(currentMousePos.y - this.lastMousePosition.y) > 5)) {
          // 如果是贴边状态，且发生了明显的拖拽，则取消贴边
          if (this.isSticky) {
            this.isSticky = false
            this.originalBounds = null
            this.stopMouseTracking()
          }
        }
        
        this.lastMousePosition = currentMousePos
      }
      
      // 设置延时，等待拖拽真正结束后再判断是否需要贴边
      this.dragTimeout = setTimeout(() => {
        this.isDragging = false
        this.lastMousePosition = null
        
        if (!this.isAnimating && !this.isSticky && this.isEnableSticky) {
          this.handleWindowMove()
        }
      }, 200) // 增加延迟时间到200ms
    }
    
    // 监听窗口事件
    window.on('will-move', this.willMoveListener)
    window.on('moved', this.movedListener)
    
    // 监听鼠标事件
    this.registerEvent()
    
    // 默认启用
    this.isEnableSticky = true
  }


  
  // 启用贴边功能
  enableSticky() {
    if (this.isEnableSticky) return
    
    this.isEnableSticky = true
    
    // 如果当前处于贴边状态，重新启动鼠标跟踪
    if (this.isSticky) {
      this.startMouseTracking()
    }
  }
  
  // 禁用贴边功能
  disableSticky() {
    if (!this.isEnableSticky) return
    
    this.isEnableSticky = false
    
    // 清理资源
    this.stopMouseTracking()
    
    // 如果当前处于贴边状态，恢复窗口
    if (this.isSticky) {
      this.unstick()
    }
  }
  
  // 切换贴边功能状态
  toggleSticky(enabled?: boolean) {
    if (enabled === undefined) {
      enabled = !this.isEnableSticky
    }
    
    if (enabled) {
      this.enableSticky()
    } else {
      this.disableSticky()
    }
    
    return enabled
  }

  private registerEvent() {
    ipcMainService.on('app:window:mouse-leave', () => {
      if (this.isSticky && !this.isHiding) {
        this.startMouseTracking()
      }
    })
    // 启用/禁用贴边功能
    ipcMainService.on('app:stickwindow:toggle-enable', (event, isEnabled) => {
      this.toggleSticky(isEnabled)
    })
  }

  private startMouseTracking() {
    if (this.mouseTrackingInterval) {
      this.stopMouseTracking()
    }

    this.mouseTrackingInterval = setInterval(() => {
      if (!this.isSticky || !this.currentWindow) {
        this.stopMouseTracking()
        return
      }

      const mousePos = screen.getCursorScreenPoint()
      const bounds = this.currentWindow.getBounds()
      const display = screen.getDisplayNearestPoint({ x: mousePos.x, y: mousePos.y })
      
      // 鼠标是否在主显示器内
      const isInCurrentDisplay = mousePos.x >= display.bounds.x && 
                                mousePos.x <= display.bounds.x + display.bounds.width &&
                                mousePos.y >= display.bounds.y &&
                                mousePos.y <= display.bounds.y + display.bounds.height
      // 靠近顶部10px区域
      const isNearTopEdge = isInCurrentDisplay && 
                            mousePos.y <= display.bounds.y + 10 && // 扩大到顶部10px区域
                            mousePos.x >= bounds.x &&
                            mousePos.x <= bounds.x + bounds.width
      // 贴边吸顶状态的主窗口范围
      const isWithinMainWindow = mousePos.x >= bounds.x && 
                                mousePos.x <= bounds.x + bounds.width &&
                                mousePos.y >= bounds.y &&
                                mousePos.y <= bounds.y + bounds.height
      // console.log('isWithinMainWindow', isWithinMainWindow, mousePos.x)
      // 靠近顶部10px区域，显示窗口
      if (isNearTopEdge && !this.isShowing && !this.isAnimating) {
        // 贴边状态、下滑显示主窗口
        this.debouncedShowWindow()
        // 停止鼠标跟踪，防止继续检测鼠标位置浪费资源，隐藏窗口通过渲染进程发送通知
        this.stopMouseTracking()
      }
      // 贴边后、鼠标不在主窗口区域则隐藏窗口
      if (this.isSticky && !isWithinMainWindow && !this.isShowing) {
        this.debouncedHideWindow()
      }
    }, 100) // 进一步缩短检测间隔，提高响应速度
  }

  private stopMouseTracking() {
    if (this.mouseTrackingInterval) {
      clearInterval(this.mouseTrackingInterval)
      this.mouseTrackingInterval = null
    }
  }

  private handleWindowMove() {
    if (!this.currentWindow || this.isAnimating || this.isDragging || !this.isEnableSticky) return

    const windowBounds = this.currentWindow.getBounds()
    const display = screen.getDisplayNearestPoint({ x: windowBounds.x, y: windowBounds.y })
    const threshold = 20 // 吸附阈值

    // 增加更严格的贴边判断条件
    const isNearTop = Math.abs(windowBounds.y - display.bounds.y) < threshold
    const isWithinDisplayWidth = 
      windowBounds.x >= display.bounds.x - threshold &&
      windowBounds.x + windowBounds.width <= display.bounds.x + display.bounds.width + threshold
    
    if (isNearTop && isWithinDisplayWidth && !this.isSticky && windowBounds.y >= 0) {
      // 保存当前位置作为原始位置
      this.originalBounds = { ...windowBounds }
      this.stickToTop()
    } else if (!isNearTop && this.isSticky) {
      this.unstick()
    }
  }

  private stickToTop() {
    if (!this.currentWindow || !this.originalBounds) return

    // 确保窗口完全对齐到顶部
    const display = screen.getDisplayNearestPoint({ 
      x: this.originalBounds.x, 
      y: this.originalBounds.y 
    })

    this.currentWindow.setBounds({
      x: this.originalBounds.x,
      y: display.bounds.y, // 使用显示器的y坐标确保精确对齐
      width: this.originalBounds.width,
      height: this.originalBounds.height
    })

    this.isSticky = true
    // 初次贴边时自动隐藏
    this.hideWindowWithAnimation()
  }

  private debouncedShowWindow = debounce(() => {
    if (!this.isSticky || this.isShowing || !this.originalBounds) return
    this.showWindowWithAnimation()
  }, 50)

  private debouncedHideWindow = debounce(() => {
    if (!this.isSticky || this.isHiding) return
    this.hideWindowWithAnimation()
  }, 50)

  private showWindowWithAnimation() {
    if (!this.currentWindow || !this.originalBounds || this.isAnimating) return
    
    this.isAnimating = true
    this.isShowing = true
    
    const startBounds = this.currentWindow.getBounds()
    const startTime = Date.now()
    const duration = this.stickyOptions.animationDuration ?? 200
    const startY = startBounds.y
    const targetY = 0

    const animate = () => {
      if (!this.currentWindow) {
        this.isAnimating = false
        this.isShowing = false
        return
      }

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数使动画更平滑
      const easeProgress = this.easeInOutQuad(progress)
      const newY = startY + (targetY - startY) * easeProgress

      this.currentWindow.setBounds({
        ...startBounds,
        y: Math.round(newY)
      })

      if (progress < 1) {
        setImmediate(animate)
      } else {
        this.isAnimating = false
        this.isShowing = false
        // 窗口显示后，确保鼠标跟踪机制准备就绪
        // 但此时窗口已显示，不需要立即跟踪
      }
    }

    setImmediate(animate)
  }

  private hideWindowWithAnimation() {
    if (!this.currentWindow || this.isAnimating) return
    
    this.isAnimating = true
    this.isHiding = true
    
    const startBounds = this.currentWindow.getBounds()
    const startTime = Date.now()
    const duration = this.stickyOptions.animationDuration ?? 200
    const startY = startBounds.y
    const targetY = -startBounds.height // 完全隐藏窗口，不露出任何部分

    const animate = () => {
      if (!this.currentWindow) {
        this.isAnimating = false
        this.isHiding = false
        return
      }

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数使动画更平滑
      const easeProgress = this.easeInOutQuad(progress)
      const newY = startY + (targetY - startY) * easeProgress

      this.currentWindow.setBounds({
        ...startBounds,
        y: Math.round(newY)
      })

      if (progress < 1) {
        setImmediate(animate)
      } else {
        this.isAnimating = false
        this.isHiding = false
        // 窗口完全隐藏后立即启动鼠标跟踪
        this.startMouseTracking()
      }
    }

    setImmediate(animate)
  }

  // 添加缓动函数使动画更平滑
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  // 取消贴边
  private unstick() {
    if (!this.currentWindow || !this.originalBounds || this.isAnimating) return
    
    this.isSticky = false
    // 先停止所有动画和追踪
    this.stopMouseTracking()
    this.isAnimating = false
    this.isShowing = false
    this.isHiding = false
    
    // 恢复到原始位置
    this.currentWindow.setBounds(this.originalBounds)
    this.originalBounds = null
  }
}

export const stickyWindow = new StickyWindow()

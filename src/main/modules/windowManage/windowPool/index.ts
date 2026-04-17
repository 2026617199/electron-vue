import { BrowserWindow } from "electron"
import windowList, { WINDOW_ROUTE_NAME, WINDOW_URLS } from "../windowList"
import { ipcMainService } from '@/main/ipcManager'
import { loadUrl } from '@/main/modules/windowManage'

interface WindowPoolOptions {
  maxSize: number
  baseWindowName?: string
}

interface WindowInfo {
  window: BrowserWindow
  isBusy: boolean
  routeName?: string
}

export class WindowPool {
  private pool: Map<number, WindowInfo> = new Map()
  private maxSize: number
  private baseWindowName: string
  private availableIds: Set<number> = new Set()

  constructor() {
    this.maxSize = 0
    this.baseWindowName = WINDOW_ROUTE_NAME.BASE_URL
  }

  /**
   * 初始化窗口池
   */
initialize(options: WindowPoolOptions): void {
    this.maxSize = options.maxSize || 2
    this.baseWindowName = options.baseWindowName || WINDOW_ROUTE_NAME.BASE_URL
    for (let i = 0; i < this.maxSize; i++) {
      this.generateWindow()
    }
    registerWindowPoolEvents()
  }

  /**
   * 创建一个窗口实例并添加到池
   */
  private generateWindow(): BrowserWindow | null {
    if (this.pool.size >= this.maxSize) {
      return null
    }

    // 获取基础窗口配置
    const windowConfig = windowList.get(this.baseWindowName)
    if (!windowConfig) {
      throw new Error(`Window configuration for "${this.baseWindowName}" not found.`)
    }

    const options = windowConfig.options()
    if (!options) {
      throw new Error(`Invalid options for window configuration "${this.baseWindowName}".`)
    }

    const window = new BrowserWindow({
      ...options,
      show: false // 窗口池中的窗口默认不显示
    })

    // 初始化窗口信息
    const windowInfo: WindowInfo = {
      window,
      isBusy: false
    }

    // 存储窗口实例
    this.pool.set(window.id, windowInfo)
    this.availableIds.add(window.id)

    // 监听窗口关闭事件
    window.on("close", (event) => {
        console.log('window close: ', window.id);
      event.preventDefault() // 阻止窗口真正关闭
      this.releaseWindow(window.id)
      window.hide()
    })

    // 执行窗口配置的回调
    windowConfig.callback(window)

    return window
  }

  /**
   * 获取一个可用窗口
   */
  getAvailableWindow(): BrowserWindow | null {
    if (this.availableIds.size === 0) {
      // 如果没有可用窗口，尝试创建新的
      const newWindow = this.generateWindow()
      return newWindow || null
    }

    // 获取第一个可用窗口ID
    const availableId = Array.from(this.availableIds)[0]
    const windowInfo = this.pool.get(availableId)

    if (windowInfo) {
      windowInfo.isBusy = true
      this.availableIds.delete(availableId)
      return windowInfo.window
    }

    return null
  }


  useWindow(options = {
    name: this.baseWindowName,
    data: {},
    url: '',
    show: true,
  }) {
    try {
      const window = this.getAvailableWindow()
      if (window) {
        loadUrl(window, options.url)
        // 拓展：可以在这添加路由初始化逻辑
        // ipcMainService.send("app:window:init-route", {
        //   name,
        //   query,
        //   params,
        //   state
        // }, canUseWindow.webContents.id)
        window.show()
        return {
          success: true,
          windowId: window.id,
        }
      }
      return null
    } catch (error) {
      console.log('error: ', error);
      return null
    }
  }

  /**
   * 释放一个窗口，使其重新可用
   */
  releaseWindow(windowId: number): void {
    const windowInfo = this.pool.get(windowId)
    if (windowInfo) {
      windowInfo.isBusy = false
      windowInfo.routeName = undefined
      this.availableIds.add(windowId)
      
      // 重置窗口状态
      const window = windowInfo.window
      if (!window.isDestroyed()) {
        window.hide()
        // 可以在这里添加更多的窗口重置逻辑
      }
    }
  }

  /**
   * 获取窗口池中的所有窗口
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.pool.values()).map(info => info.window)
  }

  /**
   * 获取可用窗口数量
   */
  getAvailableCount(): number {
    return this.availableIds.size
  }

  /**
   * 获取窗口池大小
   */
  getPoolSize(): number {
    return this.pool.size
  }

  /**
   * 设置窗口路由信息
   */
  setWindowRoute(windowId: number, routeName: string): void {
    const windowInfo = this.pool.get(windowId)
    if (windowInfo) {
      windowInfo.routeName = routeName
    }
  }

  /**
   * 根据路由名获取窗口
   */
  getWindowByRoute(routeName: string): BrowserWindow | null {
    for (const [id, info] of this.pool.entries()) {
      if (info.routeName === routeName) {
        return info.window
      }
    }
    return null
  }

  /**
   * 根据ID获取窗口
   */
  getWindowById(windowId: number): BrowserWindow | null {
    const windowInfo = this.pool.get(windowId)
    return windowInfo ? windowInfo.window : null
  }

  getInstance() {
    return this
  }

  /**
   * 调整窗口池大小
   */
  resize(newSize: number): void {
    if (newSize <= 0) {
      throw new Error("Window pool size must be greater than 0.")
    }

    const currentSize = this.pool.size

    if (newSize > currentSize) {
      // 扩大窗口池
      for (let i = currentSize; i < newSize; i++) {
        this.generateWindow()
      }
    } else if (newSize < currentSize) {
      // 缩小窗口池，只保留可用窗口
      const availableWindows = Array.from(this.availableIds).slice(0, newSize)
      
      // 销毁多余的窗口
      for (const [id, info] of this.pool.entries()) {
        if (!availableWindows.includes(id) && !info.isBusy) {
          info.window.destroy()
          this.pool.delete(id)
          this.availableIds.delete(id)
        }
      }
    }

    this.maxSize = newSize
  }

  /**
   * 清空窗口池
   */
  clear(): void {
    for (const [id, info] of this.pool.entries()) {
      if (!info.window.isDestroyed()) {
        info.window.destroy()
      }
    }
    this.pool.clear()
    this.availableIds.clear()
  }
}

export const windowPoolManager = new WindowPool()

// 注册全局事件
export const registerWindowPoolEvents = () => {
  ipcMainService.on("app:windowpool:open", (event, options) => {
    console.log('options: ', options);
    windowPoolManager.useWindow(options)
  })
  ipcMainService.on("app:windowpool:close", (event, windowId) => {
    windowPoolManager.releaseWindow(windowId)
  })
}
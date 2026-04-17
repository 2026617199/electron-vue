<template>
  <div class="mini-window"
       :class="{ 'expanded': isExpanded }"
       @mousedown="handleMouseDown"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave">
    <!-- 折叠状态 -->
    <div class="mini-content">
      <span class="mini-bg"></span>
    </div>
    
    <!-- 展开状态 -->
    <div class="expanded-content" @click.stop>
      <div class="actions">
        <div class="action-item" @click="handleAction('restore')">
          <el-icon><FullScreen /></el-icon>
          <span>{{ $t('MINI_WINDOW.RESTORE') }}</span>
        </div>
        <div class="action-item" @click="handleAction('settings')">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </div>
        <div class="action-item" @click="handleAction('dashboard')">
          <el-icon><House /></el-icon>
          <span>{{ $t('MINI_WINDOW.DASHBOARD') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { House, Setting, FullScreen, Close } from '@element-plus/icons-vue'
import { ipcRenderService } from '@/renderer/services/ipcService'

const isExpanded = ref(false)
let isDragging = false
let initialMouseX = 0
let initialMouseY = 0
let mouseDownTime = 0
let windowInitialX = 0
let windowInitialY = 0

// 处理鼠标按下事件
const handleMouseDown = (e: MouseEvent) => {
  if (isExpanded.value) return // 展开状态不允许拖动
  
  isDragging = false
  initialMouseX = e.screenX // 使用screenX/screenY获取相对于屏幕的坐标
  initialMouseY = e.screenY
  mouseDownTime = Date.now()
  // 获取窗口初始位置
  ipcRenderService.invoke('app:window:get-position').then(([x, y]: [number, number]) => {
    windowInitialX = x
    windowInitialY = y
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })
}

// 处理鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
  const deltaX = e.screenX - initialMouseX
  const deltaY = e.screenY - initialMouseY
  
  // 判断是否达到拖动阈值
  if (!isDragging && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
    isDragging = true
  }

  if (isDragging) {
    // 计算新位置
    const newX = windowInitialX + deltaX
    const newY = windowInitialY + deltaY
    
    // 发送新位置到主进程
    ipcRenderService.send('app:window:set-position', { x: newX, y: newY })
  }
}

const handleMouseUp = () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  // 如果不是拖拽且点击时间小于200ms，则触发展开/收起
  if (!isDragging && (Date.now() - mouseDownTime < 200)) {
    toggleExpand()
  }
}

const handleMouseEnter = () => {
  ipcRenderService.send('app:window:mouse-enter')
}

const handleMouseLeave = () => {
  ipcRenderService.send('app:window:mouse-leave')
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleAction = (action: string) => {
  switch (action) {
    case 'restore':
      ipcRenderService.send('app:window:restore-main')
      break
    case 'dashboard':
      ipcRenderService.send('app:window:restore-main', { route: 'INDEX' })
      break
    case 'settings':
      ipcRenderService.send('app:window:restore-main', { route: 'SETTINGS' })
      break
  }
  isExpanded.value = false
}

// 监听主进程发来的事件
onMounted(() => {
  ipcRenderService.on('app:window:mouse-enter', () => {
    // 可以在这里处理鼠标进入事件
  })
  
  ipcRenderService.on('app:window:mouse-leave', () => {
    // 可以在这里处理鼠标离开事件
  })
})
</script>

<style lang="scss" scoped>
$ease: cubic-bezier(0.22, 1, 0.32, 1);
$dur: 0.35s;
$expanded-width: 160px;
$expanded-height: 150px;
$collapsed-size: 50px;

.mini-window {
  position: relative;
  width: $expanded-width;
  height: $expanded-height;
  margin-left: 15px;
  margin-top: 9px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  user-select: none;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  transform-origin: right bottom;
  transform: scale(calc($collapsed-size / $expanded-width));
  transition: transform $dur $ease;
  
  &.expanded {
    transform: scale(1);
    
    .mini-content {
      opacity: 0;
      pointer-events: none;
    }
    
    .expanded-content {
      opacity: 1;
      pointer-events: auto;
    }
  }
  
  .mini-content {
    position: absolute;
    bottom: 1px;
    right: 5px;
    opacity: 1;
    pointer-events: auto;
    transition: opacity 0.2s ease-out;
    transform: translateZ(0);
    
    .mini-bg {
      cursor: pointer;
      display: inline-block;
      background: linear-gradient(130deg, var(--primary) 30%, var(--secondary) 70%);
      width: 40px;
      height: 40px;
      border-radius: 20px;
    }
  }
  
  .expanded-content {
    position: absolute;
    inset: 0;
    opacity: 0;
    padding: 9px 12px;
    pointer-events: none;
    transition: opacity 0.2s ease-out;
    transition-delay: 0.08s;
    transform: translateZ(0);
    
    .actions {
      display: flex;
      flex-direction: column-reverse;
      gap: 8px;
      
      .action-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s ease, box-shadow 0.2s ease;
        color: var(--ep-color-primary);
        
        .el-icon {
          font-size: 18px;
        }
        
        span {
          font-size: 14px;
        }
        
        &:hover {
          background-color: var(--bg-hover);
          box-shadow: inset 0 0 0 1px var(--border-color);
        }
      }
    }
  }
}

.mini-window:not(.expanded) .expanded-content {
  transition-delay: 0s;
}
</style>
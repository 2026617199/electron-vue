<template>
  <div class="avatar-tooltip-container">
    <!-- 触发区域 -->
    <div
      ref="triggerRef"
      class="trigger-area"
      :class="triggerClasses"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <slot name="trigger">
        <div class="default-trigger">
          <img :src="getIconUrl(avatar)" :alt="displayName" class="avatar-img" />
        </div>
      </slot>
    </div>

    <!-- 提示框 -->
    <teleport to="body">
      <transition
        :name="transitionName"
        @after-enter="afterEnter"
        @after-leave="afterLeave"
      >
        <div
          ref="tooltipRef"
          class="avatar-tooltip"
          :class="tooltipClasses"
          :style="tooltipStyle"
          @mouseenter="handleTooltipMouseEnter"
          @mouseleave="handleTooltipMouseLeave"
        >
          <!-- 玻璃质感背景 -->
          <div class="glass-background"></div>
          
          <!-- 内容区域 -->
          <div class="tooltip-content">
            <!-- 头部区域 -->
            <div class="tooltip-header">
              <div class="avatar-container">
                <img :src="getIconUrl(avatar)" :alt="displayName" class="tooltip-avatar" />
                <div v-if="isVip" class="vip-badge">
                  <svg viewBox="0 0 24 24" class="vip-icon">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              </div>
              
              <div class="user-info">
                <h3 class="user-name">{{ name }}</h3>
                <div class="user-title">{{ title }}</div>
              </div>
            </div>
            
            <!-- 会员状态 -->
            <div v-if="isVip" class="membership-section">
              <div class="membership-badge">{{ $t('COMMON.VIP_BADGE') }}</div>
              <div class="membership-expiry">{{ $t('COMMON.MEMBERSHIP_VALID_UNTIL', { date: membershipExpiry }) }}</div>
            </div>
            
            <!-- 详细信息 -->
            <div class="details-section">
              <div class="detail-item" v-if="phone">
                <svg viewBox="0 0 24 24" class="detail-icon">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.75 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                </svg>
                <span class="detail-text">{{ phone }}</span>
              </div>
              
              <div class="detail-item" v-if="email">
                <svg viewBox="0 0 24 24" class="detail-icon">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                </svg>
                <span class="detail-text">{{ email }}</span>
              </div>
              
              <div class="detail-item" v-if="department">
                <svg viewBox="0 0 24 24" class="detail-icon">
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
                </svg>
                <span class="detail-text">{{ displayDepartment }}</span>
              </div>
              
              <div class="detail-item" v-if="location">
                <svg viewBox="0 0 24 24" class="detail-icon">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
                </svg>
                <span class="detail-text">{{ location }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons" v-if="showActions">
              <button class="action-btn message-btn" @click="handleMessage">
                {{ $t('COMMON.MEMBER_MANAGE') }}
              </button>
              <button class="action-btn profile-btn" @click="handleQuit">
                {{ $t('COMMON.DIALOG_QUIT_APP') }}
              </button>
            </div>
          </div>
          
          <!-- 箭头 -->
          <div class="tooltip-arrow" :style="arrowStyle"></div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // 触发方式：hover 或 click
  trigger: {
    type: String,
    default: 'hover',
    validator: (value) => ['hover', 'click'].includes(value)
  },

  // 动画类型
  animation: {
    type: String,
    default: 'fade', // 支持: fade, slide, zoom, bounce
    validator: (value) => ['fade', 'slide', 'zoom', 'bounce'].includes(value)
  },
  
  // 动画时长
  duration: {
    type: Number,
    default: 300
  },
  
  // 动画方向（针对 slide 动画）
  animationDirection: {
    type: String,
    default: 'up', // 支持: up, down, left, right
    validator: (value) => ['up', 'down', 'left', 'right'].includes(value)
  },
  
  // 提示框显示位置
  placement: {
    type: String,
    default: 'top',
    validator: (value) => [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end'
    ].includes(value)
  },
  
  // 用户信息
  avatar: {
    type: String,
    default: 'avatar.jpg'
  },
  name: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: 'xxx-xxxx-xxxx'
  },
  email: {
    type: String,
    default: 'xxxx@example.com'
  },
  department: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'xxxxx'
  },
  isVip: {
    type: Boolean,
    default: true
  },
  membershipExpiry: {
    type: String,
    default: '2030-12-31'
  },
  
  // 显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  
  // 延迟显示/隐藏（毫秒）
  delay: {
    type: Number,
    default: 100
  }
})

const displayName = computed(() => props.name || t('COMMON.SIDEBAR_APP_TITLE'))
const displayTitle = computed(() => props.title || t('COMMON.SIDEBAR_USER_ROLE'))
const displayDepartment = computed(() => props.department || t('COMMON.DEPT_RD'))

const emit = defineEmits(['message', 'view-profile'])

// 响应式数据
const showTooltip = ref(false)
const triggerRef = ref(null)
const tooltipRef = ref(null)
const tooltipPosition = ref({ top: 0, left: 0 })
const arrowPosition = ref({})
// 新增响应式数据
const isAnimating = ref(false)

let showTimeout = null
let hideTimeout = null

// 计算过渡类名
const transitionName = computed(() => {
  if (props.animation === 'slide') {
    return `slide-${props.animationDirection}`
  }
  return props.animation
})

// 计算属性
const triggerClasses = computed(() => ({
  'trigger-click': props.trigger === 'click'
}))

const tooltipClasses = computed(() => ({
  'tooltip-visible': showTooltip.value
}))

// 动画钩子
const afterEnter = () => {
  isAnimating.value = false
}

const afterLeave = () => {
  isAnimating.value = false
}

// 工具函数：获取位置偏移
function calculatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  
  let top = 0
  let left = 0
  let arrowTop = '50%'
  let arrowLeft = '50%'
  let arrowTransform = ''
  
  // 计算主位置
  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollY - tooltipRect.height - 10
      left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
      arrowTop = '100%'
      arrowLeft = '50%'
      arrowTransform = 'translateX(-50%) translateY(50%) rotate(45deg)'
      break
      
    case 'top-start':
      top = triggerRect.top + scrollY - tooltipRect.height - 10
      left = triggerRect.left + scrollX
      arrowTop = '100%'
      arrowLeft = '20px'
      arrowTransform = 'translateY(50%) rotate(45deg)'
      break
      
    case 'top-end':
      top = triggerRect.top + scrollY - tooltipRect.height - 10
      left = triggerRect.left + scrollX + triggerRect.width - tooltipRect.width
      arrowTop = '100%'
      arrowLeft = 'calc(100% - 20px)'
      arrowTransform = 'translateY(50%) rotate(45deg)'
      break
      
    case 'bottom':
      top = triggerRect.bottom + scrollY + 10
      left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
      arrowTop = '0%'
      arrowLeft = '50%'
      arrowTransform = 'translateX(-50%) translateY(-50%) rotate(45deg)'
      break
      
    case 'bottom-start':
      top = triggerRect.bottom + scrollY + 10
      left = triggerRect.left + scrollX
      arrowTop = '0%'
      arrowLeft = '20px'
      arrowTransform = 'translateY(-50%) rotate(45deg)'
      break
      
    case 'bottom-end':
      top = triggerRect.bottom + scrollY + 10
      left = triggerRect.left + scrollX + triggerRect.width - tooltipRect.width
      arrowTop = '0%'
      arrowLeft = 'calc(100% - 20px)'
      arrowTransform = 'translateY(-50%) rotate(45deg)'
      break
      
    case 'left':
      top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.left + scrollX - tooltipRect.width - 10
      arrowTop = '50%'
      arrowLeft = '100%'
      arrowTransform = 'translateX(50%) translateY(-50%) rotate(45deg)'
      break
      
    case 'left-start':
      top = triggerRect.top + scrollY
      left = triggerRect.left + scrollX - tooltipRect.width - 10
      arrowTop = '20px'
      arrowLeft = '100%'
      arrowTransform = 'translateX(50%) rotate(45deg)'
      break
      
    case 'left-end':
      top = triggerRect.bottom + scrollY - tooltipRect.height
      left = triggerRect.left + scrollX - tooltipRect.width - 10
      arrowTop = 'calc(100% - 20px)'
      arrowLeft = '100%'
      arrowTransform = 'translateX(50%) rotate(45deg)'
      break
      
    case 'right':
      top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.right + scrollX + 10
      arrowTop = '50%'
      arrowLeft = '0%'
      arrowTransform = 'translateX(-50%) translateY(-50%) rotate(45deg)'
      break
      
    case 'right-start':
      top = triggerRect.top + scrollY
      left = triggerRect.right + scrollX + 10
      arrowTop = '20px'
      arrowLeft = '0%'
      arrowTransform = 'translateX(-50%) rotate(45deg)'
      break
      
    case 'right-end':
      top = triggerRect.bottom + scrollY - tooltipRect.height
      left = triggerRect.right + scrollX + 10
      arrowTop = 'calc(100% - 20px)'
      arrowLeft = '0%'
      arrowTransform = 'translateX(-50%) rotate(45deg)'
      break
  }
  
  // 边界检查，确保提示框在视口内
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 水平边界检查
  if (left < 10) left = 10
  if (left + tooltipRect.width > viewportWidth - 10) {
    left = viewportWidth - tooltipRect.width - 10
  }
  
  // 垂直边界检查
  if (top < 10) top = 10
  if (top + tooltipRect.height > scrollY + viewportHeight - 10) {
    top = scrollY + viewportHeight - tooltipRect.height - 10
  }
  
  tooltipPosition.value = { top, left }
  arrowPosition.value = { top: arrowTop, left: arrowLeft, transform: arrowTransform }
}

const getIconUrl = (iconPath) => {
    return new URL(`../../assets/${iconPath}`, import.meta.url).href
}

// 工具函数：显示提示框
function showTooltipWithDelay() {
  clearTimeout(hideTimeout)
  
  if (!showTooltip.value && !isAnimating.value) {
    showTimeout = setTimeout(() => {
      isAnimating.value = true
      showTooltip.value = true
      // 在下一个tick计算位置
      setTimeout(() => {
        if (tooltipRef.value) {
          calculatePosition()
        }
      }, 10)
    }, props.delay)
  }
}

// 工具函数：隐藏提示框
function hideTooltipWithDelay() {
  clearTimeout(showTimeout)
  
  if (showTooltip.value && !isAnimating.value) {
    isAnimating.value = true
    hideTimeout = setTimeout(() => {
      showTooltip.value = false
    }, props.delay)
  }
}

// 事件处理函数
function handleMouseEnter() {
  if (props.trigger === 'hover') {
    showTooltipWithDelay()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hideTooltipWithDelay()
  }
}

function handleClick() {
  if (props.trigger === 'click') {
    if (!showTooltip.value) {
      showTooltip.value = true
      // 在下一个tick计算位置
      setTimeout(() => {
        if (tooltipRef.value) {
          calculatePosition()
        }
      }, 10)
    } else {
      showTooltip.value = false
    }
  }
}

function handleTooltipMouseEnter() {
  if (props.trigger === 'hover') {
    clearTimeout(hideTimeout)
  }
}

function handleTooltipMouseLeave() {
  if (props.trigger === 'hover') {
    hideTooltipWithDelay()
  }
}

function handleMessage() {
  emit('message', props.name)
  if (props.trigger === 'click') {
    showTooltip.value = false
  }
}

function handleQuit() {
  emit('quit', props.name)
  if (props.trigger === 'click') {
    showTooltip.value = false
  }
}

// 样式计算属性
const tooltipStyle = computed(() => ({
  top: `${tooltipPosition.value.top}px`,
  left: `${tooltipPosition.value.left}px`
}))

const arrowStyle = computed(() => ({
  top: arrowPosition.value.top,
  left: arrowPosition.value.left,
  transform: arrowPosition.value.transform
}))

// 监听窗口变化和滚动，重新计算位置
function updatePosition() {
  if (showTooltip.value && tooltipRef.value) {
    calculatePosition()
  }
}

// 点击外部关闭提示框
function handleClickOutside(event) {
  if (
    props.trigger === 'click' && 
    showTooltip.value &&
    triggerRef.value &&
    !triggerRef.value.contains(event.target) &&
    tooltipRef.value &&
    !tooltipRef.value.contains(event.target)
  ) {
    showTooltip.value = false
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(showTimeout)
  clearTimeout(hideTimeout)
})

// 监听props变化
watch(() => props.placement, () => {
  if (showTooltip.value) {
    setTimeout(() => {
      calculatePosition()
    }, 10)
  }
})
</script>

<style scoped>
.avatar-tooltip-container {
  display: inline-block;
  position: relative;
}

/* 触发区域样式 */
.trigger-area {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.trigger-area:hover {
  transform: scale(1.05);
}

.trigger-click {
  cursor: pointer;
}

.default-trigger .avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 提示框样式 */
.avatar-tooltip {
  position: fixed;
  z-index: 9999;
  min-width: 280px;
  max-width: 320px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1), 
              0 8px 16px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.avatar-tooltip.tooltip-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* 玻璃质感背景 */
/* 方案一 */
/* .glass-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.281) 0%, 
    rgba(255, 255, 255, 0.15) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
} */

/* 方案二：感觉不够好看 */
.glass-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  overflow: hidden;
  z-index: -1;
}

.glass-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.85) 50%,
    rgba(255, 255, 255, 0.75) 100%
  );
  backdrop-filter: none;
}

.dark .glass-background::before {
  background: linear-gradient(
    135deg,
    #0f172aec 0%,
    #0f172ae5 50%,
    #0f172acf 100%
  );
}

/* 内容区域 */
.tooltip-content {
  position: relative;
  z-index: 1;
  padding: 24px;
  color: #333;
}

/* 头部区域 */
.tooltip-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  margin-right: 16px;
}

.tooltip-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.vip-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.vip-icon {
  width: 16px;
  height: 16px;
  fill: white;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-title {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 会员区域 */
.membership-section {
  background: linear-gradient(90deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.membership-badge {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.membership-expiry {
  font-size: 12px;
  color: var(--text-primary);
}

/* 详细信息区域 */
.details-section {
  margin-bottom: 20px;
  color: var(--text-primaryt)
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.detail-icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  fill: var(--primary);
  opacity: 0.8;
}

.detail-text {
  font-size: 14px;
  color: var(--text-primary);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-btn {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: white;
}

.message-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(124, 58, 237, 0.3);
}

.profile-btn {
  background: rgba(255, 255, 255, 0.6);
  color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

/* 箭头 */
.tooltip-arrow {
  position: absolute;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0.15) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: -1;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .avatar-tooltip {
    max-width: 280px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration, 300ms) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 上滑动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--duration, 300ms) ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 下滑动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration, 300ms) ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 左滑动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all var(--duration, 300ms) ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 右滑动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--duration, 300ms) ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 缩放动画 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all var(--duration, 300ms) cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.zoom-enter-to,
.zoom-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 弹跳动画 */
.bounce-enter-active {
  animation: bounce-in var(--duration, 300ms) ease;
}

.bounce-leave-active {
  animation: bounce-out var(--duration, 300ms) ease;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
  80% {
    opacity: 1;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  20% {
    opacity: 0.9;
    transform: scale(1.05);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* 在根元素添加CSS变量 */
.avatar-tooltip-container {
  --duration: 300ms;
}

/* 更新tooltip容器样式，移除原有的过渡效果 */
.avatar-tooltip {
  /* 移除原有的 transition 属性 */
  /* transition: opacity var(--animation-duration, 300ms) ease, transform var(--animation-duration, 300ms) ease; */
  
  /* 只保留固定样式 */
  position: fixed;
  z-index: 9999;
  min-width: 280px;
  max-width: 320px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 
              0 8px 16px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

/* 显示时启用指针事件 */
.avatar-tooltip.tooltip-visible {
  pointer-events: auto;
}
</style>
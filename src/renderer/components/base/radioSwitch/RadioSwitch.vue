<template>
  <div class="radio-switcher">
    <!-- 高亮元素 -->
    <div 
      class="radio-switcher__highlight"
      :style="highlightStyle"
    ></div>
    <button 
      :class="['radio-btn', { active: modelValue === activeValue }]"
      @click="handleRadioClick(activeValue, $event)"
    >
      {{ openLabel }}
    </button>
    <button 
      :class="['radio-btn', { active: modelValue === inactiveValue }]"
      @click="handleRadioClick(inactiveValue, $event)"
    >
      {{ closeLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['update:modelValue', 'change'])

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: [Boolean, Number, String],
    default: false
  },
  activeValue: {
    type: [Boolean, Number, String],
    default: true
  },
  inactiveValue: {
    type: [Boolean, Number, String],
    default: false
  },
  openText: {
    type: String,
    default: '',
  },
  closeText: {
    type: String,
    default: '',
  },
})

const openLabel = computed(() => props.openText || t('SETTINGS.SWITCH_ON'))
const closeLabel = computed(() => props.closeText || t('SETTINGS.SWITCH_OFF'))

// 高亮元素样式计算属性
const highlightStyle = computed(() => {
  // 根据当前选中的值确定高亮元素的位置
  const isActive = props.modelValue === props.activeValue
  return {
    transform: `translateX(${isActive ? '0%' : '100%'})`,
  }
})

// 处理点击事件
const handleRadioClick = (value: typeof props.activeValue | typeof props.inactiveValue, event: MouseEvent) => {
  // 更新双向绑定值
  emit('update:modelValue', value)
  // 触发change事件，同时传递value和事件对象
  emit('change', value, event)
}

</script>

<style lang="scss" scoped>

// 模式切换器
.radio-switcher {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 10px;
  padding: 4px;
  position: relative;
  overflow: hidden;

  // 高亮元素
  &__highlight {
    position: absolute;
    top: 4px;
    left: 4px;
    bottom: 4px;
    width: calc(50% - 4px);
    background: var(--primary);
    border-radius: 8px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 1;
  }

  .radio-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    transition: color 0.2s;
    position: relative;
    z-index: 2;
    flex: 1;
    justify-content: center;

    &.active {
      color: white;
    }

    &:hover:not(.active) {
      color: var(--text-primary);
    }
  }
}
</style>
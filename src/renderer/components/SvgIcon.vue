<template>
  <!-- 支持本地 SVG 图标和在线 SVG 图标 -->
  <div v-if="isOnlineSvg" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-bind="$attrs" />
  <!-- vue3通过v-bind绑定父组件传递的数据或者子组件触发的事件 -->
  <svg v-else :class="svgClass" aria-hidden="true" v-bind="$attrs">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang='ts'>
import { isExternal } from '@/renderer/utils/validate'

// 使用姿势
// <svg-icon class-name="icon" icon-class="lang"></svg-icon>
// <svg-icon class-name="icon" icon-class="https://img.alicdn.com/imgextra/i2/O1CN01FF1t1g1Q3PDWpSm4b_!!6000000001920-55-tps-508-135.svg"></svg-icon>

const props = defineProps({
  iconClass: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})

const isOnlineSvg = computed(() => isExternal(props.iconClass))

const iconName = computed(() => `#icon-${props.iconClass}`)

const styleExternalIcon = computed(() => {
  return {
    mask: `url(${props.iconClass}) no-repeat 50% 50%`,
    '-webkit-mask': `url(${props.iconClass}) no-repeat 50% 50%`
  }
})

const svgClass = computed(() => {
  if (props.className) {
    return 'svg-icon ' + props.className
  } else {
    return 'svg-icon'
  }
})

</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
</style>

<script setup lang='ts'>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
})

</script>

<template>
  <div class="card-item">
    <div class="card-item-title">{{ title }}</div>
    <div class="card-item-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-item {
  // border-radius: 5px;
  // box-shadow: 0 0px 7px rgba(0, 0, 0, 0.1);
  // @include useTheme {
  //   background: getVar('card-bg-color') !important;
  //   border: 1px solid getVar('border-color') !important;
  // }
  // background: var(--bg-primary);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
  transition: background-color var(--theme-transition), border-color var(--theme-transition);
  &-title {
    font-size: 16px;
    font-weight: bold;
    padding: 10px 16px;
    position: relative;
    display: flex;
    align-items: center;
    
    // 添加左侧装饰条
    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: var(--primary);
      border-radius: 2px;
      margin-right: 8px;
    }
    
  }
  &-content {
    padding: 15px;
    font-size: 13px;
  }
  &+.card-item {
    margin-top: 10px;
  }
}
</style>

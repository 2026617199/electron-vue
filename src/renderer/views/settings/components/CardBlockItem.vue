vue
<template>
  <div class="card-item">
    <div class="card-item-title">
      <div class="card-item-title_text">{{ title }}</div>
      <span class="card-item-title_desc">
        <!-- 使用插槽 -->
        <slot name="description">
          {{ description }}
        </slot>
      </span>
    </div>
    <div class="card-item-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.card-item {
  position: relative;
  background: var(--card-bg);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-title {
    font-size: 14px;
    font-weight: bold;
    padding: 10px 16px;
    position: relative;

    &_text {
      flex: 1;
    }

    &_desc {
      font-size: 12px;
      color: var(--gray);
    }
  }

  &-content {
    padding: 15px;
    font-size: 13px;
  }

  &+.card-item {
    margin-top: 10px;
    border-top: 1px solid var(--border-color);
  }
}
</style>
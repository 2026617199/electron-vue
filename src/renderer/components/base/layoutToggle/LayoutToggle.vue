<template>
  <div class="layout-toggle-container">
    <div class="layout-toggle-sidebar" :class="{ 'expanded': !sidebarExpanded }">
      <slot name="left" :menu="{
        expanded: sidebarExpanded
      }"></slot>
    </div>
    
    <div class="layout-toggle-content">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useSettingsStore } from '@/renderer/store/settingsStore'

const settingsStore = useSettingsStore()

const sidebarExpanded = computed(() => settingsStore.sideBarExpanded)

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['update:modelValue']);

function toggleMenu() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<style lang="scss" scoped>
.layout-toggle {

  &-container {
    display: flex;
    height: 100%;
    width: 100%;
  }
  &-content {
    flex: 1;
    min-width: 0;
  }
  &-sidebar {
    background: var(--bg-secondary);
    width: $siderBarWidth;
    position: relative;
    flex-shrink: 0;
    // transition: width 0.3s ease;
    overflow: hidden;
    transition: width 0.3s ease, background-color 0.4s ease, border-color 0.4s ease;
    &.expanded {
      width: 72px;
    }
  }
  .expanded {
      width: 72px;
  }
  &-icon {
    position: absolute;
    right: -12px;
    top: 15px;
    height: 24px;
    width: 24px;
    cursor: pointer;
    text-align: center;
    border: 1px solid var(--ep-border-color);
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 4px 0px rgba(0, 0, 0, .06);
    color: rgb(51, 54, 57);
    transition: transform 0.3s ease-in-out;
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

</style>
<template>
  <div class="app-top-bar">
    <div class="left-block">
      <img src="@/assets/icon/test.png" alt="">
      <span class="app-name">{{ appInfo.name }}</span>
    </div>
    <div class="right-block">
      <LoginTopBar :isMac="isMac"></LoginTopBar>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import LoginTopBar from '@/renderer/components/base/loginTopBar/LoginTopBar.vue'
import { appInfo } from '@/renderer/consts/appInfo'

const isMac = ref(false)

</script>

<style lang="scss" scoped>
.app-top-bar {
  display: flex;
  backdrop-filter: blur(20px);
  background: var(--bg-secondary);
  transition: width 0.3s ease,
        background-color var(--theme-transition),
        border-color var(--theme-transition);
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  padding: 0 10px;
  border-bottom: 1px solid var(--border-color);
  .left-block {
    display: flex;
    align-items: center;
    img {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
    .app-name {
      font-size: 14px;
      font-weight: bold;
      color: var(--text-primary);
      
    }
  }
}
</style>

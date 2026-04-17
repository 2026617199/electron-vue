<template>
  <div class="common-top-wrap">
    <div class="title">
      <img src="@/assets/icon/test.png" alt="">
      {{ appInfo.name }}
    </div>
    <el-space
      wrap
    >
      <el-button @click="handleAction('fullscreen')" plain text size="small">
        <el-icon><FullScreen /></el-icon>
      </el-button>
      <el-button @click="handleAction('minus')" plain text size="small">
        <el-icon><Minus /></el-icon>
      </el-button>
      <el-button @click="handleAction('close')" plain class="close-btn" text size="small">
        <el-icon><CloseBold /></el-icon>
      </el-button>
    </el-space>
  </div>
</template>

<script setup lang='ts'>
import { FullScreen, Minus, CloseBold } from '@element-plus/icons-vue'
import { setLanguage } from '@/common/locales/index'
import { UseWindow } from '@/renderer/hooks/useWindow'
import { ipcRenderService } from '@/renderer/services/ipcService';
import { appInfo } from '@/renderer/consts/appInfo';

const props = defineProps({
  title: {
    type: String,
    default: 'electron-app'
  }
})

const { close, minimize } = UseWindow()

const handleAction = (actionType: 'minus' | 'close' | 'fullscreen' | 'darkmode', eventObj = null) => {
  if (actionType === 'close') {
    ipcRenderService.send('app:window:close')
  }
  if (actionType === 'minus') {
    minimize()
  }
  if (actionType === 'fullscreen') {
    ipcRenderService.send('app:window:maximize')
  }
}

const handleLanCommand = (value: "cn" | "en") => {
  console.log(value)
  setLanguage(value)
}

</script>

<style lang="scss" scoped>
.common-top-wrap {
  display: flex;
  -webkit-app-region: drag;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid var(--border-color);
  .title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    font-weight: bold;
    font-size: 14px;
    img {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
  }
  .ep-button.is-text:not(.is-disabled):focus-visible {
    outline: none;
  }
  :deep(.ep-button) {
    -webkit-app-region: no-drag;
  }
  .close-btn:hover {
    background-color: #f56c6c;
    color: #fff;
  }
}
</style>

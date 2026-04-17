<template>
  <div class="login-top-wrap">
    <el-space v-if="isMac" wrap>
      <div class="title-bar">
          <div class="controls">
            <span @click="handleAction('close')" class="close"><el-icon><CloseBold /></el-icon></span>
            <span @click="handleAction('minus')" class="min"><el-icon><SemiSelect /></el-icon></span>
            <span @click="handleAction('fullscreen')" class="max"><el-icon><DCaret /></el-icon></span>
          </div>
      </div>
    </el-space>
    <el-space
      v-else
      wrap
    >
      <el-button @click="handleAction('darkmode', $event)" plain text size="small">
        <el-icon v-if="currentMode === 'dark'"><Sunny /></el-icon>
        <el-icon v-else><Moon /></el-icon>
      </el-button>
      <el-dropdown @command="handleLanCommand" trigger="click">
        <el-button plain text size="small">
          <svg-icon icon-class="lang"></svg-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="cn">{{ $t('COMMON.MENU.SIMPLE_CHINESE') }}</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
import { FullScreen, Sunny, Moon, Minus, CloseBold, SemiSelect, DCaret } from '@element-plus/icons-vue'
import { setLanguage } from '@/common/locales/index'
import { UseWindow } from '@/renderer/hooks/useWindow'
import { ipcRenderService } from '@/renderer/services/ipcService';
import { UseDark } from '@/renderer/hooks/useDark'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/renderer/store/settingsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  isMac: {
    type: Boolean,
    default: false
  }
})

const { close, minimize } = UseWindow()
const { toggleDark } = UseDark()

const settingsStore = useSettingsStore()

const currentMode = computed(() => settingsStore.currentMode)

const handleAction = (actionType: 'minus' | 'close' | 'fullscreen' | 'darkmode', eventObj?: MouseEvent) => {
  if (actionType === 'close') {
    ElMessageBox.confirm(
      t('COMMON.DIALOG_CONFIRM_QUIT'),
      t('COMMON.DIALOG_TIP'),
      {
        confirmButtonText: t('COMMON.DIALOG_QUIT_APP'),
        cancelButtonText: t('COMMON.DIALOG_MINIMIZE_TRAY'),
        distinguishCancelAndClose: true
      }
    )
      .then(() => {
        ipcRenderService.send('app:quit')
      })
      .catch((action) => {
        if (action === 'cancel') {
          ipcRenderService.send('app:window:hide')
        }
      })
  }
  if (actionType === 'minus') {
    minimize()
  }
  if (actionType === 'darkmode' && eventObj) {
    void toggleDark(eventObj)
  }
  if (actionType === 'fullscreen') {
    ipcRenderService.send('app:window:maximize')
  }
}

const handleLanCommand = (value: "cn" | "en") => {
  setLanguage(value)
}

</script>

<style lang="scss" scoped>
.login-top-wrap {
  display: flex;
  -webkit-app-region: drag;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 0;
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
  // mac 标题栏
  .title-bar {
    width: 100%;
    height: 25px;
    z-index: 9999;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 4px;
    -webkit-app-region: drag; /* Electron 拖拽属性 */
    
    & .controls {
        display: flex;
        gap: 8px;
        -webkit-app-region: no-drag;
        
        & span {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--border-glass);
            cursor: pointer;
            transition: var(--transition);
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover { opacity: 0.8; }
            &.close { background: #ef4444; }
            &.min { background: #eab308; }
            &.max { background: #22c55e; }
        }
    }
}
}
</style>

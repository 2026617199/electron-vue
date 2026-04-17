<template>
  <div class="setting-wrap">
    <CardBlock :title="$t('SETTINGS.APPEARANCE')" class="setting-card">
      <CardBlockItem :title="$t('SETTINGS.THEME_COLOR')">
        <template #description>
          {{ $t('SETTINGS.THEME_COLOR_DESC', { current: currentThemeLabel }) }}
        </template>
        <div class="color-options">
          <div 
              v-for="(theme, index) in themeList" 
              :key="theme.value"
              :class="['color-option', theme.value, { active: currentTheme === theme.value }]"
              :title="$t(theme.nameKey)"
              @click="handleSetCurrentTheme(theme.value, index)"
          >
              <el-icon><Select /></el-icon>
          </div>
        </div>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.DISPLAY_MODE')">
        <template #description>
          {{ $t('SETTINGS.DISPLAY_MODE_DESC', { current: currentModeLabel }) }}
        </template>
        <RadioSwitch
          v-model="currentMode"
          @change="(value, eventObj) => handleSetMode(value, eventObj)"
          active-value="light"
          inactive-value="dark"
          :open-text="$t('SETTINGS.MODE_LIGHT')"
          :close-text="$t('SETTINGS.MODE_DARK')"
        >
        </RadioSwitch>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.PAGE_LAYOUT')">
        <template #description>
          {{ $t('SETTINGS.PAGE_LAYOUT_DESC', { current: currentLayoutLabel }) }}
        </template>
        <div class="icon-container">
          <div @click="settingsStore.setLayout('vertical')" class="layout-option" :class="{'active': currentLayout === 'vertical'}">
            <svg-icon icon-class="left_right_layout" class="layout-icon"></svg-icon>
            <span>{{ $t('SETTINGS.LAYOUT_LEFT_RIGHT') }}</span>
          </div>
          <div @click="settingsStore.setLayout('horizontal')" class="layout-option" :class="{'active': currentLayout === 'horizontal'}">
            <svg-icon icon-class="top_bottom_layout" class="layout-icon"></svg-icon>
            <span>{{ $t('SETTINGS.LAYOUT_TOP_BOTTOM') }}</span>
          </div>
        </div>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.WINDOW_SIZE')" :description="$t('SETTINGS.WINDOW_SIZE_DESC')">
        <el-radio-group v-model="appSettings.windowSize" @change="windowSizeChange" class="window-size-group">
          <el-radio-button label="default">{{ $t('SETTINGS.WINDOW_SIZE_DEFAULT') }}</el-radio-button>
          <el-radio-button label="middle">{{ $t('SETTINGS.WINDOW_SIZE_MIDDLE') }}</el-radio-button>
          <el-radio-button label="big">{{ $t('SETTINGS.WINDOW_SIZE_BIG') }}</el-radio-button>
        </el-radio-group>
      </CardBlockItem>
    </CardBlock>

    <CardBlock :title="$t('SETTINGS.FEATURE_SECTION')" class="setting-card">
      <CardBlockItem :title="$t('SETTINGS.LANG_SETTING')" :description="$t('SETTINGS.LANG_SETTING_DESC')">
        <RadioSwitch
          v-model="langType"
          @change="langTypeChanage"
          :open-text="$t('SETTINGS.LANG_CN')" :close-text="$t('SETTINGS.LANG_EN')"
          active-value="cn" inactive-value="en"
        ></RadioSwitch>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.MINI_WINDOW')" :description="$t('SETTINGS.MINI_WINDOW_DESC')">
        <RadioSwitch
          v-model="showMiniWindow"
          @change="(value) => handleShowMiniWindow(value)"
        ></RadioSwitch>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.EDGE_ADHESIVE')" :description="$t('SETTINGS.EDGE_ADHESIVE_DESC')">
        <RadioSwitch
          v-model="windowEdgeAdhesive"
          @change="(value) => settingsStore.setWindowEdgeAdhesive(value)"
        ></RadioSwitch>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.MSG_CENTER')" :description="$t('SETTINGS.MSG_CENTER_DESC')">
        <RadioSwitch
          v-model="messageCenterEnabled"
          @change="(value) => settingsStore.setMessageCenterEnabled(value)"
        ></RadioSwitch>
      </CardBlockItem>
    </CardBlock>

    <CardBlock :title="$t('SETTINGS.ABOUT_SECTION')" class="setting-card">
      <CardBlockItem :title="$t('SETTINGS.SOFTWARE_VERSION')">
        <template #description>
          <div style="width: 200px;">
            {{ $t('SETTINGS.CURRENT_VERSION') }} <span class="primary-text">{{ appInfo.version }}</span>
            <el-progress v-if="!isLatestVersion" :text-inside="true" :stroke-width="15" :percentage="downloadProgress" />
          </div>
        </template>
        <el-button type="primary" :loading="updateLoading" @click="checkUpdate" class="update-btn">{{ $t('COMMON.MENU.CHECK_UPDATE') }}</el-button>
      </CardBlockItem>
      <CardBlockItem :title="$t('SETTINGS.FEEDBACK_SECTION')">
        <template #description>
          {{ $t('SETTINGS.FEEDBACK_HINT') }}
        </template>
        <el-button type="primary" @click="feedbackHandler" class="update-btn">{{ $t('COMMON.MENU.ADVICE_CALLBACK') }}</el-button>
      </CardBlockItem>
    </CardBlock>
    <FeedbackModal v-model:visible="feedbackVisible"></FeedbackModal>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ipcRenderService } from '@/renderer/services/ipcService'
import CardBlock from '@/renderer/views/settings/components/CardBlock.vue'
import CardBlockItem from '@/renderer/views/settings/components/CardBlockItem.vue'
import { storeToRefs } from "pinia"
import { Select } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/renderer/store/settingsStore'
import { UseDark } from '@/renderer/hooks/useDark'
import RadioSwitch from '@/renderer/components/base/radioSwitch/RadioSwitch.vue'
import FeedbackModal from '@/renderer/views/settings/components/FeedbackModal.vue'
import { appInfo } from '@/renderer/consts/appInfo'
import { ElMessageBox, ElMessage } from 'element-plus'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const {
  themeList, currentMode, currentTheme, showMiniWindow, langType,
  windowEdgeAdhesive, messageCenterEnabled, currentLayout
} = storeToRefs(settingsStore)

const currentThemeLabel = computed(() => {
  const th = themeList.value.find((x: { value: string }) => x.value === currentTheme.value) as { nameKey?: string } | undefined
  return th?.nameKey ? t(th.nameKey) : t('SETTINGS.UNKNOWN_THEME')
})
const currentModeLabel = computed(() =>
  currentMode.value === 'light' ? t('SETTINGS.MODE_LIGHT_FULL') : t('SETTINGS.MODE_DARK_FULL')
)
const currentLayoutLabel = computed(() =>
  currentLayout.value === 'vertical' ? t('SETTINGS.LAYOUT_LEFT_RIGHT') : t('SETTINGS.LAYOUT_TOP_BOTTOM')
)

const { toggleDark } = UseDark()

const feedbackVisible = ref(false)
const updateLoading = ref(false)
const downloadProgress = ref(0)
const isLatestVersion = ref(true)
const updatePackageInfo = ref({
  isUpdateAvailable: false,
  versionInfo: {
    version: '',
    releaseDate: '',
  }
})

const appSettings = ref({
  isBlack: 1,
  windowSize: 'default',
  layout: 'horizontal',
  isTransparent: 1,
  closeToShowMini: 0
})

const handleSetCurrentTheme = (themeType: string, idx: number) => {
  settingsStore.setCurrentTheme(themeType)
}

const langTypeChanage = (value: 'cn' | 'en') => {
  settingsStore.langTypeChanage(value)
}

const windowSizeChange = (value: any) => {
  ipcRenderService.send('app:windowSizeChange', value)
}
const handleShowMiniWindow = (value: boolean) => {
  ipcRenderService.send('app:toggle:mini-window', value)
}

const checkUpdate = () => {
  updateLoading.value = true
  ipcRenderService.invoke('app:check-update').then((res: any) => {
    console.log('res: app:check-update', res);
    updatePackageInfo.value = res
    ElMessageBox.confirm(
      t('SETTINGS.UPDATE_AVAILABLE', { version: updatePackageInfo.value.versionInfo.version }),
      t('SETTINGS.UPDATE_TITLE'),
      {
        confirmButtonText: t('SETTINGS.DOWNLOAD_NOW'),
        cancelButtonText: t('COMMON.actions.cancel'),
        type: 'info',
        center: true,
      }
    ).then(() => {
      ipcRenderService.send('app:update-download')
    })
    .catch(() => {
    })
  }).catch((err: any) => {
    ElMessage.error(err.message || t('SETTINGS.UPDATE_CHECK_FAILED'))
  }).finally(() => {
    updateLoading.value = false
  })
}

const feedbackHandler = () => {
  feedbackVisible.value = true
}

const handleSetMode = (_mode: string, eventObj: MouseEvent) => {
  void toggleDark(eventObj)
}


onMounted(() => {
  ipcRenderService.on('app:update-info', (event: any, data: any) => {
    console.log('data: app:update-info', data);
    switch (data.type) {
      case 'update-available':
        
        break;
      case 'update-downloaded':
        ElMessageBox.confirm(
          t('SETTINGS.UPDATE_DOWNLOADED'),
          t('SETTINGS.UPDATE_TITLE'),
          {
            confirmButtonText: t('SETTINGS.INSTALL_NOW'),
            cancelButtonText: t('COMMON.actions.cancel'),
            type: 'info',
            center: true,
          }
        ).then(() => {
          ipcRenderService.send('app:update-install')
        })
        .catch(() => {
        })
        break;

      case 'download-progress':
        downloadProgress.value = parseFloat(data.data.percent.toFixed(2));
        break
      case 'update-error':
        ElMessage.error(data.data.message || t('SETTINGS.UPDATE_CHECK_FAILED'))
        break
      case 'update-not-available':
        ElMessageBox.confirm(
          t('SETTINGS.ALREADY_LATEST'),
          t('SETTINGS.UPDATE_TITLE'),
          {
            confirmButtonText: t('SETTINGS.OK'),
            showCancelButton: false,
            type: 'info',
            center: true,
          }
        ).then(() => {
        })
        .catch(() => {
        })
        break
    
      default:
        break;
    }
  });
})
</script>

<style lang="scss" scoped>
.setting-wrap {
  padding: 20px;
  .primary-text {
    color: var(--primary);
    font-weight: 600;
  }
}
.color-options {
  display: flex;
  gap: 12px;
  .color-option {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    border: 3px solid transparent;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      transform: scale(1.1);
    }
    &.active {
      border-color: var(--text-primary);
      box-shadow: 0 0 0 3px var(--primary-alpha);
    }
    i {
      color: white;
      font-size: 18px;
      opacity: 0;
      transform: scale(0);
      transition: all 0.2s;
    }
    &.active i {
      opacity: 1;
      transform: scale(1);
    }
    &.purple { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    &.pink { background: linear-gradient(135deg, #ec4899, #f472b6); }
    &.cyan { background: linear-gradient(135deg, #06b6d4, #22d3ee); }
    &.green { background: linear-gradient(135deg, #10b981, #34d399); }
    &.orange { background: linear-gradient(135deg, #f97316, #fb923c); }
  }
}

.mode-switcher {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 10px;
  padding: 4px;

  .mode-btn {
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
    transition: all 0.2s;

    &.active {
      background: var(--primary);
      color: white;
    }

    &:hover:not(.active) {
      color: var(--text-primary);
    }
  }
}
.icon-container {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  .layout-option {
    padding: 5px 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    background: var(--bg-tertiary);
    &.active {
      border: 3px solid var(--primary);
      background: var(--primary);
      color: white;
    }
    .layout-icon {
      font-size: 35px;
    }
  }
}

.toggle-switch {
  width: 50px;
  height: 28px;
  background: var(--bg-tertiary);
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  &.active {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    &::after {
      transform: translateX(22px);
    }
  }
  &::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
    box-shadow: 0 2px 4px var(--shadow-color);
  }
}
</style>

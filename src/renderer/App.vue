<!--
  Copyright (c) 2026 前端飞行手册. All rights reserved.
  Commercial License - See LICENSE.md
-->
<template>
  <el-config-provider :z-index="3000" namespace="ep">
    <div @mouseleave="handleMouseLeave" :class="{ 'app-container-outter': disabledTransparent }">
      <RouterView />
      <BubbleBG v-show="showBubbleBG" />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSharedStore } from '@/renderer/store/sharedStore'
import { ipcRenderService } from '@/renderer/services/ipcService'
import BubbleBG from '@/renderer/components/BubbleBG.vue'
import { useSettingsStore } from '@/renderer/store/settingsStore'
import { setLanguage } from '@/common/locales/index'
import { UseMsgHandler } from '@/renderer/hooks/useMsgHandler'

const router = useRouter()
const route = useRoute()
const sharedStore = useSharedStore()
const settingsStore = useSettingsStore()
const { registerMsgEvents } = UseMsgHandler()

const showBubbleBG = ref(true)
const disabledTransparent = ref(true)

function closeLoadingWindow() {
  ipcRenderService.send('app:window:close-loading')
}

watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) {
      // 禁用动画背景的路由
      const disabledRoutes = ['LOGIN_FORMS', 'MINI_WINDOW', 'MAC_NOTIFICATION_WINDOW', 'TRANSPARENT_WINDOW']
      const enableTransparentRoutes = ['MINI_WINDOW', 'MAC_NOTIFICATION_WINDOW', 'TRANSPARENT_WINDOW']
      if (enableTransparentRoutes.includes(newRouteName as string)) {
        disabledTransparent.value = false
      } else {
        disabledTransparent.value = true
      }
      if (disabledRoutes.includes(newRouteName as string)) {
        showBubbleBG.value = false
      } else {
        showBubbleBG.value = true
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  console.log('App.vue mounted')
  // 监听窗口管理路由变化
  registerMsgEvents()
  ipcRenderService.on(
    'app:window:init-route',
    (
      event: any,
      {
        name,
        query,
        params,
        state,
      }: {
        name: string
        query?: any
        params?: any
        state?: any
      }
    ) => {
      console.log('get params from render process: ', query, params, state)
      router.push({
        name,
        query: {
          ...query,
        },
        params: {
          ...params,
        },
        state: {
          ...state,
        },
      })
    }
  )
  // 状态共享
  ipcRenderService.on('app:shared-state-update', (event: any, data: any) => {
    console.log('get data from other window:', data)
    sharedStore.updateSharedData(data)
  })
  // 语言切换
  ipcRenderService.on('app:language:main-change', (event: any, data: any) => {
    console.log('app:language-change')
    setLanguage(data)
  })

  // 页面加载完成后通知主进程
  closeLoadingWindow()

  settingsStore.initAppThemes()
})

const handleMouseLeave = () => {
  ipcRenderService.send('app:window:mouse-leave')
}
</script>

<style scoped>
.app-container-outter {
  background: var(--bg-primary);
  transition:
    background-color var(--theme-transition),
    color var(--theme-transition);
}
</style>

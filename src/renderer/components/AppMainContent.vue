
<template>
  <div class="route-view-container pretty-scrollbar"
    :style="{ height: `calc(100vh - ${currentLayout === 'vertical' ? 35 : 86}px)` }">
    <router-view class="app-main-height" v-slot="{ Component, route }">
      <transition name="fade-slide" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang='ts'>
import { useRouter, useRoute } from 'vue-router'
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/renderer/store/settingsStore'

const themeSettingStore = useThemeSettingStore()
const { darkMode, layout, themeColors } = storeToRefs(themeSettingStore)

const settingsStore = useSettingsStore()
const { activeNav, currentLayout } = storeToRefs(settingsStore)

const route = useRoute()

const cachedRoutes = computed(() => {
  const cachedRoutesArr: any[] = []
  // this.visitedRoutes.forEach((item) => {
  //   if (!item.meta.noKeepAlive) {
  //     cachedRoutesArr.push(item.name)
  //   }
  // })
  return cachedRoutesArr
})
const key = computed(() => {
  return route.path
})

</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.route-view-container {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

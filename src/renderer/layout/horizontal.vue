<template>
  <div class="index-wrap">
    <div class="top-header">
      <TopBar></TopBar>
      <div class="default-layout-siderbar">
        <div class="app-menu-content pretty-scrollbar">
          <div class="current-menu" :style="{ transform: `translateX(${currentIndex * 120}px)`, color: '#fff' }"></div>
          <div
            v-for="(item, index) in navList"
            :key="item.value"
            :class="{ active: index === currentIndex, 'app-menu-item': true }"
            @click="handleClick(item, index)"
          >
            <EvIcon :iconName="item.icon"></EvIcon>
            <div class="app-menu-item-text" :title="$t(item.name)">{{ $t(item.name) }}</div>
          </div>
        </div>
        <div class="default-layout-footer">
          <AvatarTooltip trigger="click" placement="left-start" @quit="handleQuit">
              <template #trigger>
                  <div class="custom-trigger">
                      <div class="avatar">{{ $t('COMMON.AVATAR_FALLBACK') }}</div>
                  </div>
              </template>
          </AvatarTooltip>
        </div>
      </div>
    </div>
    <div class="content">
      <AppMainContent></AppMainContent>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/renderer/components/TopBar.vue'
import AppMainContent from '@/renderer/components/AppMainContent.vue'
import { Grid, DocumentDelete, Setting, DArrowLeft, DArrowRight, House, Picture } from '@element-plus/icons-vue'
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { $t } from '@/common/locales/index'
import EvIcon from '@/renderer/components/EvIcon.vue'
import AvatarTooltip from '@/renderer/components/AvatarTooltip.vue'

const themeSetting = useThemeSettingStore()

const currentIndex = ref(0)

const navList = ref([
  { name: 'COMMON.MENU.HOME_PAGE', value: 'INDEX', icon: markRaw(House) },
  { name: 'COMMON.MENU.COMPONENTS', value: 'COMMON_COMPONENTS', icon: markRaw(Picture) },
  { name: 'COMMON.MENU.FUNCTION_TEST', value: 'TEST_PAGE_1', icon: markRaw(Setting) },
  { name: 'COMMON.MENU.SETTING', value: 'SETTINGS', icon: markRaw(Setting) },
])
console.log('navList', navList, themeSetting.navBarCollapse)
console.log('themeSetting', themeSetting)

const router = useRouter()

const handleClick = (navItem: any, index: number) => {
  currentIndex.value = index
  router.push({ name: navItem.value })
}

onMounted(() => {
  const currentRoute = router.currentRoute.value.name as string
  const index = navList.value.findIndex(item => item.value === currentRoute)
  if (index !== -1) {
    currentIndex.value = index
  }
})

watch(
  () => router.currentRoute.value.name,
  (newRoute) => {
    const index = navList.value.findIndex(item => item.value === newRoute)
    if (index !== -1) {
      currentIndex.value = index
    }
  }
)

const handleQuit = () => {
  router.push({ name: 'LOGIN' })
}

</script>

<style lang="scss" scoped>
.index-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .top-header {
    position: fixed;
    width: 100%;
    z-index: 1;
    border-bottom: 1px solid var(--ep-border-color);
  }

  .default-layout-siderbar {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 50px;

    .app-menu-content {
      display: flex;
      position: relative;
      flex: 1;
      height: 100%;
      overflow: hidden;

      .current-menu {
        position: absolute;
        width: 120px;
        // border: 1px solid var(--ep-color-primary);
        background: var(--primary-alpha);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 40px;
        border-radius: 5px;
        top: 5px;
        backdrop-filter: blur(4px);
      }

      .app-menu-item {
        display: flex;
        justify-content: center;
        padding: 0 15px;
        height: 100%;
        font-size: 13px;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        width: 120px;
        position: relative;
        z-index: 1;

        &:hover {
          cursor: pointer;
          color: var(--ep-color-primary-light-3);
        }

        &.active {
          color: var(--primary);
          font-weight: bold;
        }

        &-text {
          margin-left: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }
      }
    }

    .default-layout-footer {
      margin-left: auto;
      
      .setting-icon {
        cursor: pointer;
        &:hover {
          color: var(--ep-color-primary);
        }
      }
    }
  }

  .content {
    margin-top: 85px;
    flex: 1;
  }
}

.avatar {
  width: 35px;
  height: 35px;
  min-width: 35px;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  transition: background var(--theme-transition);
}

.avatar::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--success);
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
}
</style>

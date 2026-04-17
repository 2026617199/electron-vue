<template>
  <div class="default-layout-container">
    <TopBar></TopBar>
    <LayoutToggle v-model="layoutCollapse" class="default-layout-main-content">
      <template v-slot:left="{ menu }">
        <SideBar :navList="navList" @navClick="handleClick"></SideBar>
      </template>
      <template v-slot:right>
        <AppMainContent></AppMainContent>
      </template>
    </LayoutToggle>
  </div>
</template>

<script setup lang='ts'>
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/renderer/components/TopBar.vue'
import AppMainContent from '@/renderer/components/AppMainContent.vue'
import { Grid, DocumentDelete, Setting, DArrowLeft, DArrowRight, House, Picture } from '@element-plus/icons-vue'
import SideBar from '@/renderer/components/SideBar.vue'

const currentIndex = ref(0)
const layoutCollapse = ref(true)

// 使用markRaw避免将组件转换为响应式的对象，造成不必要的性能开销
const navList = ref([
  { name: 'COMMON.MENU.HOME_PAGE', value: 'INDEX', icon: markRaw(House) },
  { name: 'COMMON.MENU.COMPONENTS', value: 'COMMON_COMPONENTS', icon: markRaw(Picture) },
  { name: 'COMMON.MENU.FUNCTION_TEST', value: 'TEST_PAGE_1', icon: markRaw(Setting) },
  { name: 'COMMON.MENU.SETTING', value: 'SETTINGS', icon: markRaw(Setting) },
])

const router = useRouter()
const route = useRoute()

const handleClick = (navItem?: any, index?: number) => {
  handleRouteChange(navItem?.value || 'INDEX')
}

const handleMenuCollapse = () => {
  layoutCollapse.value = !layoutCollapse.value
  console.log('layoutCollapse.value: ', layoutCollapse.value);
}

const handleRouteChange = (routeName: string, isRouterPush = true) => {
  currentIndex.value = navList.value.findIndex(item => item.value === routeName)
  if (isRouterPush) {
    router.push({ name: routeName })
  }
}

const handleCommand = (value: string) => {
  switch (value) {
    case 'quit':
      router.push({ name: 'LOGIN' })
      break;
    case 'setting':
      handleRouteChange('SETTINGS')
      break;
  
    default:
      break;
  }
}

onMounted(() => {
  handleRouteChange(route.name as string, false)
})
</script>

<style lang="scss" scoped>
@use '../styles/mixins.scss';
.default-layout-container {
  display: flex;
  width: 100%;
  flex-direction: column; // 设置为列布局
  height: 100vh; // 容器高度占满视口
}
</style>

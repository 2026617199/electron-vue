<template>
  <div class="index-wrap">
    4656
  </div>
</template>

<script setup lang='ts'>
import { useRouter, useRoute } from 'vue-router'
import AppMainContent from '@/renderer/components/AppMainContent.vue'
import { Delete, User, Setting, Hide, Upload } from '@element-plus/icons-vue'

const navList = ref([
  { name: '首页', value: 'index', icon: Setting },
  { name: '组件', value: 'components', icon: Setting },
  { name: '配置', value: 'config', icon: Setting },
  { name: '错误页面', value: '/errorPages', icon: Setting },
  { name: '其他', value: 'others', icon: Setting },
])
console.log('navList', navList)

const navActiveIndex = ref('index')

const router = useRouter()

const handleClick = (navItem: any, index: number) => {
  console.log(navItem, index)
  router.push(navItem.value)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}


</script>

<style lang="scss" scoped>
.index-wrap {
  display: flex;
  .side-bar-container {
    height: 100vh;
    flex-basis: 200px;

  }
  .content {
    flex: 1;
  }
}
</style>

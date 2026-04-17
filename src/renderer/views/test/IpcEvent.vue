<template>
  <div>
    <el-button @click="handleBtnClick(1)">渲染进程 ===》主进程</el-button>
    <el-button @click="handleBtnClick(2)">渲染进程《==》主进程</el-button>
    <!-- <el-button @click="handleBtnClick(3)">渲染进程 ===》渲染进程 {{ count }}</el-button> -->

  </div>
</template>

<script setup lang='ts'>
import { ipcRenderService } from '@/renderer/services/ipcService';

const count = ref(0)

const handleBtnClick = async (type: number) => {
  switch (type) {
    case 1:
      console.log('render to main')
      ipcRenderService.send('app:setTitle', 'data from render')
      break;
    case 2:
      try {
        // 方式一
        const file = await ipcRenderService.invoke('app:dialog:openFile', { orgId: 1})
        console.log('get data from main process', file);
        // 方式二
        // ipcRenderService.invoke('app:dialog:openFile', { orgId: 1 })
        // .then((file: any) => {
        //   console.log('get data from main process: ', file);
        //   // 你可以在这里处理你的文件数据
        // })
        // .catch((error: any) => {
        //   console.error('An error occurred:', error);
        //   // 在这里处理错误
        // });
      } catch (error) {
        console.log('error', error)
      }
      
      break;
    case 3:
      count.value++
      break;
    case 4:
      
      break;
  
    default:
      break;
  }
}
onMounted(() => {
  ipcRenderService.on('app:updateValue', async (event: any, data: any) => {
    console.log('get data from main process: ', data)
    count.value--
  })
})
</script>


<style scoped>

</style>

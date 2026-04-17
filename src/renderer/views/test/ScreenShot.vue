<template>
  <div>
    <el-button @click="startQQScreen()">{{ $t('TEST.QQ_SCREENSHOT') }}</el-button>
    <!-- <el-button @click="startElectronShot()">electron 截图</el-button> -->
  </div>
</template>

<script setup lang='ts'>
import { ipcRenderService } from '@/renderer/services/ipcService';

async function startQQScreen() {
  ipcRenderService.send('app:start-qq-screen-shot', 'data from render')
}
async function startElectronShot() {
  // ipcRenderService.send('app:start-screen-shot', 'data from render')
  ipcRenderService.send('app:window:create', {
    name: 'SCREEN_SHOT',
    query: {
      id: 1,
    },
    params: {
      unid: 123456,
    },
    // 存储复杂数据
    state: {
      title: 'SCREEN_SHOT'
    }
  })
}

</script>

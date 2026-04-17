<template>
  <div>
    <CommonBar />
    <div class="update-container">
      <span>{{ $t('SETTINGS.APP_UPDATE_DOWNLOAD_SPEED', { speed: downloadSpeed }) }}</span> 
      <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage" />
      <div class="flex">
        <el-button @click="checkForUpdate()">{{ $t('COMMON.MENU.CHECK_UPDATE') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { ipcRenderService } from '@/renderer/services/ipcService'
import { convertBandwidth } from '@/renderer/utils/format'

const percentage = ref(0)
const downloadSpeed = ref('0 KB')

function checkForUpdate() {
  ipcRenderService.send('app:check-update')
}

// onMounted(() => {
//   // 发现可用更新
//   ipcRenderService.on('app:update-info', (event: any, data: any) => {
//     console.log('data: app:update-info', data);
//     switch (data.type) {
//       case 'update-available':
//         ElMessageBox.confirm(
//           '发现可用更新，是否立即下载？',
//           '更新提示',
//           {
//             confirmButtonText: '立即下载',
//             cancelButtonText: '取消',
//             type: 'info',
//             center: true,
//           }
//         ).then(() => {
//           ipcRenderService.send('app:update-download')
//         })
//         .catch(() => {
//         })
//         break;
//       case 'update-downloaded':
//         ElMessageBox.confirm(
//           '更新下载完毕，是否重启并安装？',
//           '更新提示',
//           {
//             confirmButtonText: '立即安装',
//             cancelButtonText: '取消',
//             type: 'info',
//             center: true,
//           }
//         ).then(() => {
//           ipcRenderService.send('app:update-install')
//         })
//         .catch(() => {
//         })
//         break;

//       case 'download-progress':
//         percentage.value = parseFloat(data.data.percent.toFixed(2));
//         downloadSpeed.value = convertBandwidth(data.data.bytesPerSecond) || '0 KB';
//         break
//       case 'update-not-available':
//         ElMessageBox.confirm(
//           '当前已是最新版本',
//           '更新提示',
//           {
//             confirmButtonText: '确定',
//             showCancelButton: false,
//             type: 'info',
//             center: true,
//           }
//         ).then(() => {
//         })
//         .catch(() => {
//         })
//         break
    
//       default:
//         break;
//     }
//   });
// })
</script>

<style lang="scss" scoped>
:deep(.ep-progress-bar__inner) {
  background: linear-gradient(to right, #009aff, #7a00ff);
}
.update-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 50px 50px 0;
  span {
    font-size: 13px
  }
};
.flex {
  padding: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>

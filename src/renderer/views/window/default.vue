<template>
  <div>
    <CommonBar />
    <el-input
      v-model="stateValue"
      style="max-width: 600px;margin: 20px 0;"
      placeholder="Please input 0 / 1"
      class="input-with-select"
    >
      <template #prepend>
        <el-select v-model="stateKey" placeholder="Select" style="width: 115px">
          <el-option :label="$t('TEST.LABEL_AUTO_LOGIN')" value="autoLogin" />
          <el-option :label="$t('TEST.LABEL_AUTO_START')" value="autoStart" />
          <el-option :label="$t('TEST.LABEL_REMEMBER_PASSWORD')" value="rememberPassword" />
        </el-select>
      </template>
      <template #append>
        <el-button @click="handleStateChange()">{{ $t('TEST.BTN_CHANGE_GLOBAL_STATE') }}</el-button>
      </template>
    </el-input>
    <el-descriptions border :column="3">
      <el-descriptions-item :label="$t('TEST.LABEL_AUTO_LOGIN')">{{ shareData.autoLogin }}</el-descriptions-item>
      <el-descriptions-item :label="$t('TEST.LABEL_AUTO_START')">{{ shareData.autoStart }}</el-descriptions-item>
      <el-descriptions-item :label="$t('TEST.LABEL_REMEMBER_PASSWORD')">{{ shareData.rememberPassword }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ipcRenderService } from '@/renderer/services/ipcService';
import { useSharedStore } from '@/renderer/store/sharedStore';


const shareStore = useSharedStore();
const route = useRoute()

const shareData = ref({
  autoLogin: 0,
  autoStart: 0,
  rememberPassword: 0
})


const stateKey = ref('autoLogin')
const stateValue = ref('')

function handleStateChange() {
  shareStore.updateSharedData({
    [stateKey.value]: stateValue.value
  })
}

onMounted(() => {
  console.log('get params from router:', route)
  ipcRenderService.on('app:shared-state-update', (event: any, data: any) => {
    console.log('get data from main window:', data);
    Object.assign(shareData.value, data);
  });
})
</script>


<style scoped>

</style>

<template>
  <!-- 测试窗口池管理功能 -->
  <div>
    <span>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_1') }}<br>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_2') }}<br>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_3') }}<br>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_4') }}<br>
    </span>
    <el-divider />
    <span>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_5') }}<br>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_6') }}<br>
      {{ $t('TEST.WINDOW_MANAGE_INTRO_7') }}<br>
    </span>
    <el-divider />
    <el-button @click="commonConfigCreate()">{{ $t('TEST.BTN_COMMON_CREATE') }}</el-button>
    <el-button @click="useWindowPoolCreate()">{{ $t('TEST.BTN_POOL_CREATE') }}</el-button>
    <el-button @click="showTransparentWin()">{{ $t('TEST.BTN_SHOW_TRANSPARENT') }}</el-button>
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
      <el-descriptions-item :label="$t('TEST.LABEL_AUTO_LOGIN')">{{ shareStore.sharedData.autoLogin }}</el-descriptions-item>
      <el-descriptions-item :label="$t('TEST.LABEL_AUTO_START')">{{ shareStore.sharedData.autoStart }}</el-descriptions-item>
      <el-descriptions-item :label="$t('TEST.LABEL_REMEMBER_PASSWORD')">{{ shareStore.sharedData.rememberPassword }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang='ts'>
import { ipcRenderService } from '@/renderer/services/ipcService';
import { useSharedStore } from '@/renderer/store/sharedStore';


const shareStore = useSharedStore();

const stateKey = ref('autoLogin')
const stateValue = ref('')

function handleStateChange() {
  shareStore.updateSharedData({
    [stateKey.value]: stateValue.value
  })
}
function showTransparentWin() {
  ipcRenderService.send('app:window:create', {
    name: 'TRANSPARENT_WINDOW'
  })
}

function useWindowPoolCreate() {
  ipcRenderService.send('app:windowpool:open', {
    url: '/windowPool'
  })
}

const commonConfigCreate = () => {
  ipcRenderService.send('app:window:create', {
    name: 'BASE_URL',
    query: {
      id: 1,
    },
    params: {
      unid: 123456,
    },
    // 存储复杂数据
    state: {
      title: 'init title'
    }
  })
}
</script>

<style scoped lang='scss'>

</style>

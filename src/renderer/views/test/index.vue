<template>
  <div class="p-1">
    <el-tabs type="border-card">
      <el-tab-pane :label="$t('TEST.TAB_MSG_CENTER')">
        <MsgCenter />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_PLAYWRIGHT')">
        <Playwright />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_WINDOW')">
        <WindowManage />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_IPC')">
        <IpcEvent />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_STORE')">
        <ElectronStore />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_SCREENSHOT')">
        <ScreenShot />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_RECORD')">
        <ScreenRecord />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_INTRO')">
        <IntroGuide />
      </el-tab-pane>
      <el-tab-pane :label="$t('TEST.TAB_MUSIC_VIS')">
        <MusicVisable />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang='ts'>
import WindowManage from './WindowManage.vue';
import IpcEvent from './IpcEvent.vue';
import ElectronStore from './ElectronStore.vue';
import ScreenShot from './ScreenShot.vue';
import ScreenRecord from './screenRecord.vue';
import IntroGuide from './IntroGuide.vue';
import MusicVisable from './MusicVisable.vue';
import Playwright from './Playwright.vue';
import MsgCenter from '@/renderer/views/test/MsgCenter.vue';
</script>


<style scoped>
:deep(.ep-tabs__nav-wrap) {
  z-index: 1;
}
</style>

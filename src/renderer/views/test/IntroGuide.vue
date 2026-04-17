<template>
  <div>
    <el-button @click="startGuide">{{ $t('INTRO_GUIDE.START') }}</el-button>
    <span class="test">TEST</span>
    <!-- <div data-title="Welcome!" data-intro="Hello World!">hello!</div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

const { t } = useI18n()
const intro = ref<any>(null)

const introOption = ref({
  prevLabel: '',
  nextLabel: '',
  doneLabel: '',
  tooltipClass: 'intro-tooltip',
  exitOnEsc: true,
  exitOnOverlayClick: false,
  keyboardNavigation: true,
  showBullets: false,
  showStepNumbers: false,
  stepNumbersOfLabel: '/',
  autoPosition: true,
  showProgress: true,
  scrollToElement: true,
  overlayOpacity: 0.65,
  disableInteraction: true,
  hidePrev: false,
  hideNext: false,
  steps: [] as any[],
})

const guide = () => {
  intro.value = introJs()
  introOption.value.prevLabel = t('INTRO_GUIDE.PREV')
  introOption.value.nextLabel = t('INTRO_GUIDE.NEXT')
  introOption.value.doneLabel = t('INTRO_GUIDE.DONE')
  introOption.value.steps = [
    { title: t('INTRO_GUIDE.STEP_MENU'), element: '.test', intro: t('INTRO_GUIDE.STEP_MENU_DESC') },
    { title: t('INTRO_GUIDE.STEP_SETTINGS'), element: '.app-setting-icon', intro: t('INTRO_GUIDE.STEP_SETTINGS_DESC') },
    { title: t('INTRO_GUIDE.STEP_TOGGLE'), element: '.app-menu-toggle', intro: t('INTRO_GUIDE.STEP_TOGGLE_DESC') }
  ] as any
  intro.value.setOptions(introOption.value)
}

function startGuide() {
  guide()
  intro.value?.start()
}

onMounted(() => {
  nextTick(() => {
    guide()
  })
})
</script>

<style scoped></style>

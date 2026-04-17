<template>
  <div>
    <el-button @click="handleSendMsg(2)">{{ $t('TEST.MSG_SEND_WECHAT') }}</el-button>
    <el-button @click="resetState()">{{ $t('TEST.MSG_RESET_STATE') }}</el-button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { UseMsgHandler } from '@/renderer/hooks/useMsgHandler'

const { t } = useI18n()
const { sendRandomMsg } = UseMsgHandler()

const templates = [
  {
    id: 111,
    icon: 'test.png',
    appNameKey: 'TEST.MSG_DEMO_WECHAT',
    timeKey: 'TEST.MSG_DEMO_JUST_NOW',
    titleKey: 'TEST.MSG_DEMO_TITLE_SECURITY',
    messageKey: 'TEST.MSG_DEMO_BODY_SECURITY'
  },
  {
    id: 222,
    icon: 'test.png',
    appNameKey: 'TEST.MSG_DEMO_WECHAT',
    timeKey: 'TEST.MSG_DEMO_JUST_NOW',
    titleKey: 'TEST.MSG_DEMO_TITLE_SUB',
    messageKey: 'TEST.MSG_DEMO_BODY_SUB'
  },
  {
    id: 333,
    icon: 'test.png',
    appNameKey: 'TEST.MSG_DEMO_WECHAT',
    timeKey: 'TEST.MSG_DEMO_JUST_NOW',
    titleKey: 'TEST.MSG_DEMO_TITLE_GROUP',
    messageKey: 'TEST.MSG_DEMO_BODY_GROUP'
  },
  {
    id: 444,
    icon: 'test.png',
    appNameKey: 'TEST.MSG_DEMO_WECHAT',
    timeKey: 'TEST.MSG_DEMO_JUST_NOW',
    titleKey: 'TEST.MSG_DEMO_TITLE_PM',
    messageKey: 'TEST.MSG_DEMO_BODY_PM'
  }
]

let msgId = 0
let emailId = 0
const handleSendMsg = (value) => {
  const tpl = templates[msgId % templates.length]
  sendRandomMsg({
    id: `wx-${Date.now()}`,
    icon: tpl.icon,
    appName: t(tpl.appNameKey),
    time: t(tpl.timeKey),
    title: t(tpl.titleKey),
    message: t(tpl.messageKey)
  })
  msgId++
}

const resetState = () => {
  msgId = 0
  emailId = 0
}

</script>

<style scoped lang='scss'>

</style>

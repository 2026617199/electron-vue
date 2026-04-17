import { createI18n } from 'vue-i18n'
import CN from '@/common/locales/zh/index'
import EN from '@/common/locales/en/index'

import { ipcRenderService } from '@/renderer/services/ipcService';

const messages = {
  cn: {
    ...CN,
  },
  en: {
    ...EN,
  },
}

export const i18n = createI18n({
  globalInjection: true,
  locale: 'cn',
  global: true,
  legacy: false,
  messages
})

export function setLanguage(locale: 'cn' | 'en') {
  // 通知主进程
  if (locale !== i18n.global.locale.value) {
    ipcRenderService.send('app:language:render-change', locale)
  }
  i18n.global.locale.value = locale
}

export const $t = i18n.global.t
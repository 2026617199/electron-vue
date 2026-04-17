import { createI18n } from 'vue-i18n'
import CN from '@/common/locales/zh/index'
import EN from '@/common/locales/en/index'

import { ipcMainService } from '../../ipcManager'

import { trayModule } from '../tray'
/**
 * 维护主进程国际化功能
 */
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


// 主进程语言切换
export function setLanguage(locale: 'cn' | 'en') {
  if (locale !== i18n.global.locale.value) {
    i18n.global.locale.value = locale
    trayModule.buildTrayMenuTemplate()
    ipcMainService.send('app:language:main-change', locale)
  }
}

// 提供主进程使用
// export const $t = i18n.global.t
export const $t = i18n.global.t as (key: string) => string

export const registerLocaleEventHander = () => {
  // 监听渲染进程语言切换事件
  ipcMainService.on('app:language:render-change', (event, locale: 'cn' | 'en') => {
    setLanguage(locale)
  })
}
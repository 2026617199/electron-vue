import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { i18n } from '@/common/locales'
// import { pinia } from '@/render/store/index'
import { formatDateDirective } from '@/renderer/directives/formatDate'

// 全局注册组件
import { registerComponents } from '@/renderer/components/base'

// 手动导入样式message样式解决样式失效问题，这里注意文件结尾不能是css，否则不生效
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/message.scss'

// 引入unocss
import 'virtual:uno.css'
import SvgIcon from '@/renderer/components/SvgIcon.vue'

// svg引入
import 'virtual:svg-icons-register'

import Router from './router'

// 全局样式
import './styles/index.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 全局注册组件
app.component('SvgIcon', SvgIcon)

registerComponents(app)

app.use(Router)

app.use(i18n)

app.directive('date-format', formatDateDirective)

app.config.errorHandler = (err, instance, info) => {
  // 处理错误，例如：报告给一个服务
  console.error('全局错误捕获:', err, instance, info)
}

Router.isReady().then(() => app.mount('#app'))
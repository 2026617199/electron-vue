import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Layout from '@/renderer/layout/default.vue'
import HorizontalLayout from '@/renderer/layout/horizontal.vue'
import { useSettingsStore } from '@/renderer/store/settingsStore'

// 路由中使用 pinia store 报错："getActivePinia()" was called but there was no active Pinia.
// https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html
// https://github.com/vuejs/pinia/issues/1237
// const themeSetting = useThemeSettingStore()
// 创建一个包装组件来处理布局切换
const DynamicLayout = defineComponent({
  setup() {
    const settingsStore = useSettingsStore()
    
    return () => h(settingsStore.currentLayout === 'horizontal' ? HorizontalLayout : Layout)
  }
})

// 打包后必须使用hash路由，否则electron无法加载文件
// 这里由于打包后生产环境是使用 file:// 协议来加载应用，存在跨域或文件不存在的问题。
// 因为 file:// 协议下的页面默认是不允许跨目录访问其他文件的，这会导致当你尝试导航到一个新的路由时，
// Electron 无法找到对应的文件，因为它实际上是在文件系统中查找这个文件。
// 后续使用自定义协议加载应用，来解决这个问题
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'LOGIN',
      redirect: '/login',
      component: () => import('../views/login/index.vue'),
      children: [
        {
          path: 'login',
          component: () => import('../views/login/components/LoginForm.vue'),
          name: 'LOGIN_FORMS',
        },
        {
          path: 'register',
          component: () => import('../views/login/components/RegisterForm.vue'),
          name: 'REGISTER',
        }
      ]
    },
    {
      path: '/transparentWindow',
      name: 'TRANSPARENT_WINDOW',
      component: () => import('../views/test/TransparentWin.vue')
    },
    {
      path: '/createByWindowPool',
      name: 'CREATE_BY_WINDOW_POOL',
      component: () => import('../views/test/CreateByWindowPool.vue')
    },
    {
      path: '/macNotificationWindow',
      name: 'MAC_NOTIFICATION_WINDOW',
      component: () => import('../views/msgCenter/index.vue')
    },
    {
      path: '/appUpdate',
      name: 'APP_UPDATE_WINDOW',
      component: () => import('../views/appUpdate/index.vue')
    },
    {
      path: '/miniWindow',
      name: 'MINI_WINDOW',
      component: () => import('../views/window/miniWindow.vue')
    },
    {
      path: '/default',
      name: 'BASE_URL',
      component: () => import('../views/window/default.vue'),
    },
    {
      path: '/windowPool',
      name: 'WINDOW_POOL',
      component: () => import('../views/window/winPool.vue'),
    },
    {
      path: '/main',
      // component: themeSetting.layout === 'horizontal' ? HorizontalLayout : Layout, // 测试横向布局
      // component: HorizontalLayout,
      component: DynamicLayout,
      name: 'MAIN',
      children: [
        {
          path: '/index',
          name: 'INDEX',
          component: () => import('../views/dashboard/index.vue'),
          meta: {
            title: 'COMMON.MENU.HOME_PAGE',
            icon: 'home',
          },
        },
        {
          path: '/components',
          name: 'COMMON_COMPONENTS',
          component: () => import('../views/components/index.vue')
        },
        {
          path: '/settings',
          name: 'SETTINGS',
          component: () => import('../views/settings/index.vue')
        },
        {
          path: '/wallPaper',
          name: 'WALLPAPER',
          component: () => import('../views/wallPaper/index.vue')
        },
        // 专用功能测试页面
        {
          path: '/test1',
          name: 'TEST_PAGE_1',
          component: () => import('../views/test/index.vue')
        },
        {
          path: '/test2',
          name: 'TEST_PAGE_2',
          component: () => import('../views/test/index.vue')
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NOT_FOUND',
      component: () => import('../views/NotFound.vue'),
    },
    
  ]
})

router.beforeEach((to, from, next) => {
  // console.log('to, from, next', to, from, next)
  // if (to.name !== 'Login') next({ name: 'Login' })
  // 如果用户未能验证身份，则 `next` 会被调用两次
  next()
})

export default router

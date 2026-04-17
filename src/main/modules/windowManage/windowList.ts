import { screen } from 'electron'
import { loadUrl } from './index'
import { join } from 'node:path'
import { APP_ICON_PATH } from '@/common/config/url'
import { $t } from '@/main/modules/locale'

const windowList = new Map()

const preload = join(__dirname, '../preload/index.js')

// 配置地址
export const WINDOW_URLS = {
  BASE_URL: '/default',
  WINDOW_POOL: '/windowPool',
  MAIN_WINDOW: '/',
  MINI_WINDOW: '/miniWindow',
  APP_UPDATE_WINDOW: '/appUpdate',
  LOADING_WINDOW: '/loading',
  TEST_PAGE_1: '/test1',
  TEST_PAGE_2: '/test2',
  SCREEN_SHOT: '/screenShot',
  SCREEN_RECORD: '/sceenRecord',
  TRANSPARENT_WINDOW_URL: '/transparentWindow',
  MAC_NOTIFICATION_WINDOW_URL: '/macNotificationWindow',  
}

export const WINDOW_ROUTE_NAME = {
  BASE_URL: 'BASE_URL',
  WINDOW_POOL: 'WINDOW_POOL',
  MAIN_WINDOW: 'MAIN',
  SCREEN_RECORD: 'SCREEN_RECORD',
  MINI_WINDOW: 'MINI_WINDOW',
  APP_UPDATE_WINDOW: 'APP_UPDATE_WINDOW',
  LOADING_WINDOW: 'LOADING_WINDOW',
  TEST_PAGE_1: 'TEST_PAGE_1',
  TEST_PAGE_2: 'TEST_PAGE_2',
  SCREEN_SHOT: 'SCREEN_SHOT',
  TRANSPARENT_WINDOW: 'TRANSPARENT_WINDOW',
  MAC_NOTIFICATION_WINDOW: 'MAC_NOTIFICATION_WINDOW',  
}

// 获取主屏幕的bounds
export const getPrimaryDisplayBounds = () => {
  return screen.getPrimaryDisplay().bounds  
}

windowList.set(WINDOW_ROUTE_NAME.TRANSPARENT_WINDOW, {
  options() {
    return {
      width: 600,
      height: 400,
      show: false,
      title: '',
      frame: false,
      transparent: true,
      maximizable: false,
      hasShadow: true,
      resizable: false,
      webPreferences: {
        preload,
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        // 只有设置contextIsolation：true，preload才能注册window对象
        // window.electronApi.ipcService
        contextIsolation: true
      }
    }
  },
  callback(win: any) {
    loadUrl(win, WINDOW_URLS.TRANSPARENT_WINDOW_URL)
    win.show()
  }
})


const defaultWinWidth = 400
windowList.set(WINDOW_ROUTE_NAME.MAC_NOTIFICATION_WINDOW, {
  options() {
    return {
      width: 600,
      height: 400,
      show: false,
      title: '',
      frame: false,
      transparent: true,
      maximizable: false,
      minimizable: false,
      alwaysOnTop: true,
      hasShadow: false,
      resizable: true,
      webPreferences: {
        preload,
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: true
      },
      skipTaskbar: true,
      titleBarStyle: "hidden",
      fullscreenable: false, // 是否可以全屏
    }
  },
  /**
 * 设置窗口位置和大小，并加载指定URL后显示窗口
 * @param {any} win - 要操作的窗口对象
 * @param {Function} callback - 窗口创建后的回调函数
 */
callback(win: any) {
    const pb = getPrimaryDisplayBounds()
    win.setPosition(pb.x + pb.width - defaultWinWidth, pb.y)
    win.setSize(defaultWinWidth, pb.height)
    loadUrl(win, WINDOW_URLS.MAC_NOTIFICATION_WINDOW_URL)
    win.show()
  }
})

windowList.set(WINDOW_ROUTE_NAME.APP_UPDATE_WINDOW, {
  options() {
    return {
      width: 500,
      height: 300,
      show: false,
      title: 'Update',
      frame: false,
      transparent: false,
      maximizable: false,
      hasShadow: true,
      resizable: true,
      webPreferences: {
        preload,
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: true
      }
    }
  },
  callback(win: any) {
    loadUrl(win, WINDOW_URLS.APP_UPDATE_WINDOW)
    win.show()
  }
})

windowList.set(WINDOW_ROUTE_NAME.BASE_URL, {
  options() {
    return {
      width: 600,
      height: 400,
      show: false,
      title: '',
      frame: false,
      maximizable: false,
      resizable: false,
      webPreferences: {
        preload,
        nodeIntegration: true,
        webSecurity: false,
        // 只有设置contextIsolation：true，preload才能注册window对象
        // window.electronApi.ipcService
        contextIsolation: true
      }
    }
  },
  callback(window: any) {
    loadUrl(window, WINDOW_URLS.BASE_URL)
  }
})

windowList.set(WINDOW_ROUTE_NAME.SCREEN_RECORD, {
  options() {
    return {
      width: 600,
      height: 400,
      show: false,
      title: $t('COMMON.MENU.SCREEN_RECORD'),
      frame: false,
      maximizable: false,
      resizable: false,
      webPreferences: {
        preload,
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: true
      }
    }
  },
  callback(window: any) {
    loadUrl(window, WINDOW_URLS.SCREEN_RECORD)
  }
})

windowList.set(WINDOW_ROUTE_NAME.SCREEN_SHOT, {
  options() {
    return {
      // width: 1000,
      // height: 800,
      show: false,
      title: $t('COMMON.MENU.SCREEN_SHOT'),
      frame: false,
      maximizable: true,
      resizable: true,
      transparent: false,
      fullScreen: true,
      alwaysOnTop: true,
      useContentSize: true,
      webPreferences: {
        preload,
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: true
      }
    }
  },
  callback(window: any) {
    loadUrl(window, WINDOW_URLS.SCREEN_SHOT)
  }
})

// 启动页loading窗口
windowList.set(WINDOW_ROUTE_NAME.LOADING_WINDOW, {
  options() {
    return {
      width: 600,
      height: 600,
      frame: false,
      show: true,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    }
  },
  callback(window: any) {
    // error: Not allowed to load local resource: file:///E:/repository/electron-vue-application/release/0.0.0/win-unpacked/resources/app.asar/resources/loading2.html
    const loadingUrl = `file://${join(__dirname, "../../resources/loading.html")}`
    window.loadURL(loadingUrl)
    window.show()
    window.setAlwaysOnTop(true)
  }
})

// 最小化mini窗口
windowList.set(WINDOW_ROUTE_NAME.MINI_WINDOW, {
  options() {
    return {
      width: 190,
      height: 170,
      frame: false,
      show: true,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      fullscreenable: false, // macOS上设置为true可能导致问题
      hasShadow: false, // 提高macOS上透明窗口的显示效果
      movable: true, // 确保窗口可以拖动
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined, // macOS特定配置
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: true,
      }
    }
  },
  callback(window: any) {
    loadUrl(window, WINDOW_URLS.MINI_WINDOW)
    // 初始化悬浮球位置
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
    window.setPosition(screenWidth - window.getSize()[0] -100, screenHeight - window.getSize()[1] - 100)
  }
})

// 主窗口配置
windowList.set(WINDOW_ROUTE_NAME.MAIN_WINDOW, {
  options() {
    return {
      title: 'Main window',
      icon: APP_ICON_PATH,
      width: 1000,
      height: 600,
      minWidth: 1000,
      minHeight: 600,
      show: false,
      frame: false,
      transparent: false,
      hasShadow: true,
      roundedCorners: false,
      // ************自定义属性************//
      enableSticky: true, // 是否启用贴边功能
      stickyOptions: {
        visibleSize: 0, // 完全隐藏，不再露出任何部分
        animationDuration: 300 // 动画持续时间(ms)
      },
      // ************自定义属性************//
      webPreferences: {
        preload,
        devTools: true, // 开发者工具的使用会影响透明背景的显示
        // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
        // Consider using contextBridge.exposeInMainWorld
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        nodeIntegration: true,
        webviewTag: true,
        webSecurity: false, // 取消跨域
        contextIsolation: true, // 必须设置，否则无法使用window.electronApi
        nodeIntegrationInWorker: true,
        experimentalFeatures: true // 启用实验性功能支持
      }
    }
  },
  callback(window: any) {
    loadUrl(window, WINDOW_URLS.MAIN_WINDOW)
  }
})


export default windowList
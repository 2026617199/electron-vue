import { app, BrowserWindow, shell, desktopCapturer, session } from 'electron'

// 配置文件
import { useStartAnimation } from '@/common/config/appConfig'
import { colors } from '@/common/utils/index'

// 通用窗口管理
import { windowManager } from '@/main/modules/windowManage/index'
// 窗口池管理
import { windowPoolManager } from '@/main/modules/windowManage/windowPool/index'

// 进程通信
import { ipcMainService } from '@/main/ipcManager'

// 快捷键
import { shortcutManager } from '@/main/modules/shortcutManager'

import { WINDOW_ROUTE_NAME } from "@/main/modules/windowManage/windowList"

// 托盘管理
import { trayModule } from '@/main/modules/tray/index'

// 注册模块事件
import { registerModulesEventHander } from '@/main/modules/index'

// 日志
import { logger, printLog } from '@/main/modules/logger'

// 初始化client
import clientManage from '@/main/modules/clientManage/index'
// 自动更新
import { appAutoUpdate } from '@/main/modules/autoUpdate/index'

// 录屏模块
import { recordScreenModule } from '@/main/modules/recordScreen/index'

// 右键菜单模块
import { contextMenuModule } from '@/main/modules/contextMenu/index'

// 崩溃监控
import { crashMonitor } from '@/main/modules/crashReporter/index'

// 自定义协议
import { customProtocol } from '@/main/modules/protocol/CustomProtocol'

// 数据库模块
import { secureDB, registerSecureDBEvents } from '@/main/modules/database/secureDB'

// logger.debug("Some debug");
// logger.error("Some debug");
// logger.warn("Some debug");
// logger.trace("Some debug");
// logger.fatal("Some debug");

class AppInit {
  logGreeting() {
    logger.info('app is starting...')
    logger.info(`
      _______  ___      _______  _______  _______  ______    _______  __    _        _______  _______  _______ 
    |       ||   |    |       ||       ||       ||    _ |  |       ||  |  | |      |   _   ||       ||       |
    |    ___||   |    |    ___||       ||_     _||   | ||  |   _   ||   |_| | ____ |  |_|  ||    _  ||    _  |
    |   |___ |   |    |   |___ |       |  |   |  |   |_||_ |  | |  ||       ||____||       ||   |_| ||   |_| |
    |    ___||   |___ |    ___||      _|  |   |  |    __  ||  |_|  ||  _    |      |       ||    ___||    ___|
    |   |___ |       ||   |___ |     |_   |   |  |   |  | ||       || | |   |      |   _   ||   |    |   |    
    |_______||_______||_______||_______|  |___|  |___|  |_||_______||_|  |__|      |__| |__||___|    |___|    
    `)
  }

  // 注册关闭loading窗口事件
  registerCloseLoadingEvent() {
    // 使用 once 替代 on，确保只执行一次
    ipcMainService.once('app:window:close-loading', () => {
      console.log(colors.green('close loading window'))

      setTimeout(() => {
        // 从窗口管理器获取loading窗口和主窗口的引用
        const loadingWin = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.LOADING_WINDOW)
        if (loadingWin && !loadingWin.isDestroyed()) {
          loadingWin.destroy()
          // 从窗口管理器获取最新的主窗口引用
          const currentMainWindow = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.MAIN_WINDOW)
          if (currentMainWindow) {
            currentMainWindow.show()
          }
        }
      }, 1000)
    })
  }

  createMainWindow(loadingWin?: BrowserWindow) {
    const mainWindow = windowManager.createWindow(WINDOW_ROUTE_NAME.MAIN_WINDOW)

    // electron 窗口创建并显示触发，不包含vue的mounted
    mainWindow.once("ready-to-show", () => {
      if (!useStartAnimation) {
        mainWindow.show()
      }
    });

    // 这里应该是加载index.html，但是实际资源并未加载完成，在这里关闭loading会出现短暂白屏闪烁现象
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('mian-window-did-finish-load')
    })
    
    // 拦截window.open()打开的链接，防止使用内置浏览器打开，而使用默认浏览器打开
    mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    // 客户端连接
    clientManage()

    trayModule.initTray()

    registerModulesEventHander()

    appAutoUpdate.initConfig()

    recordScreenModule.initRecordedScreen()

    contextMenuModule.initContextMenu()
    
    this.registerAppEventHandler()

    registerSecureDBEvents()

    shortcutManager.disableDevToolsShortcuts()

    // 初始化窗口池
    windowPoolManager.initialize({
      maxSize: 3,
      baseWindowName: WINDOW_ROUTE_NAME.BASE_URL
    })

    customProtocol.initialize()
    logger.info('customProtocol.isProtocolRegistered(): ', customProtocol.isProtocolRegistered())
  }

  launchApp() {

    this.logGreeting();

    // 注册关闭loading窗口事件（确保每次主进程加载时都注册）
    if (useStartAnimation) {
      this.registerCloseLoadingEvent()
    }

    crashMonitor.recordCrashReporter()
    // protocol.registerSchemesAsPrivileged([
    //   { scheme: 'foo', privileges: { bypassCSP: true } }
    // ])
    
    app.whenReady().then(() => {
      if (useStartAnimation) {
        // 创建加载窗口
        const loadingWin = windowManager.createWindow(WINDOW_ROUTE_NAME.LOADING_WINDOW)
        this.createMainWindow(loadingWin)
      } else {
        this.createMainWindow()
      }

      // 解决渲染进程使用navigator.mediaDevices.getDisplayMedia报错：DOMException.NotSupported
      session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
          // Grant access to the first screen found.
          callback({ video: sources[0], audio: 'loopback' })
        })
      })
      
      // app.on('activate', () => {
      //   if (BrowserWindow.getAllWindows().length === 0) this.createMainWindow()
      // })
    })

    // Windows和Linux关闭所有窗口通常会完全退出一个应用程序，这里排除macOS(darwin) 
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit()
    })

    // 如果用户在任务栏直接关闭应用，而不是通过程序内部的关闭操作，Electron 可能会直接发出 quit 事件，而不会经过 before-quit 或 will-quit。这是因为操作系统级别的关闭操作可能直接结束了进程，没有给 Electron 足够的时间来按顺序触发这些事件。
    app.on('before-quit', () => {
      // tray.destroy(); // 确保在应用退出前销毁托盘图标
      trayModule.destroyTray()
    });

  }

  registerAppEventHandler() {
    ipcMainService.on('app:quit', () => {
      app.quit()
    })
  
    ipcMainService.handle("app:get-version", (event, { key }) => {
      return app.getVersion()
    });
  }
};

export const appInit = new AppInit();
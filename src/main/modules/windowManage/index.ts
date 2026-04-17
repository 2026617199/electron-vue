import { BrowserWindow, screen } from "electron"
import { join } from 'node:path'
import { printLog } from '@/main/modules/logger'
// url模块没有默认导出
import * as url from 'url';

import windowList, { 
  WINDOW_ROUTE_NAME,
  WINDOW_URLS } from "./windowList"
import { ipcMainService } from '@/main/ipcManager'

import { stickyWindow } from './stickyWindow'

const SERVER_ROOT_URL = process.env.VITE_DEV_SERVER_URL

const preload = join(__dirname, '../preload/index.js')


process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');

const indexHtml = join(process.env.DIST, 'index.html');

/**
 * 基于窗口池方案封装窗口统一管理
 * 支持普通配置方式创建窗口
 */
class WindowManager  {

  // 窗口池使用
  windowMap = new Map()
  // 通用窗口池使用
  commonwindowMap = new Map()
  // key为窗口id，value为窗口实例
  windowInstanceMap = new Map()

  // 通用窗口创建方式
  createWindow(name: string) {
    // 根据路由name获取窗口配置
    const windowConfig = windowList.get(name)
    // 避免重复创建
    const isExistWindow = this.getPreConfigWindowByName(name)
    if (isExistWindow) {
      return isExistWindow
    }
    // console.log('get window config data', JSON.stringify(windowConfig))
    if (!windowConfig) {
      throw new Error(`Window configuration for name "${name}" not found.`);
    }
    // 使用预定义配置创建窗口
    if (windowConfig) {

      // 获取窗口配置
      const options = windowConfig.options()
      // console.log('options: ', JSON.stringify(options));
      if (!options) {
        throw new Error(`Invalid options for window configuration "${name}".`);
      }

      let window = new BrowserWindow({
        ...options
      })

      // 如果配置了贴边功能，自动启用
      if (options.enableSticky) {
        stickyWindow.initWindow(window, options.stickyOptions)
      }

      // 存储配置的通用窗口实例
      this.commonwindowMap.set(name, window)
      // 存储窗口实例
      this.windowInstanceMap.set(window.id, window)

      windowConfig.callback(window)

      // 监听窗口关闭，event.preventDefault()还能在操作一些自定义逻辑
      window.on("close", () => {
        // this.removeWindow(window.id)
      })
      // 窗口完全关闭后被触发，窗口对象不再可用
      window.on("closed", () => {
      })

      window.on("blur", () => {
      })

      window.on("focus", () => {
      })

      window.on("maximize", () => {
      })

      if (options.show) {
        window.on("ready-to-show", () => {
          window.show()
        })
      }

      return window

    } else {
      // console.log('is using default window')
      // const defaultOptions = getDefaultWindowOptions()
      return new BrowserWindow()
    }
  }

  removeWindow(id: number) {
    this.windowMap.delete(id)
    // 移除窗口实例
    this.windowInstanceMap.delete(id)
  }

  getWindowByName(name: string) {
    if (this.windowMap.has(name)) {
      return this.windowMap.get(name)
    }
    if (this.commonwindowMap.has(name)) {
      return this.commonwindowMap.get(name)
    }
    return null
  }

  deleteWindowByName(name?: string) {
    if (this.windowMap.has(name)) {
      this.windowMap.delete(name)
    }
    if (this.commonwindowMap.has(name)) {
      this.commonwindowMap.delete(name)
    }
  }

  // 获取通用方式创建的窗口
  getPreConfigWindowByName(name: string) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (this.commonwindowMap.has(name) && this.windowInstanceMap.has(curWindow.id)) {
      return this.commonwindowMap.get(name)
    }
    return null
  }

  getWindowById(id: number) {
    return BrowserWindow.fromId(id)
  }

  getCurrentFocusWin() {
    const focusItem = BrowserWindow.getFocusedWindow()
    if (!focusItem) return
    return this.getWindowById(focusItem.id)
  }

  close(name?: string) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      // 会关闭窗口池中的窗口
      curWindow.close()
      this.removeWindow(curWindow.id)
      this.deleteWindowByName(name)
    }
  }

  hide(name?: string) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      curWindow.hide()
    }
  }

  setWindowMinimize(name?: string) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      curWindow.minimize()
    }
  }

  setWindowMaximize(name?: string) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      curWindow.maximize()
    }
  }

  setWindowAlwaysOnTop(name: string, flag: boolean) {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      curWindow.setAlwaysOnTop(flag)
    }
  }

  setWindowSize(name: string, options: {
    width: number,
    height: number
  }): void {
    const curWindow = name ? this.getWindowByName(name) : this.getCurrentFocusWin()
    if (curWindow) {
      curWindow.setSize(options.width, options.height);
    }
  }

}

export const windowManager = new WindowManager()

export const loadUrl = (window: any, routeUrl: string) => {
  const serverRootUrl = `${SERVER_ROOT_URL}`.slice(0, -1)
  printLog('green', `load-url: ${serverRootUrl}${routeUrl}`)
  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    // hash模式使用
    window.loadURL(`${serverRootUrl}/#${routeUrl}`)
    // history模式使用
    // window.loadURL(`${serverRootUrl}${routeUrl}`)
    // window.webContents.openDevTools()
  } else {
    // 没有切换路由的时候使用
    // window.loadFile('dist/index.html');
    
    // 解决新开窗口路由切换问题
    const loadUrl = url.format({
      protocol: 'file',
      slashes: true,
      pathname: indexHtml,
      hash: routeUrl.substring(1), // 这里添加路由hash
    })
    
    window.loadURL(loadUrl)
  }

}

// 注册全局事件
export const registerWindowEvents = () => {
  // 初始化窗口池
  // windowManager.initWindowPool()

  ipcMainService.on("app:window:close", (params: any) => {
    windowManager.close()
  })

  ipcMainService.on("app:window:hide", (params: any) => {
    windowManager.hide()
  })

  ipcMainService.on("app:window:minimize", (params: any) => {
    windowManager.setWindowMinimize()
  })

  ipcMainService.on("app:window:maximize", (params: any) => {
    windowManager.setWindowMaximize()
  })

  ipcMainService.on("app:window:init-route", (event, params) => {
    ipcMainService.send("app:window:init-route", params)
  })

  // ipcMainService.on("app:window:use", (event, {
  //   name,
  //   query,
  //   params,
  //   state,
  // }) => {
  //   windowManager.useWindow({ name, query, params, state })
  // })

  ipcMainService.on("app:window:create", (event, {
    name,
  }) => {
    console.log('create window: ', name);
    try {
      const win = windowManager.createWindow(name)
      console.log('create window instance: ');
      win.show()
      console.log('window showed ');
    } catch (error) {
      console.log('create window error: ', error);
    }
  })
  ipcMainService.on("app:toggle:mini-window", (event, value) => {
    console.log('toggle mini window: ', value);
    const miniWindow = windowManager.createWindow(WINDOW_ROUTE_NAME.MINI_WINDOW)
    if (value) {
      if (miniWindow) {
        miniWindow.show()
      }
    } else {
      if (miniWindow) {
        windowManager.close(WINDOW_ROUTE_NAME.MINI_WINDOW)
      }
    }
  })

  // 在 registerWindowEvents 函数中添加
  ipcMainService.on("app:window:mouse-enter", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send("app:window:mouse-enter");
    }
  });

  ipcMainService.on("app:window:mouse-leave", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send("app:window:mouse-leave");
    }
  });

  // 窗口大小变化
  ipcMainService.on('app:windowSizeChange', (event: any, value: 'big' | 'middle' | 'small' | 'default') => {
    const sizeMap = {
      big: {
        percent: 0.95,
        width: 1200,
        height: 1000
      },
      middle: {
        percent: 0.8,
        width: 900,
        height: 700
      },
      small: {
        percent: 0.7,
        width: 800,
        height: 600
      },
      default: {
        percent: 1,
        width: 1000,
        height: 600
      }
    }
    const selectValue = sizeMap[value as keyof typeof sizeMap]
    if (selectValue) {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      // 获取主窗口
      const mainWindow = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.MAIN_WINDOW)
      const winWidth = Math.floor(width * selectValue.percent)
      const winHight = Math.floor(height * selectValue.percent)
      if (value === 'default') {
        mainWindow?.setContentSize(1000, 600)
      } else {
        mainWindow?.setContentSize(winWidth, winHight)
      }
      mainWindow?.center()
    }
  })

  ipcMainService.handle("app:window:get-position", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      return window.getPosition();
    }
    return [0, 0];
  });

  ipcMainService.on("app:window:set-position", (event, { x, y }) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setPosition(Math.round(x), Math.round(y));
    }
  });

}
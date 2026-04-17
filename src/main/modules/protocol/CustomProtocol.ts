import { app } from 'electron';
import { logger } from '@/main/modules/logger'

import { WINDOW_ROUTE_NAME } from "@/main/modules/windowManage/windowList"

import { windowManager } from '../windowManage/index';

class CustomProtocol {
  scheme = 'fly-app'

  registered: boolean = false
  
  // 初始化协议
  initialize() {
    // 开发环境注册
    if (process.defaultApp) {

      // 添加开发环境的调试信息
      this.logDevEnvironment()

      this.unregister()

      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(this.scheme, process.execPath, [
          process.argv[1]
        ]);
        this.registered = true;
      }
      logger.info('dev custom protocol register:', this.scheme)
    } else {
      app.setAsDefaultProtocolClient(this.scheme);
      this.registered = true;
      logger.info('prod custom protocol register:', this.scheme)
    }
    this.handleProtocolLaunch()
  }

  handleProtocolLaunch() {
    // 处理从协议URL启动应用的情况
    const gotTheLock = app.requestSingleInstanceLock()
    
    if (!gotTheLock) {
      app.quit()
      return
    }

    // 处理第二个实例启动时的参数
    app.on('second-instance', (event, commandLine) => {
      // 查找包含协议的参数
      const protocolUrl = commandLine.find(arg => arg.startsWith(`${this.scheme}://`))
      if (protocolUrl) {
        this.handleUrl(protocolUrl)
      }
    })

    // 处理macOS的协议调用
    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleUrl(url)
    })

    // 应用首次启动时的协议 URL，处理启动参数中的协议URL
    const protocolUrl = process.argv.find(arg => arg.startsWith(`${this.scheme}://`))
    if (protocolUrl) {
      this.handleUrl(protocolUrl)
    }
  }

  private handleUrl(url: string) {
    try {
      const urlObj = new URL(url)
      logger.info('Protocol URL received:', {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search
      })
      // Protocol URL received: {
        // protocol: 'fly-app:',
        // hostname: 'test',
        // pathname: '/abc',
        // search: '?hhh=123'
      // }
      
      // 这里处理具体的协议动作
      // 例如: fly-app://action/param?key=value
      const action = urlObj.pathname.slice(1) // 移除开头的斜杠
      const params = Object.fromEntries(urlObj.searchParams)
      
      // TODO: 根据实际需求处理不同的action
      logger.info('Protocol action:', { action, params })
      const mainWindow = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.MAIN_WINDOW)
      mainWindow.show()
      // URL：linjw://test/abc?hhh=123
      // { action: 'abc', params: { hhh: '123' } }
    } catch (error) {
      logger.error('Failed to handle protocol URL:', error)
    }
  }

  private logDevEnvironment() {
    console.log({
      scheme: this.scheme,
      execPath: process.execPath,
      appPath: process.argv[1],
      defaultApp: process.defaultApp,
      platform: process.platform
    });
    // {
    // isDevMode: true,
    // execPath: 'E:\\repository\\electron-vue\\node_modules\\electron\\dist\\electron.exe'
    // argv: [
    //   'E:\\repository\\electron-vue\\node_modules\\electron\\dist\\electron.exe',
    //   '.',
    //   '--no-sandbox'
    // ],
    // platform: 'win32',
    // scheme: 'fly-app'
    // }
  }

  // 协议注册状态检查
  public isProtocolRegistered(): boolean {
    return app.isDefaultProtocolClient(this.scheme);
  }

  // 协议注销方法
  public unregister() {
    if (!this.registered) return
    try {
      app.removeAsDefaultProtocolClient(this.scheme);

      this.cleanDevEnvironment();
    } catch (error) {
      console.error('Failed to unregister protocol:', error);
    }
  }
  /**
   * 清理开发环境的自定义注册信息
   * 只使用app.removeAsDefaultProtocolClient清楚，注册表还会存在，需要强制清理开发环境的注册
   */
  private cleanDevEnvironment() {
    if (process.platform === 'win32') {
      const { execSync } = require('child_process');
      try {
        // 使用 PowerShell 清理注册表
        execSync(`
          Remove-Item -Path "HKCU:\\Software\\Classes\\${this.scheme}" -Recurse -Force
          Remove-Item -Path "HKCU:\\Software\\Classes\\${this.scheme}.Protocol" -Recurse -Force
        `, { shell: 'powershell.exe' });
      } catch (error) {
        console.error('Failed to clean dev environment:', error);
      }
    }
  }
}

export const customProtocol = new CustomProtocol()
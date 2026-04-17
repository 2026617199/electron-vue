import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join, dirname } from 'node:path'
import { logger, printLog } from '@/main/modules/logger'
import { ipcMainService } from '@/main/ipcManager'
 
class AppAutoUpdate {
  initConfig() {
    // 不要在开发环境中设置updateConfigPath，否则会覆盖setFeedURL的配置
    if (process.env.NODE_ENV === 'development') {
      // 在开发环境中，设置更新配置文件路径
      // 使用process.cwd()获取项目根目录，确保路径正确
      autoUpdater.updateConfigPath = join(process.cwd(), 'scripts/mock/release/latest.yml');
    }
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'http://localhost:8099/updates' // 你的更新服务器地址
    });
    autoUpdater.autoDownload = false;
    autoUpdater.logger = logger
    autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development' ? true : false

    // events
    autoUpdater.on('error', (error) => {
      // 若github上都没有最新的release可用就会报错，需要将 draft 状态的更改为 release 状态
      // dialog.showErrorBox('更新失败', JSON.stringify(error))
    })
    autoUpdater.on('update-available', () => {
      ipcMainService.send('app:update-info', {
        type: 'update-available'
      })
    })
    autoUpdater.on('checking-for-update', () => {
      printLog('green', 'is checking for update...')
    })
    autoUpdater.on('update-not-available', () => {
      ipcMainService.send('app:update-info', {
        type: 'update-not-available',
        data: {
          version: autoUpdater.currentVersion,
        }
      })
    })
    autoUpdater.on('download-progress', (progressObj) => {
      // 通知渲染进程下载进度
      ipcMainService.send('app:update-info', {
        type: 'download-progress',
        data: progressObj
      })
    })
    autoUpdater.on('update-downloaded', () => {
      // dialog.showMessageBox({
      //   type: 'info',
      //   title: '安装更新',
      //   message: `更新下载完毕，应用将重启并安装`,
      //   buttons: ['确定']
      //   detail: '',
      // }).then(res => {
      //   autoUpdater.quitAndInstall()
      // })
      ipcMainService.send('app:update-info', {
        type: 'update-downloaded'
      })
    })
    this.registerAppUpdateEventHandler()
  }
  checkAppUpdate() {
    // 打包后才有效果，开发环境无效
    // autoUpdater.checkForUpdatesAndNotify();
    return autoUpdater.checkForUpdates()
  }

  handleDownloadUpdate() {
    autoUpdater.downloadUpdate().catch((error) => {
      console.error('下载更新失败:', error);
      ipcMainService.send('app:update-info', {
        type: 'update-error',
        data: error
      });
    })
  }

  handleQuitAppToInstall() {
    autoUpdater.quitAndInstall()
  }

  registerAppUpdateEventHandler() {
    // 检查是否有可用版本
    ipcMainService.handle('app:check-update', async (event: any, data) => {
      const result = await this.checkAppUpdate()
      return result
    })
    ipcMainService.on('app:update-download', (event: any, data) => {
      this.handleDownloadUpdate()
    })
    ipcMainService.on('app:update-install', (event: any, data) => {
      this.handleQuitAppToInstall()
    })
  }
}

export const appAutoUpdate = new AppAutoUpdate()
import { app, Menu, shell, Tray, nativeImage } from 'electron';
import { join, dirname } from 'node:path'

import { ipcMainService } from '../../ipcManager'

import { $t, setLanguage, i18n } from '../locale';

import { WINDOW_ROUTE_NAME } from "@/main/modules/windowManage/windowList"

import { windowManager } from '../windowManage/index';

import { appAutoUpdate } from '@/main/modules/autoUpdate/index';

const ICON_PATH = join(__dirname, '../../resources/offline-favicon.ico');
// const ICON_PATH = join(__dirname, '../../dist/offline-favicon.ico');

interface MenuItemConstructorOptions {
  label?: string;
  submenu?: [];
  click?: () => void;
  type?: string;
  accelerator?: string;
  checked?: boolean;
  commandId?: number;
  enabled?: boolean;
  id?: string;
}

class TrayModule {

  tray: Tray | undefined

  initTray() {
    this.tray = new Tray(ICON_PATH)
    this.buildTrayMenuTemplate()
    this.registerTrayHandler()
  }

  buildTrayMenuTemplate() {
    
    const mainWindow = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.MAIN_WINDOW)

    const isCn = i18n.global.locale.value === 'cn' ? true : false

    const settings = app.getLoginItemSettings();

    // 没有ts定义，buildFromTemplate传入的菜单项缺少字段会报错
    let menuItems: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
      { 
        label: $t('COMMON.MENU.MAIN_WINDOW'),
        submenu: [
          {
            label: $t('COMMON.MENU.SHOW_MAIN_WINDOW') ,
            accelerator: '', // 菜单的快捷方式
            click: () => {
              mainWindow.show()
            }
          }
        ],
      },
      { label: $t('COMMON.MENU.SETTING') },
      { label: $t('COMMON.MENU.ADVICE_CALLBACK') },
      {
        label: $t('COMMON.MENU.HELP'),
        click: () => {
          shell.openExternal('https://www.baidu.com/');
        }
      },
      {
        label: $t('COMMON.MENU.LANGUAGE_CHANGE'),
        submenu: [
          { 
            type: 'checkbox',
            label: $t('COMMON.MENU.SIMPLE_CHINESE') ,
            accelerator: '', // 菜单的快捷方式
            checked: isCn,
            click: () => {
              setLanguage('cn')
            }
          },
          { 
            type: 'checkbox',
            label: 'English' ,
            accelerator: '', // 菜单的快捷方式
            checked: !isCn,
            click: () => {
              setLanguage('en')
            }
          }
        ],
      },
      {
        label: $t('COMMON.MENU.AUTO_START'),
        type: 'checkbox',
        checked: settings.openAtLogin,
        click: () => {
          this.setOpenAtLogin()
        }
      },
      {
        label: $t('COMMON.MENU.CHECK_UPDATE'),
        click: () => {
          this.checkUpdate()
        }
      },
      {
        label: $t('COMMON.MENU.ABOUT'),
        click: () => {
          const win = windowManager.createWindow('APP_UPDATE_WINDOW')
          win.show()
        }
      },
      {
        label: $t('COMMON.MENU.QUIT'),
        click: () => {
          // mainWindow.close()
          app.quit()
        }
      }
    ]
  
    // 设置开发环境菜单项
    if (process.env.NODE_ENV === 'development') {
      menuItems = menuItems.concat([
        {
          label: '开发调试',
          submenu: [
            {
              label: '打开控制台',
              accelerator: 'Ctrl+Shift+I',
              click: () => {
                mainWindow.webContents.openDevTools()
              }
            },
          ]
        },
        {
          label: '测试',
          submenu: [
            { 
              label: '主进程到渲染进程-单向' ,
              accelerator: 'ctrl+n', // 菜单的快捷方式
              click: () => {
                // useIpcEvent.emit('updateValue', '更新数据啦')
                ipcMainService.send('app:updateValue', 'tray menu is clicked')
              }
            },
          ],
        },
        {
          label: '查看日志',
          click: () => {
            this.viewLogDirectory()
          }
        }
      ])
    }
    const contextMenu = Menu.buildFromTemplate(menuItems)

    if (this.tray) {

      this.tray.on('click', () => {
        mainWindow.show()
      })
  
      this.tray.setToolTip('This is my application.')
  
      this.tray.setContextMenu(contextMenu)
    }
    return menuItems
  }

  destroyTray() {
    this.tray?.destroy()
    this.tray = undefined
  }

  // 更新托盘状态
  updateTrayMenu() {
    const menuItems = this.buildTrayMenuTemplate()
    // 更新托盘菜单
    if (this.tray) {
      this.tray.setContextMenu(Menu.buildFromTemplate(menuItems))
    }
  }

  viewLogDirectory() {
    const userDataPath = app.getPath('userData');
    // 指定要打开的目录
    // const specificDirectory = path.join(userDataPath, 'your/directory');
    shell.openPath(userDataPath);
  }

  // 设置开机自启动
  setOpenAtLogin() {
    const settings = app.getLoginItemSettings();
    app.setLoginItemSettings({
      openAtLogin: !settings.openAtLogin,
      path: app.getPath('exe'),
      args: []
    });
  }
  checkUpdate() {
    appAutoUpdate.checkAppUpdate()
  }

  // 注册托盘事件
  registerTrayHandler() {
    ipcMainService.on('app:login-status', (event: any, isLogin) => {
      const loggedInIconPath = join(__dirname, `../../resources/${isLogin === 1 ? 'online' : 'offline'}-favicon.ico`);
      // const loggedInIconPath = join(__dirname, `../../resources/${isLogin === 1 ? 'online' : 'offline'}-favicon.ico`);
      const image = nativeImage.createFromPath(loggedInIconPath);
      this.tray?.setImage(image)
    })
  }
}

export const trayModule = new TrayModule()

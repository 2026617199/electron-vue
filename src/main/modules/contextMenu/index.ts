import { Menu, BrowserWindow, MenuItem } from 'electron';
import { windowManager } from '@/main/modules/windowManage/index';
import { recordScreenModule } from '../recordScreen/index';
import { WINDOW_ROUTE_NAME } from "@/main/modules/windowManage/windowList"

/**
 * 右键菜单
 */
class ContextMenuModule {
  menu = new Menu();

  initContextMenu() {
    this.menu.append(new MenuItem({
      label: '开始',
      id: 'start',
      click: () => {
        console.log('start');
        recordScreenModule.startRecording()
      }
    }));
    this.menu.append(new MenuItem({
      label: '结束',
      id: 'end',
      click: () => {
        console.log('click: ');
      }
    }));
    this.menu.append(new MenuItem({
      type: 'separator'
    }));
    this.menu.append(new MenuItem({
      label: '退出',
      id: 'exit',
      click: () => {
        console.log('click: ');
      }
    }))

    const mainWindow = windowManager.getPreConfigWindowByName(WINDOW_ROUTE_NAME.MAIN_WINDOW)

    mainWindow.webContents.on('context-menu', (e: any, params: any) => {
      e.preventDefault();
      this.showMenu(params.x, params.y);
    })
  }

  // 显示右键菜单
  showMenu(x: number, y: number) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      this.menu.popup({
        window,
        x,
        y
      });
    }
  }

}

export const contextMenuModule = new ContextMenuModule()
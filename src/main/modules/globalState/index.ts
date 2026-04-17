import { ipcMain, BrowserWindow } from 'electron';
import { isEqual } from 'lodash-es';
import { appStore } from '../database/index'

/**
 * 1、主进程设置全局状态管理
 * 2、主进程监听渲染进程发送的状态更新请求
 * 3、渲染进程中同步 Pinia 状态到主进程
 * 4、主进程广播状态更新到所有窗口
 * 5、主进程数据持久化
 * 
 * TODO: 考虑如何优雅地处理状态在不同窗口间的同步冲突。
 */

class GlobalState {
  // 主进程共享数据模块，广播到所有渲染进程，其他渲染进程数据更新也要同步到主进程
  // 当窗口注册时保存其引用
  windowRefs: { [id: string]: BrowserWindow } = {};
  // 初始状态
  globalState: any = {
    sharedData: {
      
    }
  }

  // 广播状态更新到所有窗口
  broadcastStateToWindows(state: any) {
    // for (const id in this.windowRefs) {
    //   if (this.windowRefs.hasOwnProperty(id)) {
    //     const window = this.windowRefs[id];
    //     window.webContents.send('app:shared-state-update', state);
    //   }
    // }
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
      win.webContents.send('app:shared-state-update', state);
    })
  }

  // 存储全局状态, 保存到文件、数据库或其他持久化存储的逻辑
  saveGlobalState(state: any) {
    // appStore.set('globalState', state);
  }

  registerModule() {
    // 监听渲染进程发送的状态更新请求
    ipcMain.on('app:update-shared-state', (event, newState) => {

      // 深度比较避免死循环，检查新状态是否与旧状态不同
      if (!isEqual(globalState, newState)) {
        
        // 更新全局状态
        this.globalState.sharedData = Object.assign(this.globalState.sharedData, newState); 
  
        // 数据持久化
        this.saveGlobalState(this.globalState)
  
        // 广播状态更新到所有窗口
        this.broadcastStateToWindows(this.globalState.sharedData);
      }
    })

    ipcMain.on('app:register-window', (event, id) => {
      this.windowRefs[id] = event.sender as unknown as BrowserWindow;
    })
    
    // 当窗口被关闭时移除其引用
    ipcMain.on('app:unregister-window', (event, id) => {
      delete this.windowRefs[id];
    })
  }
}

export const globalState = new GlobalState()



import { IpcMain, IpcMainEvent, IpcRenderer, ipcMain, ipcRenderer, BrowserWindow, webContents } from 'electron'

type ipcMainListener = (event: IpcMainEvent, ...args: any[]) => void;

const validateIPC = (channel: string) => {

  if (!channel || !channel.startsWith('app:')) {
    throw new Error(`Unsupported event IPC channel '${channel}'`)
  }

  return true
}

function isValidJSON(data: any) {
  try {
    JSON.parse(data);
    return true;
  } catch (e) {
    return false;
  }
}

const ipc = {
  main: ipcMain,
  renderer: ipcRenderer
}

const isRenderer = process.type === 'renderer'
const currentIpc = ipc[isRenderer ? 'renderer' : 'main']


// 存储已注册的监听器，用于防止重复注册
const registeredListeners = new Map<string, ipcMainListener>();

export const ipcMainService = {
  on(channel: string, listener: ipcMainListener) {
    validateIPC(channel);

    // 移除已存在的监听器，防止重复注册
    if (registeredListeners.has(channel)) {
      (currentIpc as IpcMain).removeListener(channel, registeredListeners.get(channel)!);
    }

    // 拓展性考虑，增加代码的模块化和可维护性，可以负责处理错误或异常
    const wrappedListener = (event: IpcMainEvent, ...args: any[]) => {
			listener(event, ...args);
		};

    // 存储新的监听器
    registeredListeners.set(channel, wrappedListener);
    
    (currentIpc as IpcMain).on(channel, wrappedListener);
  },
  send(channel: string, eventParams: any, webContentsId?: number) {
    validateIPC(channel)

    if (isRenderer) {
      ipcRenderer.send(channel, eventParams)
    } else {
      const windows = BrowserWindow.getAllWindows();
      if (webContentsId === undefined) {
        // 如果没有提供 webContentsId，则向所有窗口发送消息
        windows.forEach(win => {
          if (!win.isDestroyed()) {
            win.webContents.send(channel, eventParams);
          }
        })
      } else {
        // 向指定窗口发送消息
        const targetWindow = windows.find(win => !win.isDestroyed() && win.webContents.id === webContentsId);
        if (targetWindow) {
          targetWindow.webContents.send(channel, eventParams);
        } else {
          console.warn(`No window found with webContents ID: ${webContentsId}`);
        }
      }
  
    }
  },
  async invoke(channel: string, ...args: any[]): Promise<any> {
    validateIPC(channel);

    if (isRenderer) {
      // 没有解析会被序列化为字符串
      const result = await ipcRenderer.invoke(channel, ...args)
      if (isValidJSON(result)) {
        return JSON.parse(result)
      }
      return result
    } else {
      throw new Error('Not supported in main process')
    }
  },
  handle(channel: string, listener: (...args: any[]) => void) {
    validateIPC(channel);
    if (!isRenderer) {
      (currentIpc as IpcMain).handle(channel, listener)
    } else {
      throw new Error('Not supported in renderer process')
    }
  },
  // 同步等待结果返回，阻塞渲染进程
  sendSync(channel: string, ...args: any[]) {
    validateIPC(channel)

    if (isRenderer) {
      (currentIpc as IpcRenderer).sendSync(channel, ...args)
    }
  },
  once(channel: string, listener: () => void) {
    validateIPC(channel);

    (currentIpc as IpcMain | IpcRenderer).once(channel, listener);

  },
  removeListener(channel: string, listener: () => void) {
    validateIPC(channel);

    (currentIpc as IpcMain | IpcRenderer).removeListener(channel, listener);

  }
  // process: {
  //   // 行的平台名称
  //   get platform() { return process.platform; },
  //   // CPU架构类型
  //   get arch() { return process.arch; },
  //   // // 使用扩展运算符(...)来复制process.env对象，以避免直接暴露原始环境变量对象
  //   get env() { return { ...process.env }; },
  //   // 当前Node.js及其依赖模块的版本信息
  //   get versions() { return process.versions; },
  //   // 返回启动当前Node.js进程的可执行文件的绝对路径
  //   get execPath() { return process.execPath; }
  // }

}

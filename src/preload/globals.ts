import { ipcRenderer } from 'electron'

const validateIPC = (channel: string) => {

  if (!channel || !channel.startsWith('app:')) {
    throw new Error(`Unsupported event IPC channel '${channel}'`)
  }

  return true
}

export const globals = {
  ipcRenderer: {
    send(channel: string, ...args: any[]) {

      if (validateIPC(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    },
    invoke(channel: string, ...args: any[]) {

      validateIPC(channel);

      return ipcRenderer.invoke(channel, ...args);
    },
    on(channel: string, listener: () => void) {
      validateIPC(channel);

      ipcRenderer.on(channel, listener);

    },
    once(channel: string, listener: () => void) {
      validateIPC(channel);

      ipcRenderer.once(channel, listener);

    },
    removeListener(channel: string, listener: () => void) {
      validateIPC(channel);

      ipcRenderer.removeListener(channel, listener);

    }
  },
  process: {
    // 行的平台名称
    get platform() { return process.platform; },
    // CPU架构类型
    get arch() { return process.arch; },
    // // 使用扩展运算符(...)来复制process.env对象，以避免直接暴露原始环境变量对象
    get env() { return { ...process.env }; },
    // 当前Node.js及其依赖模块的版本信息
    get versions() { return process.versions; },
    // 返回启动当前Node.js进程的可执行文件的绝对路径
    get execPath() { return process.execPath; }
  }

}

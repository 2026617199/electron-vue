import { ipcRenderService } from '@/renderer/services/ipcService';

/**
 * 调用主进程的window监听事件
 * @returns 
 */
export const UseWindow = () => {

  const create = (params: any) => {
    ipcRenderService.send('app:window:create', params)
  }

  const show = (params: any) => {
    ipcRenderService.send('app:window:show', params)
  }

  const close = (params?: any) => {
    ipcRenderService.send('app:window:close', params)
  }

  const hide = (params?: any) => {
    ipcRenderService.send('app:window:hide', params)
  }

  const minimize = (params?: any) => {
    ipcRenderService.send('app:window:minimize', params)
  }

  const maximize = (params?: any) => {
    ipcRenderService.send('app:window:maximize', params)
  }

  const resizeWindow = (params: any) => {
    // 是否需要return
    // return useIpcEvent.send('app:window:resizeWindow', params)
  }
  
  const setPosition = (params: any) => {
    // return useIpcEvent.emit('app:window:resizeWindow', params)
  }

  return {
    create,
    show,
    close,
    hide,
    minimize,
    maximize,
    resizeWindow,
    setPosition
  }
}
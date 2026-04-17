const {
  on,
  send,
  handle,
  invoke,
  sendSync
} = window.electronApi.ipcService

export const ipcRenderService = {
  on,
  send,
  handle,
  invoke,
  sendSync
}
import { Notification } from 'electron'

export const notify = (options: Electron.NotificationConstructorOptions | undefined) => {
  const isSupported = Notification.isSupported()
  if (!isSupported) return
  const mergeOptions = {
    title: '标题',
    body: '正文文本',
    silent: false,
    icon: '', // 通知图标
    ...options
  }

  const notification = new Notification(mergeOptions)

  notification.show()
}

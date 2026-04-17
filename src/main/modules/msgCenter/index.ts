import { windowManager } from '@/main/modules/windowManage/index';
import { ipcMainService } from '@/main/ipcManager';

class MsgCenterModule {

  registerHandlerEvents() {
    ipcMainService.on('app:msg:sendRandomMsg', (value: any, data) => {
      ipcMainService.send('app:add-msg', data)
    })
    ipcMainService.on('app:msg:disabled', (value: any, data) => {
      windowManager.close('MAC_NOTIFICATION_WINDOW')
    })
  }
}

export const msgCenterModule = new MsgCenterModule()
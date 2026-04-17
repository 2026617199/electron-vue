import { dialog, ipcMain } from 'electron'
import { notify } from '@/main/modules/notifications/index'
import { ipcMainService } from '@/main/ipcManager';
// 
const { Monitor } = require("node-screenshots");
import * as fs from 'node:fs';
 

const TestEvent = () => {
  ipcMainService.on('app:setTitle', async (value: any, data) => {
    console.log('data: ', JSON.stringify(data));
    console.log('1313123', JSON.stringify(value))
    notify({
      title: '接收到渲染进程消息',
      body: data
    })
    const monitor = await Monitor.fromPoint(
      2000,
      200,
    );
    console.log('monitor: ', monitor)
    console.log('monitor3333', JSON.stringify(monitor, null, 2))
    console.log('5555', monitor.id);
    let image = monitor.captureImageSync();
    fs.writeFileSync(`${monitor.id}-sync22.png`, image.toPngSync());
    console.log('monitor: ', JSON.stringify(monitor))

    let monitors = Monitor.all();

    monitors.forEach((capturer: any) => {
      console.log({
        id: capturer.id,
        x: capturer.x,
        y: capturer.y,
        width: capturer.width,
        height: capturer.height,
        rotation: capturer.rotation,
        scaleFactor: capturer.scaleFactor,
        isPrimary: capturer.isPrimary,
      });
    });
  })
  ipcMainService.handle('app:dialog:openFile', async (value: any) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({})
      if (!canceled) {
        return filePaths[0]
      }
    } catch (error) {
      
    }
  })
  // async function handleFileOpen () {
  //   const { canceled, filePaths } = await dialog.showOpenDialog({})
  //   if (!canceled) {
  //     return filePaths[0]
  //   }
  // }
  // // ipcMain.handle('openFile', handleFileOpen)
  // useIpcEvent.on('dialog:openFile', async (value: any) => {
  //   try {
  //     const { canceled, filePaths } = await dialog.showOpenDialog({})
  //     if (!canceled) {
  //       return filePaths[0]
  //     }
  //   } catch (error) {
      
  //   }
  // })
  // ipcMainService.on('app:create:window', async (event: any, data: any) => {
  //   console.log('主进程接受到渲染进程数据', data)
  //   windowManager.createWindow(WINDOW_URLS.BASE_URL)
  // })
}

export default TestEvent
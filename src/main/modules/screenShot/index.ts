import { app, Menu, shell, Tray, BrowserWindow, screen } from 'electron';
import { join, dirname } from 'node:path'
import * as fs from 'node:fs'
import { windowManager } from '../windowManage/index';
import { ipcMainService } from '../../ipcManager'
import { WINDOW_ROUTE_NAME } from "@/main/modules/windowManage/windowList"
import { execFile  } from "child_process";
import { notify } from '../notifications/index'
import { logger } from '@/main/modules/logger'
import { QQ_SCREEN_SHOT_EXE_PATH } from '@/common/config/url'
// 这里需要用require引入
const { Monitor } = require("node-screenshots");

interface DisplayInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
}

class ScreenShotModule {

  screenshotWin: BrowserWindow | null = null;

  async startCapture() {
    const display = this.getCursorDisplay()

    const imageBase64Url = await this.getFullScreenImage(display);
    // 初始化窗口
    this.screenshotWin = new BrowserWindow({
      title: 'screenshots',
      x: display.x,
      y: display.y,
      width: display.width,
      height: display.height,
      show: true,
      frame: false,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      transparent: true,
      // mac fullscreenable 设置为 true 会导致应用崩溃
      fullscreenable: false,
      hasShadow: false,
    });
    this.screenshotWin.on('closed', () => {
    });
    this.screenshotWin.on('show', () => {
      // this.screenshotWin = null;
    });
    // this.screenshotWin.loadFile(join(__dirname, '../../resources/capture.html'))
  }

  async getFullScreenImage(display: DisplayInfo) {
    // 中心坐标
    const monitor = Monitor.fromPoint(
      display.x + display.width / 2,
      display.y + display.height / 2,
    );
    const image = await monitor.captureImage();
    const buffer = await image.toPng(true);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  getCursorDisplay(): DisplayInfo {
    const point = screen.getCursorScreenPoint();
    const { id, bounds, scaleFactor } = screen.getDisplayNearestPoint(point);
    // 在不同的屏幕缩放比下，getDisplayNearestPoint 返回的bound里面的宽高不是整数，会导致错误
    return {
      id,
      x: Math.floor(bounds.x),
      y: Math.floor(bounds.y),
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
      scaleFactor,
    };
  }


  registerScreenShotEvents() {
    ipcMainService.handle('app:get-screen-image', async (value: any) => {
      try {
        const display = this.getCursorDisplay()

        const imageBase64Url = await this.getFullScreenImage(display);
        return imageBase64Url
      } catch (error) {
        console.log('error: ', error);
      }
    })
    // 使用qq截图
    ipcMainService.on('app:start-qq-screen-shot', (value: any, data) => {
      // 执行exe文件
      console.log('QQ_SCREEN_SHOT_EXE_PATH: ', QQ_SCREEN_SHOT_EXE_PATH);
      // 解决路径包含空格导致的执行问题
      execFile(`"${QQ_SCREEN_SHOT_EXE_PATH}"`, [], {
        shell: true,  // 添加这个选项
        windowsHide: true
      }, (error, stdout, stderr) => {
        if (error) {
          logger.error('Screenshot execution error::', error);
          return;
        }
        if (stdout) {
          console.log('234567:', stdout);
        }
        if (stderr) {
          console.error('788:', stderr);
        }
      });
      notify({
        title: '使用了QQ截图',
        body: data
      })
    })
    // ipcMainService.on('app:setTitle', async (value: any, data) => {

    // })
  }
}

export const screenShotModule = new ScreenShotModule()
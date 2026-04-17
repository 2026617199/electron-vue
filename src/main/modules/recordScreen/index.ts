import { app, Menu, shell, Tray, nativeImage, MenuItem } from 'electron';
import { join, dirname } from 'node:path'
import * as fs from 'node:fs'
import { windowManager } from '../windowManage/index';
import { ipcMainService } from '../../ipcManager'
import { WINDOW_ROUTE_NAME } from "../windowManage/windowList.ts"
import { notify } from '../notifications/index'

class RecordScreenModule {

  mediaRecorder: any

  recordedChunks = []

  initRecordedScreen() {
    this.registerHandlerEvents()
  }

  async startRecording() {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
  
    // 创建MediaRecorder实例
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
    this.mediaRecorder.start(1000);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.mediaRecorder.stream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const bufferArray = await blob.arrayBuffer(); // 获取 ArrayBuffer
      const buffer = Buffer.from(bufferArray);

      const videoPath = join(__dirname, 'recordedVideo.webm');
      // 暂时注释
      // fs.writeFile(videoPath, buffer, () => console.log('video saved successfully!'));
    };
  }

  handleDataAvailable(e: { data: any; }) {
    // this.recordedChunks.push(e.data);
  }

  registerHandlerEvents() {
    ipcMainService.on('app:start-record', (value: any, data) => {
      console.log('data: ', JSON.stringify(data));
      notify({
        title: '接收到渲染进程消息',
        body: data
      })
    })
  }
}

export const recordScreenModule = new RecordScreenModule()
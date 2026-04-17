/**
 * ============================================================================
 * @file        index.ts
 * @description preload脚本入口文件
 * @author      前端飞行手册 <frontpilot@163.com>
 * @homepage    https://frontpilot.cn/
 * @license     Commercial Source License v1.0
 * @copyright   Copyright (c) 2026 前端飞行手册. All rights reserved.
 *
 * Licensed under the Commercial Source License.
 * You may NOT redistribute, resell, sublicense, or publish this source code.
 * See LICENSE file in the project root for full license terms.
 * ============================================================================
 */

import { contextBridge, ipcRenderer } from 'electron';

const ipcService = {
  send: (channel: string, ...args: any[]) => {
    // Whitelist channels to prevent arbitrary IPC calls
    if (!channel.startsWith('app:')) {
      throw new Error(`Unsupported IPC channel: ${channel}`);
    }
    ipcRenderer.send(channel, ...args);
  },
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    if (!channel.startsWith('app:')) {
      throw new Error(`Unsupported IPC channel: ${channel}`);
    }
    ipcRenderer.on(channel, listener);
  },
  invoke: async (channel: string, ...args: any[]) => {
    if (!channel.startsWith('app:')) {
      throw new Error(`Unsupported IPC channel: ${channel}`);
    }
    return await ipcRenderer.invoke(channel, ...args);
  },
  removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    if (!channel.startsWith('app:')) {
      throw new Error(`Unsupported IPC channel: ${channel}`);
    }
    ipcRenderer.removeListener(channel, listener);
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronApi', {
      ipcService: ipcService,
      platform: process.platform
    });
  } catch (error) {
    console.log('contextBridge-error: ', error);
  }
} else {
  (window as any).electronApi = { ipcService, platform: process.platform }
}


/**
 * @file        main/index.ts
 * @description 主进程入口文件
 * @author      前端飞行手册 <frontpilot@163.com>
 * @homepage    https://frontpilot.cn/
 * @license     Commercial Source License v1.0
 * @copyright   Copyright (c) 2026 前端飞行手册. All rights reserved.
 */
import { app } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'

import { appInit } from '@/main/launch/init'
import { initScraperManager } from './modules/scraperManager'

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../resources')
  : process.env.DIST

app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// Here, you can also use other preload
// const preload = join(__dirname, '../preload/index.js')
// const url = process.env.VITE_DEV_SERVER_URL
// const indexHtml = join(process.env.DIST, 'index.html')

// 默认安装路径：C:\Users\username\AppData\Local\Programs\Electron Vue Application

// 应用初始化启动
appInit.launchApp()

// 在 app.whenReady 回调中调用
app.whenReady().then(() => {
  // 其他初始化代码...
  
  // 初始化抓取器管理模块
  initScraperManager()
})
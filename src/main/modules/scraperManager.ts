import { ipcMain, app, BrowserWindow } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'

// 文件保存路径
const userDataPath = app.getPath('userData')
const cookiesPath = path.join(userDataPath, 'cookies')
const dataPath = path.join(userDataPath, 'extracted-data')

// 确保目录存在
const ensureDirectories = async () => {
  try {
    await fs.mkdir(cookiesPath, { recursive: true })
    await fs.mkdir(dataPath, { recursive: true })
  } catch (error) {
    console.error('创建目录失败:', error)
  }
}

// 初始化抓取器管理模块
export const initScraperManager = () => {
  // 确保目录存在
  ensureDirectories()
  
  // 保存 Cookie 处理
  ipcMain.handle('app:save-cookies', async (_, { site, url, cookies }) => {
    try {
      const cookieFile = path.join(cookiesPath, `${site}.json`)
      const cookieData = {
        site,
        url,
        cookies,
        timestamp: new Date().toISOString()
      }
      
      await fs.writeFile(cookieFile, JSON.stringify(cookieData, null, 2))
      
      // 通知渲染进程
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('app:cookie-saved', { site, success: true })
      })
      
      return true
    } catch (error) {
      console.error('保存 Cookie 失败:', error)
      return false
    }
  })

  // 加载 Cookie 处理
  ipcMain.handle('app:load-cookies', async (_, { site }) => {
    try {
      const cookieFile = path.join(cookiesPath, `${site}.json`)
      const data = await fs.readFile(cookieFile, 'utf-8')
      const cookieData = JSON.parse(data)
      
      return cookieData.cookies
    } catch (error) {
      console.error('加载 Cookie 失败:', error)
      return null
    }
  })

  // 保存抓取的数据
  ipcMain.handle('app:save-extracted-data', async (_, { site, data }) => {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-')
      const dataFile = path.join(dataPath, `${site}_${timestamp}.json`)
      
      await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.error('保存抓取数据失败:', error)
      return false
    }
  })
} 
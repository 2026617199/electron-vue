import { join, dirname } from 'node:path'

const isDev = process.env.NODE_ENV === 'development'

console.log('Resources path:', (process as any).resourcesPath)
// process.resourcesPath
// 开发：E:\repository\electron-vue\node_modules\electron\dist\resources
// 打包后：E:\repository\electron-vue\release\0.0.0\win-unpacked\resources

console.log('__dirname:', __dirname)
// __dirname
// 开发：E:\repository\electron-vue\dist-electron\main
// 打包后：E:\repository\electron-vue\release\0.0.0\win-unpacked\resources\app.asar\dist-electron\main


// qq截图二进制路径
// 从最终打包后的dist-electron/main/index.js开始算： E:\repository\electron-vue\build\lib\PrintScr.exe
// __dirname：在打包后指的是app.asar内的路径而不是开发环境的源码路径
export const QQ_SCREEN_SHOT_EXE_PATH =  isDev 
? join(__dirname, '../../build/lib/PrintScr.exe')
: join((process as any).resourcesPath, 'lib/PrintScr.exe')

// 应用图标
export const APP_ICON_PATH = join(__dirname, '../../resources/online-favicon.ico')
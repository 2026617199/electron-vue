/// <reference types="vite/client" />

// 解决 Vue 文件的类型声明问题
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'mitt'
declare module 'vue-i18n'

// 应用全局变量声明
declare const __APP_NAME__: string
declare const __APP_VERSION__: string

// 这里不能出现export
// interface IElectronAPI {
//   createWindow: (windowInfo: WindowInfo) => void;
//   useIpcEvent: any;
// }

interface Window {
  electronApi: {
    ipcService: any;
    platform: string;
  }
}

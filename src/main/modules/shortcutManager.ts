import { globalShortcut, app } from 'electron'

class ShortcutManager {

  isProduction: boolean;

  devToolsShortcuts: string[];

  registeredShortcuts: Set<string>;

  constructor() {
    // 判断是否为生产环境
    this.isProduction = app.isPackaged;

    this.devToolsShortcuts = [
      'CommandOrControl+Shift+I', // Windows/Linux: Ctrl+Shift+I, Mac: Cmd+Shift+I
      'CommandOrControl+Shift+J', // 打开控制台
      'CommandOrControl+Shift+C', // 打开元素检查器
      'CommandOrControl+Option+I', // Mac: Cmd+Option+I
      'CommandOrControl+R', // 刷新页面
      'F12', // F12
      'CommandOrControl+Shift+D' // 有些配置下可能用到
    ];

    this.registeredShortcuts = new Set();
  }

  /**
   * 注册快捷键
   * @param {string} accelerator - 快捷键字符串，如 'CommandOrControl+X'
   * @param {function} callback - 触发时的回调函数
   * @returns {boolean} 是否注册成功
   */
  register(accelerator: string, callback: () => void) {
    // 1. 如果是生产环境，且该快捷键是控制台快捷键
    if (this.isProduction && this.isDevToolsShortcut(accelerator)) {
      console.warn(`[Security] Blocked devtools shortcut "${accelerator}" in production.`);
      
      // 注册一个空的回调来“吃掉”这个快捷键，防止默认行为生效
      // 注意：globalShortcut 的优先级很高，这通常能拦截
      const success = globalShortcut.register(accelerator, () => {
        console.log(`[Security] Prevented opening devtools via ${accelerator}`);
      });
      
      if (success) this.registeredShortcuts.add(accelerator);
      return success;
    }

    // 2. 正常注册业务快捷键
    const success = globalShortcut.register(accelerator, callback);
    if (success) {
      this.registeredShortcuts.add(accelerator);
    } else {
      console.error(`Failed to register shortcut: ${accelerator}`);
    }
    return success;
  }

  /**
   * 注销单个快捷键
   * @param {string} accelerator 
   */
  unregister(accelerator: string) {
    globalShortcut.unregister(accelerator);
    this.registeredShortcuts.delete(accelerator);
  }

  /**
   * 注销所有快捷键（通常在 app will-quit 时调用）
   */
  unregisterAll() {
    globalShortcut.unregisterAll();
    this.registeredShortcuts.clear();
  }

  /**
   * 检查是否为控制台相关快捷键
   * @param {string} accelerator 
   */
  isDevToolsShortcut(accelerator: string) {
    return this.devToolsShortcuts.includes(accelerator);
  }

  /**
   * 生产环境禁用所有控制台相关快捷键
   */
  disableDevToolsShortcuts() {
    if (!this.isProduction) {
      return
    }
    // 禁用打开控制台快捷键
    this.devToolsShortcuts.forEach(shortcut => {
      globalShortcut.register(shortcut, () => {
        console.log(`[Security] Prevented opening devtools via ${shortcut}`);
      });
    });
  }

}

export const shortcutManager = new ShortcutManager()
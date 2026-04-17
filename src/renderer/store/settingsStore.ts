import { defineStore } from 'pinia';
import { ipcRenderService } from '@/renderer/services/ipcService';
import { setLanguage } from '@/common/locales';
import { setCssVar } from '@/renderer/utils/index'
import { UseDark } from '@/renderer/hooks/useDark'
import { UseMsgHandler } from '@/renderer/hooks/useMsgHandler'
import { generateColors } from '@/renderer/utils/color'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sideBarExpanded: true, // 是否展开侧边栏
    currentTheme: 'purple', // 当前主题
    currentMode: 'light', // 暗黑/明亮模式
    langType: 'cn', // 当前语言
    showMiniWindow: false, // 是否显示Mini窗口
    activeNav: 'INDEX', // 当前激活的导航项，值为路由name
    themeList: [
      { value: 'purple', nameKey: 'SETTINGS.THEME_PURPLE', primaryColor: '#6366f1' },
      { value: 'pink', nameKey: 'SETTINGS.THEME_PINK', primaryColor: '#ec4899' },
      { value: 'cyan', nameKey: 'SETTINGS.THEME_CYAN', primaryColor: '#06b6d4' },
      { value: 'green', nameKey: 'SETTINGS.THEME_GREEN', primaryColor: '#10b981' },
      { value: 'orange', nameKey: 'SETTINGS.THEME_ORANGE', primaryColor: '#f97316' }
    ],
    windowEdgeAdhesive: true, // 是否启用窗口贴边吸附
    messageCenterEnabled: false, // 是否启用消息中心
    currentLayout: 'vertical', // 布局模式: vertical | horizontal
  }),
  actions: {
    collapseSideBar() {
      this.sideBarExpanded = !this.sideBarExpanded;
    },
    // 设置自定义组件和element组件的主题
    setCurrentTheme(theme: string = 'purple') {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      // 设置element-plus的主题颜色
      const themeColor = this.themeList.find(t => t.value === theme)?.primaryColor || '#6366f1';
      const colors = generateColors(themeColor)
      // 设置所有颜色变量
      Object.entries(colors).forEach(([key, value]) => {
        if (key === 'primary') {
          setCssVar('--ep-color-primary', value)
        } else {
          setCssVar(`--ep-color-primary-${key}`, value)
        }
      })
    },
    // 设置当前激活的导航项
    setActiveNav(nav: string) {
      this.activeNav = nav;
    },
    setCurrentMode(mode: string) {
      this.currentMode = mode;
      document.documentElement.setAttribute('data-mode', this.currentMode);
    },
    setLayout(layout: string) {
      this.currentLayout = layout;
    },
    setMessageCenterEnabled(enabled: boolean) {
      const msgHandler = UseMsgHandler()
      msgHandler.toggleEnableMsgCenter(enabled)
      this.messageCenterEnabled = enabled;
    },
    setWindowEdgeAdhesive(enabled: boolean) {
      this.windowEdgeAdhesive = enabled;
      // 通知主进程启用/禁用贴边功能
      ipcRenderService.send('app:stickwindow:toggle-enable', enabled)
    },
    langTypeChanage(langType: 'cn' | 'en') {
      this.langType = langType;
      setLanguage(langType);
    },
    setShowMiniWindow(enabled: boolean) {
      this.showMiniWindow = enabled;
    },
    initAppThemes() {
      // 初始化自定义组件主题
      this.setCurrentTheme();
      // 初始化element-plus主题
      this.setCurrentMode(this.currentMode);
      // 初始为亮色
      const { isDark } = UseDark()
      isDark.value = false
    }
  },
  // persist: {
  //   key: 'app-settings',
  //   storage: window.localStorage,
  // }
});
import { defineStore } from 'pinia'

const defaultSettings = {
  layout: 0, // 0-水平 1-垂直
  navBarCollapse: false,
  darkMode: false,
  themeColors: {
    themeType: 0,
    primary: '#409eff',
    primaryLight9: 'rgb(235.9, 245.3, 255)',
    colorGradient: 'linear-gradient(130deg,var(--app-color-foreground-blue) 30%,var(--app-color-foreground-violet) 70%)'
  }
}

export const useThemeSettingStore = defineStore('theme-settings', {
  state: () => ({
    layout: defaultSettings.layout,
    themeColors: defaultSettings.themeColors, // 主题色
    darkMode: defaultSettings.darkMode, // 主题色
    navBarCollapse: defaultSettings.navBarCollapse, // 菜单栏展开
  }),

  getters: {
    
  },
  actions: {
    changeNavBarCollapse(value: boolean) {
      console.log('value', value)
      this.navBarCollapse = value
    },
    updateThemeLayout(value: 0 | 1) {
      this.layout = value
      console.log('this.layout', this.layout)
    },
    updateThemeColor(value: any) {
      this.themeColors = {
        ...this.themeColors,
        ...value
      }
      console.log('localStorage:', window.localStorage.getItem('theme-settings'))
    },
    changeDarkMode(value: boolean) {
      this.darkMode = value
    },
  },
  persist: {
    key: 'theme-settings',
    storage: window.localStorage,
    // paths: ['layout', 'themeColors', 'darkMode', 'navBarCollapse']
  }
})
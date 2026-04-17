import { watch } from 'vue'
import { generateColors, mix } from '@/renderer/utils/color'
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { setCssVar } from '@/renderer/utils'
import { UseDark } from '@/renderer/hooks/useDark'

export const useTheme = () => {
  const { isDark, toggleDark } = UseDark()
  const themeStore = useThemeSettingStore()

  watch(() => isDark.value, (dark) => {
    console.log('dark', dark)
    if (dark) {
      // 暗黑模式下调整色阶
      const currentTheme = themeStore.themeColors
      if (currentTheme?.primary) {
        const darkColors = generateColors(currentTheme.primary)
        console.log('darkColors', darkColors)
        Object.entries(darkColors).forEach(([key, value]) => {
          // 暗黑模式下的颜色需要调整亮度
          const darkValue = key.startsWith('light') 
            ? mix(value, '#000000', 0.2)  // 降低亮度
            : value
          if (key === 'primary') {
            setCssVar('--ep-color-primary', darkValue)
          } else {
            setCssVar(`--ep-color-primary-${key}`, darkValue)
          }
        })
      }
    } else {
      // 恢复亮色模式
      const currentTheme = themeStore.themeColors
      if (currentTheme?.primary) {
        const colors = generateColors(currentTheme.primary)
        console.log('colors', colors)
        Object.entries(colors).forEach(([key, value]) => {
          if (key === 'primary') {
            setCssVar('--ep-color-primary', value)
          } else {
            setCssVar(`--ep-color-primary-${key}`, value)
          }
        })
      }
    }
  })

  return {
    isDark,
    toggleDark
  }
}
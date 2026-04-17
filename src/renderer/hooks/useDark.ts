import { useDark } from '@vueuse/core'
import { nextTick } from 'vue'
import { useSettingsStore } from '@/renderer/store/settingsStore'

export const UseDark = () => {
  const isDark = useDark()
  const settingsStore = useSettingsStore()

  const updateThemeColors = (_dark: boolean) => {
    // const currentTheme = themeSetting.themeColors
    // if (currentTheme?.primary) {
    //   const colors = generateColors(currentTheme.primary)
    //   ...
    // }
  }

  const isViewTransitionsSupported = () => {
    return Boolean(document.startViewTransition) &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /** 与 isDark 对齐的 data-mode / 派生色，始终在 DOM class 稳定后再写，避免 token 抢先于 View Transition */
  const syncDocumentMode = async () => {
    await nextTick()
    settingsStore.setCurrentMode(isDark.value ? 'dark' : 'light')
    updateThemeColors(isDark.value)
  }

  const toggleDark = async (event?: MouseEvent) => {
    if (!isViewTransitionsSupported() || !event) {
      isDark.value = !isDark.value
      await syncDocumentMode()
      return
    }

    try {
      const x = event.clientX
      const y = event.clientY
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )

      const transition = document.startViewTransition?.(async () => {
        isDark.value = !isDark.value
        await syncDocumentMode()
      })

      transition?.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]
        document.documentElement.animate(
          {
            clipPath: isDark.value
              ? [...clipPath].reverse()
              : clipPath,
          },
          {
            duration: 400,
            easing: 'ease-in',
            pseudoElement: isDark.value
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          },
        )
      })
    }
    catch (error) {
      console.error('View Transitions API failed:', error)
      isDark.value = !isDark.value
      await syncDocumentMode()
    }
  }

  updateThemeColors(isDark.value)

  return {
    isDark,
    toggleDark,
  }
}

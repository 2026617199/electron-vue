import { nextTick, onMounted, onUnmounted, Ref, unref, watch } from "vue";
import type { EChartsOption } from 'echarts';
import echarts from "@/renderer/components/chart/lib";
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from "pinia";

export enum RenderType {
  SVGRenderer = 'SVGRenderer',
  CanvasRenderer = 'CanvasRenderer'
}
export enum ThemeType {
  Light = 'light',
  Dark = 'dark',
  Default = 'default'
}

interface ChartHooks {
  onRender?: (chart: echarts.ECharts) => void | Promise<void>
  onUpdated?: (chart: echarts.ECharts) => void | Promise<void>
  onDestroy?: (chart: echarts.ECharts) => void | Promise<void>
}

export default function useCharts<T extends EChartsOption>(optionsFactory: () => T, hooks: ChartHooks = {}) {

  const scope = effectScope()

  const themeSetting = useThemeSettingStore()
  const { darkMode } = storeToRefs(themeSetting)
  // const darkMode = computed(() => themeSetting.darkMode)

  let chart: echarts.ECharts | null = null
  const chartOptions: T = optionsFactory()

  const domRef = ref<HTMLElement | null>(null)
  const initialSize = { width: 0, height: 0 }
  const { width, height } = useElementSize(domRef, initialSize)

  const {
    onRender = (instance) => {
      const textColor = darkMode.value ? 'rgb(240, 250, 255)' : 'rgb(31, 31, 31)'
      const maskColor = darkMode.value ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)'
      instance.showLoading({
        // color: settingsStore.settings.app.themeColor,
        textColor,
        fontSize: 14,
        maskColor,
      })
      setTimeout(() => {
        instance.hideLoading()
      }, 500)
    },
    onUpdated = (instance) => {
      instance.hideLoading()
    },
    onDestroy = (instance) => {
      instance.hideLoading()
    },
  } = hooks

  // 是否可以渲染
  function canRender() {
    return domRef.value && initialSize.width > 0 && initialSize.height > 0
  }

  // 是否已渲染
  function isRendered() {
    return Boolean(domRef.value && chart)
  }

  function setOptions(options: T) {
    chart?.setOption(options)
  }

  /** render chart */
  async function render() {
    console.log('render')
    if (!isRendered()) {
      const chartTheme = darkMode.value ? 'dark' : 'light'

      await nextTick()

      chart = echarts.init(domRef.value, chartTheme)

      chart.setOption({
        ...chartOptions,
        // 背景透明，跟随元素背景色
        backgroundColor: 'transparent'
      })

      await onRender?.(chart)
    }
  }

  function resize() {
    chart?.resize()
  }

  async function destroy() {
    if (!chart) {
      return
    }

    await onDestroy?.(chart)
    chart?.dispose()
    chart = null
  }

  async function changeTheme() {
    await destroy()
    await render()
    await onUpdated?.(chart!)
  }

  async function renderChartBySize(w: number, h: number) {
    initialSize.width = w
    initialSize.height = h

    if (!canRender()) {
      await destroy()

      return
    }

    if (isRendered()) {
      resize()
    }

    await render()
  }
  
  scope.run(() => {
    watch([width, height], ([newWidth, newHeight]) => {
      renderChartBySize(newWidth, newHeight)
    })

    watch(darkMode, (value) => {
      console.log('darkMode3333', value)
      changeTheme()
    })
  })

  onScopeDispose(() => {
    destroy()
    scope.stop()
  })

  return {
    setOptions,
    domRef,
    echarts
  }
}
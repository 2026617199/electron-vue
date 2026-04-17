<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { storeToRefs } from "pinia";

const { t, locale } = useI18n()
const themeSetting = useThemeSettingStore()
const { darkMode } = storeToRefs(themeSetting)

const chartRef = ref(null)
let chart: echarts.ECharts | null = null

const weekLabels = () => [
  t('DASHBOARD.WEEK_MON'),
  t('DASHBOARD.WEEK_TUE'),
  t('DASHBOARD.WEEK_WED'),
  t('DASHBOARD.WEEK_THU'),
  t('DASHBOARD.WEEK_FRI'),
  t('DASHBOARD.WEEK_SAT'),
  t('DASHBOARD.WEEK_SUN'),
]

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      top: '10%',
      left: 0,
      right: 0,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: weekLabels(),
      // axisLine: {
      //   lineStyle: {
      //     color: darkMode.value ? '#cccccc' : '#bababa'
      //   }
      // },
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: darkMode.value ? '#bababa' : '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#bababa'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: darkMode.value ? '#bababa' : '#666'
      },
    },
    series: [
      {
        name: t('DASHBOARD.TREND_SERIES'),
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#0051ff'
            },
            {
              offset: 0.4,
              color: '#0051ffb5'
            },
            {
              offset: 1,
              color: '#ffffff00'
            }
          ])
        },
        lineStyle: {
          width: 0
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }

  chart.setOption(option)
}

watch(locale, () => {
  handleRouteChange()
})

onMounted(async () => {
  await nextTick()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
const handleRouteChange = async () => {
  await nextTick()
  chart?.dispose()
  initChart()
}

onActivated(() => {
  handleRouteChange()
})

const handleResize = () => {
  chart?.resize()
}
</script> 
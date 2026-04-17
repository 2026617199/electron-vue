<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'

const { t, locale } = useI18n()
const chartRef = ref(null)
let chart: echarts.ECharts | null = null

const regionData = () => [
  { value: 1048, name: t('DASHBOARD.REGION_EAST') },
  { value: 735, name: t('DASHBOARD.REGION_NORTH') },
  { value: 580, name: t('DASHBOARD.REGION_SOUTH') },
  { value: 484, name: t('DASHBOARD.REGION_SOUTHWEST') },
  { value: 300, name: t('DASHBOARD.REGION_OTHER') }
]

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      }
    },
    legend: {
      bottom: '5%',
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#666',
        fontSize: 12
      }
    },
    series: [
      {
        name: t('DASHBOARD.DIST_NAME'),
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 12,
          color: '#666',
          alignTo: 'edge',
          edgeDistance: 10
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        data: regionData(),
        color: ['#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9', '#06b6d4']
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

// 添加路由切换后的重新渲染，解决窗口宽度变化后图表渲染问题
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
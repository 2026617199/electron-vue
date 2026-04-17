<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'

const { t, locale } = useI18n()
const chartRef = ref<HTMLElement | null>(null)
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
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15,
      textStyle: {
        color: '#666',
        fontSize: 12
      }
    },
    series: [
      {
        name: t('DASHBOARD.DIST_NAME'),
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: regionData(),
        color: ['#6236FF', '#36C6D3', '#F1B44C', '#0BA360', '#FF5B5C']
      }
    ]
  }

  chart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

watch(locale, () => {
  chart?.dispose()
  chart = null
  initChart()
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script> 
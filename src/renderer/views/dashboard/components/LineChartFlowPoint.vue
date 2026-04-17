<template>
  <div ref="lineChartRef" :style="{ width: `100%`, height: `200px` }"></div>
</template>

<script setup lang='ts'>
import { ref, Ref, onMounted, nextTick, computed } from 'vue'
import baseOptions from '@/renderer/components/chart/baseOptions'
import useChart, { RenderType, ThemeType } from '@/renderer/components/chart/useChart'
import echarts from "@/renderer/components/chart/lib";
import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { storeToRefs } from "pinia";

const themeSetting = useThemeSettingStore()
const { darkMode } = storeToRefs(themeSetting)

const {
  domRef: lineChartRef
} = useChart(() => {
  return {
    tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        // backgroundColor: isDark.value ? '#666' : '#6a7985'
      }
    }
    },
    legend: {
      data: ['Average Salary', 'Market Rate'],
      bottom: 0,
      // textStyle: {
      //   color: isDark.value ? '#ccc' : '#333'
      // }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Average Salary',
        type: 'line',
        smooth: true,
        data: [65000, 68000, 63000, 69000, 72000, 70000, 75000, 73000, 78000, 75000, 80000, 79000],
        symbolSize: 6,
        symbol: 'circle'
      },
      {
        name: 'Market Rate',
        type: 'line', 
        smooth: true,
        data: [60000, 62000, 65000, 64000, 67000, 66000, 70000, 71000, 73000, 72000, 75000, 74000],
        symbolSize: 6,
        symbol: 'circle',
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          opacity: 0.1,
        }
      }
    ]
  }
})

</script>

<style scoped>

</style>

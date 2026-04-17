import echarts from "@/renderer/components/chart/lib";
import type { EChartsOption } from 'echarts'
// prettier-ignore
let dataAxis = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
// prettier-ignore
let data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220];
let yMax = 500;
let dataShadow = [];
for (let i = 0; i < data.length; i++) {
  dataShadow.push(yMax);
}
export default {
  // title: {
  //   text: '特性示例：渐变色 阴影 点击缩放',
  //   subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
  // },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  xAxis: {
    // data: dataAxis,
    axisLabel: {
      inside: true,
      color: '#fff'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    z: 10
  },
  yAxis: {
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#999'
    }
  },
  grid: {
    left: 0,
    right: 20,
    bottom: 0,
    top: 20,
    containLabel: true
  },
  dataZoom: [
    {
      type: 'inside'
    }
  ],
  series: []
} as EChartsOption
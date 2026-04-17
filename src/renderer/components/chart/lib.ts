import * as echarts from 'echarts/core';

// 引入暗黑主题配置
import darkTheme from './darkTheme';
echarts.registerTheme('dark', darkTheme);

// node_modules\echarts\lib\export\charts.js
import {
  LineChart,
  LinesChart,
  BarChart,
  PieChart,
  RadarChart,
  LineSeriesOption,
  BarSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  PictorialBarSeriesOption,
  RadarSeriesOption,
  GaugeSeriesOption
} from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  PolarComponent,
  GraphicComponent,
  DatasetComponent,
  TransformComponent,
  TitleComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  ToolboxComponentOption,
  DatasetComponentOption
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';

import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  LegendComponent,
  GraphicComponent,
  PolarComponent,
  UniversalTransition,
  CanvasRenderer,
  LineChart,
  LinesChart,
  BarChart,
  PieChart,
  RadarChart
]);

export default echarts;

export type EChartsOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | ScatterSeriesOption
  | PictorialBarSeriesOption
  | RadarSeriesOption
  | GaugeSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | ToolboxComponentOption
  | DatasetComponentOption
>
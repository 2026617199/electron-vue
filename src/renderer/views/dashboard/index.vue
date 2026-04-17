<template>
  <div class="dashboard">
    <!-- 顶部卡片统计区 -->
    <div class="stat-cards">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="card-content">
          <div class="card-icon">
            <component :is="stat.icon" />
          </div>
          <div class="card-info">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
          </div>
        </div>
        <div class="card-trend">
          <span :class="stat.trend >= 0 ? 'up' : 'down'">
            {{ Math.abs(stat.trend) }}%
          </span>
          {{ $t('DASHBOARD.VS_LAST_WEEK') }}
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-card">
        <h2>{{ $t('DASHBOARD.CHART_TREND') }}</h2>
        <TrendChart />
      </div>
      <div class="chart-card">
        <h2>{{ $t('DASHBOARD.CHART_DISTRIBUTION') }}</h2>
        <DistributionChart />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { View, User, Switch } from '@element-plus/icons-vue'
import TrendChart from './components/TrendChart.vue'
import DistributionChart from './components/DistributionChart.vue'

const { t } = useI18n()

const stats = computed(() => [
  {
    title: t('DASHBOARD.STAT_TOTAL_VISITS'),
    value: '234,567',
    trend: 12.5,
    icon: View
  },
  {
    title: t('DASHBOARD.STAT_ACTIVE_USERS'),
    value: '45,678',
    trend: -2.8,
    icon: User
  },
  {
    title: t('DASHBOARD.STAT_CONVERSION'),
    value: '68.7%',
    trend: 5.6,
    icon: Switch
  }
])
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 16px;
  // @include useTheme {
  //   background: getVar('page-bg-color');
  // }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 24px;
    margin-bottom: 16px;

    .stat-card {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 10px;
      padding: 10px;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
      transition: transform 0.3s ease;
      &:nth-child(1) {
        background: linear-gradient(130deg, #337aff 30%, #0bb2ff 70%);
      }
      &:nth-child(2) {
        background: linear-gradient(130deg, #ee32ff 30%, #7930ff 70%);
      }
      &:nth-child(3) {
        background: linear-gradient(130deg, #ff562c 30%, #ff9f21 70%);
      }
      &:hover {
        transform: translateY(-5px);
      }

      .card-content {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .card-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          svg {
            width: 20px;
            height: 20px;
          }
        }

        .card-info {
          h3 {
            font-size: 24px;
            margin: 0;
            font-weight: 600;
          }

          p {
            margin: 4px 0 0;
            opacity: 0.8;
          }
        }
      }

      .card-trend {
        font-size: 14px;
        opacity: 0.9;

        span {
          margin-right: 4px;
          font-weight: bold;
          &.up {
            color: #10b981;
          }
          &.down {
            color: #ef4444;
          }
        }
      }
    }
  }

  .chart-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    .chart-card {
      @include useTheme {
        border: 1px solid getVar('border-color');
      }
      background: var(--bg-card);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 0px 7px rgba(0, 0, 0, 0.1);

      h2 {
        margin: 0 0 24px;
        font-size: 18px;
        @include useTheme {
          color: getVar('textColor');
        }
      }

      .chart {
        height: 300px;
      }
    }
  }
}
</style>


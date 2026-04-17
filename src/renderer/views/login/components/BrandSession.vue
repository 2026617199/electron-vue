<template>
  <div class="brand-section">
    <!-- 背景效果 -->
    <div class="grid-bg"></div>
    <div class="glow-orbs">
        <div class="glow-orb glow-orb-1"></div>
        <div class="glow-orb glow-orb-2"></div>
        <div class="glow-orb glow-orb-3"></div>
    </div>

    <!-- 粒子 -->
    <div class="particles-container" v-if="particleLen">
        <div 
        v-for="i in particleLen" 
        :key="i" 
        class="particle"
        :style="{
            left: Math.random() * 100 + '%',
            width: (2 + Math.random() * 3) + 'px',
            height: (2 + Math.random() * 3) + 'px',
            animationDuration: (10 + Math.random() * 10) + 's',
            animationDelay: Math.random() * 10 + 's',
            transform: 'translateY(100vh) rotate(0deg)',
            opacity: 0
        }"
        ></div>
    </div>

    <!-- 品牌内容 -->
    <div class="brand-content">
        <!-- Logo -->
        <div class="logo-section">
        <div class="logo-wrapper">
            <div class="logo-mark">
                <div class="logo-ring"></div>
                <img src="@/assets/icon/test.png" width="56" alt="">
                <!-- <div class="logo-shape">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div> -->
            </div>
            <span class="logo-text"> {{ brandName }}</span>
        </div>
        </div>

        <!-- 主标题 -->
        <h1 class="hero-title">
        <span class="line">
            <span class="text gradient-text">{{ $t('LOGIN_BRAND.HERO_TITLE') }}</span>
        </span>
        </h1>
        <p class="hero-subtitle">{{ $t('LOGIN_BRAND.HERO_SUBTITLE') }}</p>

        <!-- 3D悬浮卡片 -->
        <div class="floating-cards">
        <!-- 连接线 -->
        <div class="connection-lines">
            <div class="connection-line line-1"></div>
            <div class="connection-line line-2"></div>
            <div class="connection-line line-3"></div>
        </div>

        <!-- 数据统计卡片 -->
        <div class="float-card card-stats">
            <div class="card-stats-header">
            <span class="card-stats-label">{{ $t('LOGIN_BRAND.STATS_LABEL') }}</span>
            <span class="card-stats-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
                </svg>
                12%
            </span>
            </div>
            <div class="card-stats-value">{{ animatedCount.toLocaleString() }}</div>
            <div class="card-stats-chart">
            <div 
                v-for="(h, i) in chartBars" 
                :key="i" 
                class="chart-bar" 
                :style="{ 
                height: h + '%',
                animationDelay: (i * 0.1) + 's'
                }"
            ></div>
            </div>
        </div>

        <!-- 用户头像卡片 -->
        <div class="float-card card-users">
            <div class="card-users-title">{{ $t('LOGIN_BRAND.CARD_TECH_STACK') }}</div>
            <div class="avatar-stack">
                <div class="avatar" v-for="(avatar, i) in avatars" :key="i">
                    <img :src="avatar" class="avatar-img" alt="User">
                </div>
                <div class="avatar avatar-more">+10</div>
            </div>
            <div class="online-indicator">
            <span class="online-dot"></span>
            <span>{{ $t('LOGIN_BRAND.ONLINE_COLLAB') }}</span>
            </div>
        </div>

        <!-- 活动通知卡片 -->
        <div class="float-card card-activity">
            <div class="activity-item" v-for="(activity, i) in activityList" :key="i">
            <div class="activity-icon" :class="activity.color">
                <svg v-if="activity.icon === 'file'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                </svg>
                <svg v-if="activity.icon === 'message'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-if="activity.icon === 'check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <div class="activity-text">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toPascalCase } from '@/renderer/utils/format'

const { t } = useI18n()

const props = defineProps({
  brandName: {
    type: String,
    default: 'Brand Name'
  }
})

const brandName = ref(toPascalCase(props.brandName))

const chartBars = ref([65, 45, 80, 55, 90, 70, 85])
const animatedCount = ref(0)
const particleLen = ref(0)
const avatars = ref([
    'https://favicon.im/cn.vuejs.org',
    'https://favicon.im/www.electronjs.org',
    'https://favicon.im/cn.vitejs.dev',
    'https://favicon.im/element-plus.org'
])

const activityList = computed(() => [
    { icon: 'message', color: 'purple', title: t('LOGIN_BRAND.ACTIVITY_MSG'), time: t('LOGIN_BRAND.ACTIVITY_TIME_15M') },
    { icon: 'check', color: 'green', title: t('LOGIN_BRAND.ACTIVITY_DONE'), time: t('LOGIN_BRAND.ACTIVITY_TIME_1H') }
])

onMounted(() => {
    const target = 24853
    const duration = 2000
    
    const startTime = Date.now() + 500
    
    const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        animatedCount.value = Math.round(target * progress)
        
        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            animatedCount.value = target
        }
    }
    particleLen.value = 15
    
    setTimeout(animate, 500)
})
</script>

<style lang="scss" scoped>
.brand-section {
    height: 100%;
    flex: 1;
    background: linear-gradient(135deg, #0c0c14 0%, #12121f 50%, #0f1419 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
}

/* 动态网格背景 */
.grid-bg {
    position: absolute;
    inset: 0;
    background-image: 
    linear-gradient(rgb(99 102 241 / 6%) 1px, transparent 1px), linear-gradient(90deg, rgb(99 102 241 / 8%) 1px, transparent 1px);
    background-size: 60px 60px;
    // animation: gridScroll 30s linear infinite;
}

@keyframes gridScroll {
    0% { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
}

/* 渐变光晕 */
.glow-orbs {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
}

.glow-orb-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
    top: -10%;
    left: -10%;
    animation: orbFloat1 15s ease-in-out infinite;
}

.glow-orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
    bottom: -5%;
    right: -5%;
    animation: orbFloat2 18s ease-in-out infinite;
}

.glow-orb-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: orbFloat3 12s ease-in-out infinite;
}

@keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, 30px) scale(1.1); }
    66% { transform: translate(-30px, 50px) scale(0.95); }
}

@keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, -30px) scale(1.05); }
    66% { transform: translate(30px, -40px) scale(0.9); }
}

@keyframes orbFloat3 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.5; }
}

/* 粒子效果 */
.particles-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.particle {
    position: absolute;
    background: rgba(121, 123, 232, 0.6);
    // background: rgba(99, 102, 241, 0.6);
    border-radius: 50%;
    animation: particleFloat linear infinite;
}

@keyframes particleFloat {
    0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% {
    transform: translateY(-100px) rotate(720deg);
    opacity: 0;
    }
}

/* 品牌内容 */
.brand-content {
    position: relative;
    z-index: 10;
}

/* Logo 区域 */
.logo-section {
    margin-bottom: 30px;
}

.logo-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 16px;
}

.logo-mark {
    position: relative;
    width: 56px;
    height: 56px;
}

.logo-shape {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: logoBreath 4s ease-in-out infinite;
    box-shadow: 
    0 10px 40px rgba(99, 102, 241, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

@keyframes logoBreath {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.logo-shape svg {
    width: 28px;
    height: 28px;
    color: white;
}

.logo-ring {
    position: absolute;
    inset: -8px;
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-radius: 20px;
    animation: ringRotate 10s linear infinite;
}

.logo-ring::before {
    content: '';
    position: absolute;
    top: -3px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #6366f1;
    border-radius: 50%;
    box-shadow: 0 0 10px #6366f1;
}

@keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.logo-text {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

/* 主标题 */
.hero-title {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 10px;
    letter-spacing: -2px;
}

.hero-title .line {
    display: block;
    overflow: hidden;
}

.hero-title .text {
    display: inline-block;
    animation: slideUp 0.8s ease-out backwards;
}

.hero-title .line:nth-child(1) .text { animation-delay: 0.1s; }
.hero-title .line:nth-child(2) .text { animation-delay: 0.2s; }

@keyframes slideUp {
    from {
    transform: translateY(100%);
    opacity: 0;
    }
    to {
    transform: translateY(0);
    opacity: 1;
    }
}

.hero-title .gradient-text {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
}

.hero-title .white-text {
    color: white;
}

.hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 40px;
    animation: fadeIn 0.8s ease-out 0.4s backwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ========== 3D 悬浮卡片区域 ========== */
.floating-cards {
    position: relative;
    height: 280px;
    perspective: 1000px;
    animation: fadeIn 1s ease-out 0.6s backwards;
}

.float-card {
    position: absolute;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 24px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.float-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-10px) scale(1.02) !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

/* 卡片1 - 实时数据 */
.card-stats {
    width: 200px;
    top: 0;
    left: 0;
    animation: float1 6s ease-in-out infinite;
}

@keyframes float1 {
    0%, 100% { transform: translateY(0) rotateX(5deg) rotateY(-5deg); }
    50% { transform: translateY(-15px) rotateX(0deg) rotateY(0deg); }
}

.card-stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.card-stats-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.card-stats-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(16, 185, 129, 0.2);
    border-radius: 20px;
    font-size: 11px;
    color: #10b981;
}

.card-stats-badge svg {
    width: 12px;
    height: 12px;
}

.card-stats-value {
    font-size: 36px;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
    font-variant-numeric: tabular-nums;
}

.card-stats-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 40px;
}

.chart-bar {
    flex: 1;
    background: linear-gradient(to top, #6366f1, #8b5cf6);
    border-radius: 4px;
    animation: barGrow 2s ease-out infinite;
}

@keyframes barGrow {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.6); }
}

/* 卡片2 - 用户头像组 */
.card-users {
    width: 220px;
    top: 30px;
    right: 0;
    animation: float2 7s ease-in-out infinite;
}

@keyframes float2 {
    0%, 100% { transform: translateY(0) rotateX(-3deg) rotateY(5deg); }
    50% { transform: translateY(-20px) rotateX(3deg) rotateY(-3deg); }
}

.card-users-title {
    font-size: 14px;
    color: white;
    font-weight: 600;
    margin-bottom: 16px;
}

.avatar-stack {
    display: flex;
    margin-bottom: 16px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid #717171;
    margin-left: -12px;
    position: relative;
    animation: avatarPop 0.5s ease-out backwards;
}

.avatar:first-child { margin-left: 0; }
.avatar:nth-child(1) { animation-delay: 0.1s; z-index: 5; background-color: #e3e3e3; }
.avatar:nth-child(2) { animation-delay: 0.2s; z-index: 4; background-color: #e3e3e3; }
.avatar:nth-child(3) { animation-delay: 0.3s; z-index: 3; background-color: #e3e3e3; }
.avatar:nth-child(4) { animation-delay: 0.4s; z-index: 2; background-color: #e3e3e3; }
.avatar:nth-child(5) { animation-delay: 0.5s; z-index: 1; background-color: #e3e3e3; }

@keyframes avatarPop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-more {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: white;
}

.online-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
}

.online-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

/* 卡片3 - 活动通知 */
.card-activity {
    width: 260px;
    top: 140px;
    left: 50%;
    transform: translateX(-50%);
    animation: float3 8s ease-in-out infinite;
}

@keyframes float3 {
    0%, 100% { transform: translateX(-50%) translateY(0) rotateX(3deg) rotateY(3deg); }
    50% { transform: translateX(-50%) translateY(-12px) rotateX(-2deg) rotateY(-2deg); }
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    animation: slideIn 0.5s ease-out backwards;
}

.activity-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.activity-item:nth-child(1) { animation-delay: 0.2s; }
.activity-item:nth-child(2) { animation-delay: 0.4s; }
.activity-item:nth-child(3) { animation-delay: 0.6s; }

@keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.activity-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.activity-icon svg {
    width: 18px;
    height: 18px;
}

.activity-icon.purple {
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
}

.activity-icon.blue {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
}

.activity-icon.green {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
}

.activity-text {
    flex: 1;
    min-width: 0;
}

.activity-title {
    font-size: 13px;
    color: white;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.activity-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

/* 连接线动画 */
.connection-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.connection-line {
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
    height: 1px;
    animation: linePulse 3s ease-in-out infinite;
}

.line-1 {
    width: 100px;
    top: 80px;
    left: 180px;
    transform: rotate(20deg);
    animation-delay: 0s;
}

.line-2 {
    width: 80px;
    top: 160px;
    left: 200px;
    transform: rotate(-15deg);
    animation-delay: 1s;
}

.line-3 {
    width: 120px;
    top: 120px;
    left: 380px;
    transform: rotate(45deg);
    animation-delay: 2s;
}

@keyframes linePulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
}
</style>
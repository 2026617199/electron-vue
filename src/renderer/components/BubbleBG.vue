<template>
    <div class="animated-bg">
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* 动画背景 - 仅在暗色模式显示 */
.animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
    opacity: 1;
    transition: opacity var(--theme-transition);
}

[data-mode="light"] .animated-bg {
    opacity: 0.5;
}

.bubble {
    position: absolute;
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
    transition: background var(--theme-transition);
}

.bubble:nth-child(1) {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    top: -150px;
    right: -150px;
    opacity: 0.15;
}

.bubble:nth-child(2) {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, var(--secondary), var(--primary-light));
    bottom: -100px;
    left: -100px;
    opacity: 0.1;
    animation-delay: -7s;
}

.bubble:nth-child(3) {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
    top: 40%;
    left: 20%;
    opacity: 0.1;
    animation-delay: -14s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    25% { transform: translate(40px, -40px) rotate(90deg) scale(1.1); }
    50% { transform: translate(-30px, 30px) rotate(180deg) scale(0.95); }
    75% { transform: translate(30px, 40px) rotate(270deg) scale(1.05); }
}
</style>
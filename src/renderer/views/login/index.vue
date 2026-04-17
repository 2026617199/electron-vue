<template>
  <div class="login-content">

    <LoginTopBar class="title-bar" />

    <div class="lf-item">
      <BrandSession :brandName="appInfo.name" />
    </div>
    <div class="rg-item">
      <LoginFormCard />
    </div>
  </div>
</template>

<script setup lang='ts'>
import LoginTopBar from '@/renderer/components/base/loginTopBar/LoginTopBar.vue'
import LoginFormCard from '@/renderer/views/login/components/LoginFormCard.vue'
import BrandSession from '@/renderer/views/login/components/BrandSession.vue'
import { appInfo } from '@/renderer/consts/appInfo'

// 这里表单不能用ref定义，否则校验失效
const loginForm = reactive({
  userName: '',
  password: ''
})

</script>

<style lang="scss" scoped>
.slide-left-enter-active {
  animation: slide-right 0.5s;
}
.slide-left-leave-active {
  animation: slide-left 0.5s reverse;
}
.slide-right-enter-active {
  animation: slide-left 0.5s;
}
.slide-right-leave-active {
  animation: slide-right 0.5s reverse;
}

@keyframes slide-left {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slide-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}


.login-content {
  height: 100vh;
  background-size: cover;
  display: flex;
  .title-bar {
    position: absolute;
    padding: 5px 10px;
    width: 100%;
    top: 0;
    z-index: 1;
  }
  .lf-item {
    flex: 1;
  }
  .rg-item {
    width: 400px;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    :deep(.ep-form-item) {
      margin-bottom: 25px;
    }
    :deep(.ep-form-item__content) {
      line-height: inherit;
      font-size: inherit;
    }
  }
}
.login-bg-gif {
  translate: -50% -50%;
  left: 50%;
  top: 50%;
  width: 400px;
  height: 400px;
}
</style>

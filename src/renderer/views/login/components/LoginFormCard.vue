<template>
  <div class="form-container">
    <div class="login-side">
      <div class="header">
          <h1>{{ $t('COMMON.WELCOME_BACK') }}</h1>
          <p>{{ $t('COMMON.LOGIN_PROMPT') }}</p>
      </div>

      <form @submit.prevent="submitLogin">
        <div class="form-group">
            <!-- <label>Email Address</label>
            <div class="input-wrapper">
                <i class="ri-mail-line"></i>
                <input type="email" placeholder="name@company.com" v-model="loginForm.username" required>
            </div> -->
            <fancy-input
              v-model="loginForm.username"
              :label="$t('COMMON.USER_NAME')"
              :placeholder="$t('COMMON.PLACEHOLDER_ENTER_USERNAME')"
              :clearable="true"
              :maxlength="20"
            ></fancy-input>
        </div>

        <div class="form-group">
            <!-- <label>Password</label>
            <div class="input-wrapper">
                <i class="ri-lock-2-line"></i>
                <input type="password" placeholder="Enter your password" v-model="loginForm.password" required>
            </div> -->
            <fancy-input
              v-model="loginForm.password"
              :label="$t('COMMON.PASSWORD')"
              :placeholder="$t('COMMON.PLACEHOLDER_ENTER_PASSWORD')"
              type="password"
              :clearable="true"
              :maxlength="16"
            ></fancy-input>
        </div>

        <div class="actions">
            <label class="checkbox-container">
                <input type="checkbox"> 
                <span>{{ $t('COMMON.REMBER_PWD') }}</span>
            </label>
            <a href="#" class="forgot">{{ $t('COMMON.FORGET_PWD') }}</a>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoggingIn" :class="{ 'loading': isLoggingIn }">
            <span v-if="!isLoggingIn">{{ $t('COMMON.LOGIN') }}</span>
            <span v-else><el-icon><Loading /></el-icon> {{ $t('COMMON.IS_LOGGING_IN') }}</span>
        </button>
      </form>
      
      <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--text-dim);">
          {{ $t('COMMON.NO_ACCOUNT') }} <a href="#" style="color: var(--primary);"> {{ $t('COMMON.REGISTER_IMMEDIATE') }}</a>
      </div>
    </div>
    <div class="login-footer">
      {{ appInfo.copyright }}
     </div>
  </div>
</template>
<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { ipcRenderService } from '@/renderer/services/ipcService';
import FancyInput from '@/renderer/components/base/fancyInput/Fancyinput.vue'
import { appInfo } from '@/renderer/consts/appInfo'

const loginForm = ref({
  password: '123456',
  username: 'admin',
})

const router = useRouter()

const isLoggingIn = ref(false)

const submitLogin = () => {
  isLoggingIn.value = true
  ipcRenderService.send('app:login-status', 1)
  setTimeout(() => {
    router.push({ name: 'INDEX' })
    isLoggingIn.value = false
  }, 500)
}
</script>


<style lang='scss' scoped>
.form-container {
  width: 100%;
  /* 右侧登录区 */
  .login-side {
      width: 100%;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      // background: var(--bg-primary);
  
      & .header {
          margin-bottom: 40px;
  
          & h1 { font-size: 24px; margin-bottom: 8px; }
          & p { color: var(--text-muted); font-size: 14px; }
      }
  
      & .form-group {
          margin-bottom: 24px;
          position: relative;
  
          & label {
              display: block;
              font-size: 12px;
              color: var(--text-muted);
              margin-bottom: 8px;
              font-weight: 500;
          }
  
          & .input-wrapper {
              position: relative;
              
              & i {
                  position: absolute;
                  left: 14px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: var(--text-dim);
                  transition: var(--transition);
              }
  
              & input {
                  width: 100%;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid var(--border-glass);
                  padding: 14px 14px 14px 44px;
                  border-radius: var(--radius-md);
                  color: #fff;
                  font-size: 14px;
                  transition: var(--transition);
  
                  &::placeholder { color: var(--text-dim); }
  
                  &:focus {
                      background: rgba(255, 255, 255, 0.08);
                      border-color: var(--primary);
                      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                  }
  
                  &:focus + i { color: var(--primary); }
              }
          }
      }
  
      & .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          font-size: 13px;
  
          & .checkbox-container {
              display: flex;
              align-items: center;
              cursor: pointer;
              color: var(--text-muted);
              
              & input { margin-right: 8px; accent-color: var(--primary); }
              &:hover { color: var(--text-main); }
          }
  
          & .forgot {
              color: var(--primary);
              text-decoration: none;
              &:hover { text-decoration: underline; }
          }
      }
  
      & .btn-primary {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
  
          &:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px -5px var(--primary-glow);
          }
  
          &:active { transform: translateY(0); }
          
          &.loading {
              opacity: 0.8;
              cursor: not-allowed;
              pointer-events: none;
          }
      }
  }
  .login-footer {
    font-size: 12px;
    text-align: center;
    color: var(--text-muted);
  }
}
</style>

<template>
  <div class="form-wrap g-backdrop-filter">
    <span class="hero-text">{{ $t('COMMON.WELCOME_FOR_USE')}}</span>

    <el-form ref="loginFormRef" class="login-wrapper" :rules="rules" :model="loginForm">
      <AccountLogin ref="accountLoginRef" />
    </el-form>

    <div class="flex justify-between flex-items-center">
      <el-checkbox v-model="rememberPwd">{{ $t('COMMON.REMBER_PWD') }}</el-checkbox>
      <div>
        <!-- <el-link :underline="false">{{ $t('COMMON.FORGET_PWD') }}</el-link>
        <el-divider direction="vertical" /> -->
        <el-link @click="handleRegister" :underline="false">{{ $t('COMMON.REGISTER') }}</el-link>
      </div>
    </div>

    <div @click="submitLogin(loginFormRef)" class="login-btn">{{ $t('COMMON.LOGIN') }}</div>

  </div>
</template>

<script setup lang='ts'>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AccountLogin from './AccountLogin.vue'

const { t } = useI18n()
const router = useRouter()
const rememberPwd = ref(false)
const inputType = ref('password')

const loginFormRef = ref()
const accountLoginRef = ref()
const loginForm = reactive({
  userName: '',
  phone: '',
  password: ''
})

const rules = computed(() => ({
  userName: [
    { required: true, message: t('COMMON.PLACEHOLDER_ENTER_USERNAME'), trigger: 'change' },
  ],
  password: [
    { required: true, message: t('COMMON.PLACEHOLDER_ENTER_PASSWORD'), trigger: 'change' },
  ],
}))

const toggleView = (value: string) => {
  inputType.value = value === 'password' ? 'text' : 'password'
}

const formFieldBlur = ($event: any) => {
  loginFormRef.value.validateField('userName')
  loginFormRef.value.validateField('password')
}

const submitLogin = async (FormInstance: { validate: (arg0: (valid: any, fields: any) => void) => any; }) => {
  console.log('accountLoginRef', accountLoginRef)
  const formParams = await accountLoginRef.value.validateForm()
  console.log('formParams', formParams)
  router.push('/main')
}

const handleRegister = () => {
  router.push('/register')
}

const handleTabClick = (value: any) => {
  console.log(value)
}


</script>

<style lang="scss" scoped>
.form-wrap {
  border: 1px solid var(--ep-border-color);
  border-radius: 10px;
  padding: 20px 50px;
  .login-wrapper {
    padding: 20px 0 0;
  }
  .login-btn {
    text-align: center;
    // border: 1px solid #e3e3e3;
    padding: 10px 20px;
    cursor: pointer;
    color: #fff;
    border-radius: 3px;
    // background-image: linear-gradient(315deg,#6772FF 0,#00F9E5 100%);
    background-image: linear-gradient(to left,#00F9E5,#6772FF,#00F9E5);
    text-transform: uppercase;
    background-size: 200%;
    transition: 0.6s;
    &:hover {
      background-position: right;
    }
  }
  h1 {
    display: inline-block;
    font-weight: bold;
    margin-bottom: 20px;
    background-image: var(--app-background-gradient-blue_to_violet);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
}
.toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
  cursor: pointer;
}
@keyframes fadeIn {
  to {
    opacity: 1;
    pointer-events: unset;
    transform: translateX(0);
  }
}
.flex {
  display: flex;
}
.hero-text {
  color: transparent;
  font-size: 40px;
  font-weight: bold;
  background: var(--vp-home-hero-name-background);
  background-clip: text;
  -webkit-background-clip: text;
}

.g-backdrop-filter {
        backdrop-filter: blur(6px);
    }
</style>

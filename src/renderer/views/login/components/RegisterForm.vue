<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formLoading = ref(false)
const inputType = ref('password')

const loginFormRef = ref()
const registerForm = reactive({
  userName: '',
  password: ''
})

const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
  ],
})

const toggleView = (value: string) => {
  inputType.value = value === 'password' ? 'text' : 'password'
}

const formFieldBlur = ($event: any) => {
  loginFormRef.value.validateField('userName')
  loginFormRef.value.validateField('password')
}

const submitForm = async (FormInstance: { validate: (arg0: (valid: any, fields: any) => void) => any; }) => {
  await FormInstance.validate((valid: any, fields: any) => {
    if (valid) {
      formLoading.value = true
      setTimeout(() => {
        formLoading.value = false
        router.push('/main')
      }, 1000)
    } else {
      console.log('error submit!', fields)
    }
  })
  // ElMessage({
  //   message: 'Congrats, this is a success message.',
  //   type: 'success',
  // })
}
</script>

<template>
  <div class="form-wrap">
    <div class="text-center p-1">注册</div>
    <el-form ref="loginFormRef" :rules="rules" label-width="100px" :model="registerForm">
      <el-form-item label="userName" prop="userName">
        <el-input v-model="registerForm.userName" />
      </el-form-item>
      <!--  -->
      <el-form-item label="password" prop="password">
        <el-input v-model="registerForm.password" />
      </el-form-item>
      <el-form-item>
        <el-button @click="submitForm(loginFormRef)" type="primary" :loading="formLoading">提交</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<style scoped>

</style>

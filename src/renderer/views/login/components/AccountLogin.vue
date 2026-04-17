<template>
  <div>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-position="top"
      status-icon
    >
      <div class="login-field-wrap">
        <el-form-item prop="name">
          <HeroInput :label="$t('COMMON.PHONE_NUMBER')" v-model="ruleForm.name"></HeroInput>
        </el-form-item>
        <el-form-item prop="desc">
          <HeroInput :label="$t('COMMON.PASSWORD')" v-model="ruleForm.desc" type="password"></HeroInput>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import HeroInput from '@/renderer/components/base/heroInput/HeroInput.vue'

const { t } = useI18n()

interface RuleForm {
  name: string
  desc: string
}

const ruleFormRef = ref()

const ruleForm = reactive<RuleForm>({
  name: 'admin',
  desc: '123456',
})

const rules = computed(() => ({
  name: [
    { required: true, message: t('COMMON.PLACEHOLDER_ENTER_USERNAME'), trigger: 'blur' }
  ],
  desc: [
    { required: true, message: t('COMMON.PLACEHOLDER_ENTER_PASSWORD'), trigger: 'blur' }
  ]
}))

const validateForm = () => {
  return new Promise((resolve, reject) => {
    ruleFormRef.value.validate((valid: any, fields: any) => {
      if (valid) {
        console.log('submit!')
        resolve(ruleForm)
      } else {
        reject(new Error('form invalid!'))
      }
    })
  })
}

// 校验多个表单
const validateAllForm = () => {
  return Promise.all([
    ruleFormRef.value.validate()
    // ruleFormRef.value.validate()
  ]).then(values => {
    const mergeValues = values.reduce((curForm, form) => {
      return Object.assign(form, curForm)
    }, {})
    console.log('79898', mergeValues)
    return mergeValues
  })
}

// 模板引用需要导出才能访问
defineExpose({
  validateForm
})

</script>

<style scoped>
</style>
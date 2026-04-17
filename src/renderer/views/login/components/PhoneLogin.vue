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
          <!-- <el-input v-model="ruleForm.name" /> -->
          <HeroInput :label="$t('COMMON.USER_NAME')" v-model="ruleForm.name"></HeroInput>
        </el-form-item>
        <el-form-item prop="desc">
          <HeroInput :label="$t('COMMON.PASSWORD')" v-model="ruleForm.desc"></HeroInput>
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
  name: '',
  desc: '',
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

// 模板引用需要导出才能访问
defineExpose({
  validateForm
})

</script>

<style scoped>

</style>
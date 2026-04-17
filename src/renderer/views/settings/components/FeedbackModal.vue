<template>

  <div class="feedback-modal">

    <el-dialog

      v-model="localVisible"

      :title="$t('FEEDBACK.TITLE')"

      :width="'500px'"

      :close-on-click-modal="false"

      :close-on-press-escape="false"

    >

      <div class="feedback-content">

        <el-form :model="feedbackForm" :rules="rules" ref="feedbackFormRef" label-width="80px">

          <el-form-item :label="$t('FEEDBACK.TYPE_LABEL')" prop="type">

            <el-select v-model="feedbackForm.type" :placeholder="$t('FEEDBACK.TYPE_PLACEHOLDER')" style="width: 100%;">

              <el-option :label="$t('FEEDBACK.TYPE_SUGGESTION')" value="suggestion" />

              <el-option :label="$t('FEEDBACK.TYPE_BUG')" value="bug" />

              <el-option :label="$t('FEEDBACK.TYPE_UI')" value="ui" />

              <el-option :label="$t('FEEDBACK.TYPE_OTHER')" value="other" />

            </el-select>

          </el-form-item>



          <el-form-item :label="$t('FEEDBACK.CONTENT_LABEL')" prop="content">

            <el-input

              v-model="feedbackForm.content"

              type="textarea"

              :rows="5"

              :placeholder="$t('FEEDBACK.CONTENT_PLACEHOLDER')"

              maxlength="500"

              show-word-limit

            />

          </el-form-item>



          <el-form-item :label="$t('FEEDBACK.CONTACT_LABEL')" prop="contact">

            <el-input

              v-model="feedbackForm.contact"

              :placeholder="$t('FEEDBACK.CONTACT_PLACEHOLDER')"

              maxlength="50"

            />

          </el-form-item>

        </el-form>

      </div>



      <template #footer>

        <div class="dialog-footer">

          <el-button @click="handleCancel" type="default">{{ $t('COMMON.actions.cancel') }}</el-button>

          <el-button @click="handleSubmit" type="primary" :loading="submitting">{{ $t('FEEDBACK.SUBMIT') }}</el-button>

        </div>

      </template>

    </el-dialog>

  </div>

</template>



<script setup lang="ts">

import { ref, reactive, watch, computed } from 'vue'

import { useI18n } from 'vue-i18n'

import { ElMessage } from 'element-plus'

import type { FormInstance, FormRules } from 'element-plus'



const { t } = useI18n()



const props = defineProps<{

  visible: boolean

}>()



const emit = defineEmits<{

  'update:visible': [value: boolean]

  'submit': [form: FeedbackForm]

}>()



const feedbackFormRef = ref<FormInstance>()



const submitting = ref(false)



const localVisible = ref(props.visible)



watch(() => props.visible, (newVal) => {

  localVisible.value = newVal

})



watch(localVisible, (newVal) => {

  emit('update:visible', newVal)

})



interface FeedbackForm {

  type: string

  content: string

  contact: string

}



const feedbackForm = reactive<FeedbackForm>({

  type: '',

  content: '',

  contact: ''

})



const rules = computed<FormRules<FeedbackForm>>(() => ({

  type: [

    { required: true, message: t('FEEDBACK.RULE_TYPE'), trigger: 'change' }

  ],

  content: [

    { required: true, message: t('FEEDBACK.RULE_CONTENT'), trigger: 'change' },

    { min: 10, message: t('FEEDBACK.RULE_CONTENT_MIN'), trigger: 'change' }

  ],

  contact: [

    { pattern: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^1[3-9]\d{9}$/,

      message: t('FEEDBACK.RULE_CONTACT'),

      trigger: 'change' }

  ]

}))



const handleCancel = () => {

  resetForm()

  emit('update:visible', false)

}



const handleSubmit = async () => {

  if (!feedbackFormRef.value) return

  

  try {

    await feedbackFormRef.value.validate()

    submitting.value = true

    

    setTimeout(() => {

      ElMessage.success(t('FEEDBACK.SUBMIT_SUCCESS'))

      emit('submit', { ...feedbackForm })

      resetForm()

      emit('update:visible', false)

      submitting.value = false

    }, 1000)

  } catch (error) {

    console.error('表单验证失败:', error)

  }

}



const resetForm = () => {

  feedbackForm.type = ''

  feedbackForm.content = ''

  feedbackForm.contact = ''

  feedbackFormRef.value?.resetFields()

}

</script>



<style scoped lang="scss">

.feedback-modal {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
  .feedback-content {
    padding: 10px 0;
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

</style>


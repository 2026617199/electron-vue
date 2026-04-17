<template>
  <div class="verify-code-input">
    <div class="input-wrapper">
      <input
        v-for="(item, index) in codeLength" 
        :key="index"
        type="text"
        maxlength="1"
        v-model="codeArray[index]"
        @input="handleInput($event, index)"
        @keydown.delete="handleDelete($event, index)"
        @keydown.left="focusPrev(index)"
        @keydown.right="focusNext(index)"
        @paste="handlePaste"
        ref="inputRefs"
      >
    </div>
  </div>
</template>

<script setup lang='ts'>
// - 文字输入校验
// - 支持配置密码长度
// - 删除当前输入框的内容后自动跳转到前一个输入框
// - 支持复制黏贴
// - 支持键盘左右键切换
import { ref, watch } from 'vue'

const props = defineProps({
  codeLength: {
    type: Number,
    default: 6
  },
  value: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:value', 'complete'])

const codeArray = ref<string[]>(new Array(props.codeLength).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

// 处理输入
const handleInput = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  
  // 只允许输入数字
  if (!/^\d*$/.test(value)) {
    codeArray.value[index] = ''
    return
  }

  if (value) {
    // 自动跳转到下一个输入框
    if (index < props.codeLength - 1) {
      focusNext(index)
    }
  }

  emitValue()
}

// 处理删除
const handleDelete = (e: KeyboardEvent, index: number) => {
  if (codeArray.value[index]) {
    // 如果当前输入框有值，清空当前值
    codeArray.value[index] = ''
  } else if (index > 0) {
    // 如果当前输入框为空且不是第一个输入框，则清空前一个输入框的值并聚焦
    codeArray.value[index - 1] = ''
    focusPrev(index)
  }
  emitValue()
}

// 聚焦前一个输入框
const focusPrev = (index: number) => {
  if (index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

// 聚焦后一个输入框
const focusNext = (index: number) => {
  if (index < props.codeLength - 1) {
    inputRefs.value[index + 1].focus()
  }
}

// 处理粘贴
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasteText = e.clipboardData?.getData('text')
  if (!pasteText) return
  
  const numbers = pasteText.match(/\d/g)
  if (!numbers) return

  numbers.slice(0, props.codeLength).forEach((num, index) => {
    codeArray.value[index] = num
  })

  emitValue()
}

// 发送值更新
const emitValue = () => {
  const value = codeArray.value.join('')
  emit('update:value', value)
  
  if (value.length === props.codeLength) {
    emit('complete', value)
  }
}

// 监听外部值变化
watch(() => props.value, (newVal) => {
  const chars = newVal.split('')
  codeArray.value = [...chars, ...new Array(props.codeLength - chars.length).fill('')]
})
</script>

<style lang="scss" scoped>
.verify-code-input {
  display: flex;
  justify-content: center;
  align-items: center;

  .input-wrapper {
    display: flex;
    gap: 8px;

    input {
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 20px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      outline: none;
      transition: border-color 0.2s;
      
      &:focus {
        border-color: #409eff;
      }
    }
  }
}
</style>

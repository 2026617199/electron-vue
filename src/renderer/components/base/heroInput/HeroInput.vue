<template>
  <div class="hero-input-wrapper">
    <div class="input-box">
      <input v-model="inputValue" @blur="handleInputBlur" :type="type" required >
      <span>{{ displayLabel }}</span>
      <div class="toggle">
        <slot name="afterIcon"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const props = defineProps({
  modelValue: {
		type: String,
		default: ''
	},
  label: {
    type: String,
    default: ''
  },
  // 输入框类型：text、password
  type: {
    type: String,
    default: 'text'
  },
})

const displayLabel = computed(() => props.label || t('COMMON.USER_NAME'))

const inputValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})

const handleInputBlur = () => {

}

</script>

<style lang="scss" scoped>
// 登录输入框
.hero-input-wrapper {
  .input-box {
    position: relative;
    width: 100%;
    transition: .4s ease-in-out;
    animation: fadeIn .4s ease-out forwards;
  }
  .input-box input {
    padding: 10px 40px 10px 10px;
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    border-radius: 2px;
    color: #fff;
    border: 1px solid #e3e3e3;
    font-size: 1em;
  }
  .input-box span {
    position: absolute;
    left: 10px;
    padding: 10px 0;
    pointer-events: none;
    font-size: 14px;
    transition: 0.3s;
    text-transform: uppercase;
    color: #c5bdbd;
    letter-spacing: 0.1em;
  }
  .input-box input:valid ~ span,
  .input-box input:focus ~ span {
    color: #fff;
    // line-height: inherit;
    font-size: 0.75em;
    transform: translateX(10px) translateY(-7px);
    padding: 0 5px;
    background-image: linear-gradient(315deg,#6772FF 0,#00F9E5 100%);
    border-radius: 2px;
  }
  .input-box input:focus {
    border: 1px solid var(--ep-color-primary)
  }
  .input-box input:focus .toggle {
    color: #00B6B6;
  }
  .toggle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 20px;
    cursor: pointer;
  }
}
@keyframes fadeIn {
  to {
    opacity: 1;
    pointer-events: unset;
    transform: translateX(0);
  }
}
.hero-text {
  color: transparent;
  font-size: 40px;
  background: var(--vp-home-hero-name-background);
  background-clip: text;
  -webkit-background-clip: text;
}
</style>

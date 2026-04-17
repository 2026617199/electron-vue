<template>
    <div :class="componentClass">
        <div class="fancy-input__wrapper">
            <input
                :type="inputType"
                :value="modelValue"
                :disabled="disabled"
                :maxlength="maxlength"
                class="fancy-input__field"
                :class="{'fancy-input__border': !!modelValue}"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
            />
            
            <!-- 浮动标签 -->
            <label 
                class="fancy-input__label"
                :class="{ 'fancy-input__label--active': isLabelActive }"
            >
                {{ label || placeholder }}
            </label>
            
            <!-- 清除按钮 -->
            <button
                v-if="clearable"
                type="button"
                class="fancy-input__clear"
                :class="{ 'fancy-input__clear--visible': showClearButton }"
                @click="clearInput"
                tabindex="-1"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <!-- 密码显示/隐藏切换 -->
            <button
                v-if="type === 'password'"
                type="button"
                class="fancy-input__toggle"
                @click="togglePassword"
                tabindex="-1"
            >
                <!-- 显示密码图标 -->
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <!-- 隐藏密码图标 -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            </button>
        
        <!-- 底部动画线 -->
        <!-- <div class="fancy-input__underline"></div> -->
        </div>
        
        <!-- 错误提示 -->
        <div 
        class="fancy-input__error"
        :class="{ 'fancy-input__error--visible': error && errorMessage }"
        >
        {{ errorMessage }}
        </div>
        
        <!-- 字符计数 -->
        <div v-if="showCounter && maxlength" class="fancy-input__counter">
        {{ modelValue.length }} / {{ maxlength }}
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text',
        validator: (value: string) => ['text', 'password'].includes(value)
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    clearable: {
        type: Boolean,
        default: false
    },
    maxlength: {
        type: Number,
        default: null
    },
    showCounter: {
        type: Boolean,
        default: false
    },
    error: {
        type: Boolean,
        default: false
    },
    success: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear']);

const isFocused = ref(false);
const showPassword = ref(false);
const isShaking = ref(false);

// 计算实际显示的输入类型
const inputType = computed(() => {
    if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

// 标签是否激活（上移）
const isLabelActive = computed(() => {
    return isFocused.value || props.modelValue.length > 0;
});

// 是否显示清除按钮
const showClearButton = computed(() => {
    return props.clearable && props.modelValue.length > 0 && !props.disabled;
});

// 组件类名
const componentClass = computed(() => {
    return {
    'fancy-input': true,
    'fancy-input--password': props.type === 'password',
    'fancy-input--error': props.error,
    'fancy-input--success': props.success,
    'fancy-input--disabled': props.disabled,
    'fancy-input--shake': isShaking.value
    };
});

// 处理输入
const handleInput = (event: InputEvent) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value);
};

// 处理聚焦
const handleFocus = (event: FocusEvent) => {
    isFocused.value = true;
    emit('focus', event);
};

// 处理失焦
const handleBlur = (event: FocusEvent) => {
    isFocused.value = false;
    emit('blur', event);
};

// 切换密码显示
const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

// 清除输入
const clearInput = () => {
    emit('update:modelValue', '');
    emit('clear');
};

// 触发抖动动画
const triggerShake = () => {
    isShaking.value = true;
    setTimeout(() => {
    isShaking.value = false;
    }, 300);
};

// 监听错误状态变化，触发抖动
watch(() => props.error, (newVal, oldVal) => {
    if (newVal && !oldVal) {
    triggerShake();
    }
});
</script>

<style scoped lang="scss">
.fancy-input {
    position: relative;
    width: 100%;
}

.fancy-input__wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.fancy-input__field {
    width: 100%;
    padding: 16px 14px;
    padding-right: 45px;
    font-size: 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    outline: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent;
    color: var(--text-primary);
}

.fancy-input__border {
    border: 1px solid var(--primary);
}

.fancy-input__field:hover {
    box-shadow: 0 0 0 2px var(--primary-alpha);
}

.fancy-input__field:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

/* 错误状态 */
.fancy-input--error .fancy-input__field {
    border-color: #f44336;
}

.fancy-input--error .fancy-input__field:focus {
    box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.1);
}

.fancy-input--error .fancy-input__label {
    color: #f44336;
}

/* 成功状态 */
.fancy-input--success .fancy-input__field {
    border-color: #4caf50;
}

.fancy-input--success .fancy-input__field:focus {
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.fancy-input--success .fancy-input__label {
    color: #4caf50;
}

/* 浮动标签 */
.fancy-input__label {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #999;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--bg-primary);
    padding: 0 4px;
}

.fancy-input__label--active {
    top: 0;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--primary);
}

.fancy-input--error .fancy-input__label--active {
    color: #f44336;
}

.fancy-input--success .fancy-input__label--active {
    color: #4caf50;
}

/* 密码切换按钮 */
.fancy-input__toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--border-color);
    transition: all 0.3s ease;
    border-radius: 50%;
}

.fancy-input__toggle:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
}

.fancy-input__toggle svg {
    width: 17px;
    height: 17px;
    transition: transform 0.3s ease;
}

.fancy-input__toggle:active svg {
    transform: scale(0.9);
}

/* 清除按钮 */
.fancy-input__clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    border-radius: 50%;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
}

.fancy-input__clear--visible {
    opacity: 1;
    visibility: visible;
}

.fancy-input__clear:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.fancy-input__clear svg {
    width: 13px;
    height: 13px;
}

/* 密码框时清除按钮位置调整 */
.fancy-input--password .fancy-input__clear {
    right: 45px;
}

/* 错误提示 */
.fancy-input__error {
    font-size: 12px;
    color: #f44336;
    margin-top: 6px;
    padding-left: 14px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.fancy-input__error--visible {
    opacity: 1;
    transform: translateY(0);
}

/* 字符计数 */
.fancy-input__counter {
    font-size: 12px;
    color: #999;
    text-align: right;
    margin-top: 4px;
    padding-right: 4px;
}

/* 禁用状态 */
.fancy-input--disabled .fancy-input__field {
    background: #f5f5f5;
    cursor: not-allowed;
    color: #999;
}

.fancy-input--disabled .fancy-input__label {
    color: #bbb;
}

/* 输入框动画 */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.fancy-input--shake .fancy-input__field {
    animation: shake 0.3s ease;
}
</style>
<template>
  <div>
    <div id="editor" :style="editorStyle"></div>
  </div>
</template>

<script setup lang='ts'>
import Quill from 'quill'
import "quill/dist/quill.core.css";

let quillInstance = ref()

const props = defineProps({
  placeholder: {
    type: String,
    default() {
      return '请输入内容...'
    }
  },
  readOnly: {
    type: Boolean,
    default() {
      return false
    }
  },
  minHeight: {
    type: Number,
    default() {
      return 150
    }
  },
  toolbarOptions: {
    type: Array,
    default() {
      return [
        { 'header': [1, 2, 3, 4, 5, 6, false] },
        'bold', 'italic', 'underline', 'image', 'strike',
        'blockquote',
        { 'align': [] },
        { 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' },
        { 'indent': '-1'}, { 'indent': '+1' }, 'code-block', 'link', 
        { 'color': [] }, { 'background': [] }, 'formula',
        { 'font': [] }, 'video', 
        'clean',
      ]
    }
   }
})

const editorStyle = computed(() => {
  return {
    width: '100%',
    minHeight: `${props.minHeight}px`
  }
})

onMounted(() => {
  quillInstance.value = new Quill('#editor', {
    modules: {
      toolbar: props.toolbarOptions
    },
    readOnly: props.readOnly,
    placeholder: props.placeholder,
    theme: 'snow'
  })
})

defineExpose({
  quillInstance
})
</script>


<style lang="scss" scoped>

</style>

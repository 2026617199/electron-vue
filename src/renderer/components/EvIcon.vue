<template>
  <!-- element-plus 动态图标 -->
  <el-icon>
    <component
      :size="20"
      :is="props.iconName">
    </component>
  </el-icon>
</template>

<script setup lang='ts'>
import { Delete, User, Setting, PictureRounded, Upload } from '@element-plus/icons-vue'


const props = defineProps({
  iconName: {
    default: () => Setting
  }
})
</script>

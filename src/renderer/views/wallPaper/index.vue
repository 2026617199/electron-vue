<template>
  <div class="wallpaper">
    <div class="wallpaper__upload">
      <el-upload
        v-model:file-list="fileList"
        class="wallpaper__upload-demo"
        :on-change="handleFileChange"
        :before-upload="handleBeforeUpload"
        action=""
        :auto-upload="false"
        :limit="1"
      >
        <el-button type="primary">{{ $t('COMMON.WALLPAPER_UPLOAD') }}</el-button>
        <template #tip>
          <div class="el-upload__tip">
            {{ $t('COMMON.WALLPAPER_TIP') }}
          </div>
        </template>
      </el-upload>
      <el-button type="success" @click="downloadImage" :disabled="!hasUploadedImage">
        {{ $t('COMMON.WALLPAPER_DOWNLOAD') }}
      </el-button>
    </div>
    <div class="wallpaper__preview">
      <img class="wallpaper__phone" src="@/assets/bg/phone/iphone.png" alt="phone-shell">
      <canvas id="canvas-area" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import type { UploadProps, UploadUserFile } from 'element-plus'
import phoneShellImg from '../../../assets/bg/phone/iphone.png';

const fileList = ref([]);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const hasUploadedImage = ref(false);

// 处理图片上传
function handleFileChange(uploadFile: any) {
  const file = uploadFile.raw;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      if (canvasRef.value) {
        const ctx = canvasRef.value.getContext('2d');
        if (ctx) {
          // 清空画布
          ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
          // 绘制图片并自适应canvas大小
          const scale = Math.min(
            canvasRef.value.width / img.width,
            canvasRef.value.height / img.height
          );
          const x = (canvasRef.value.width - img.width * scale) / 2;
          const y = (canvasRef.value.height - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          hasUploadedImage.value = true;
        }
      }
    };
    img.src = e.target?.result as string;
  };
  
  reader.readAsDataURL(file);
}

// 下载合成图片
async function downloadImage() {
  if (canvasRef.value) {
    // 创建临时canvas，使用更大的尺寸
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.value.width * 2;  // 增加输出尺寸
    tempCanvas.height = canvasRef.value.height * 2;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // 启用图像平滑
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      
      // 首先绘制用户上传的图片
      tempCtx.drawImage(canvasRef.value, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // 加载并绘制手机壳图片
      const phoneShell = new Image();
      phoneShell.src = phoneShellImg;
      
      await new Promise((resolve) => {
        phoneShell.onload = () => {
          tempCtx.drawImage(phoneShell, 0, 0, tempCanvas.width, tempCanvas.height);
          resolve(null);
        };
      });
      
      // 下载合成后的图片，使用更高的质量设置
      const link = document.createElement('a');
      link.download = 'phone-case.png';
      link.href = tempCanvas.toDataURL('image/png', 1.0); // 使用最高质量
      link.click();
    }
  }
}

function handleBeforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    // ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    // ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  return true;
}

onMounted(() => {
  if (canvasRef.value) {
    // 增加canvas尺寸以提高清晰度
    canvasRef.value.width = 400;  // 原来是200
    canvasRef.value.height = 800; // 原来是400
  }
})
</script>

<style lang="scss" scoped>
.wallpaper {
  padding: 16px;
  
  &__upload {
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  
  &__preview {
    width: 200px;
    height: 400px;
    position: relative;
  }
  
  &__phone {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  
  #canvas-area {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}
</style>
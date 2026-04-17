<template>
  <div class="music-player">
    <!-- 单独的背景层 -->
    <!-- <div class="background-blur" :style="backgroundStyle"></div> -->
    <!-- 内容层 -->
    <div class="content-wrapper">
      <div class="visualization-area">
        <div class="disc-container">
          <div class="needle-wrapper">
            <img 
              src="@/assets/icon/music.png" 
              class="needle-img" 
              :class="{ 'needle-playing': isPlaying }"
              alt="needle"
            >
          </div>
          <div class="disc" :class="{ 'disc-playing': isPlaying }">
            <div class="disc-vinyl">
              <div class="disc-light"></div>
              <div class="disc-grooves"></div>
            </div>
            <div class="disc-inner">
              <img 
                :src="currentSong?.cover || defaultCover" 
                class="album-cover"
              >
            </div>
          </div>
        </div>
        <div>
          <div>
            <canvas ref="canvasRef" width="450" height="300"></canvas>
          </div>
          <!-- 在控制按钮下方添加进度条 -->
          <div class="progress-container">
            <!-- 当前时间 -->
            <span class="time">{{ formatTime(currentTime) }}</span>
            <!-- 进度条 -->
            <div class="progress-bar" 
                 ref="progressBar"
                 @mousemove="handleProgressHover"
                 @mouseleave="hidePreview"
                 @click="handleProgressClick">
              <!-- 已播放进度 -->
              <div class="progress-played" :style="{ width: `${progress}%` }"></div>
              
              <!-- 预览标记 -->
              <div class="progress-preview-marker" 
                   v-show="showPreview"
                   :style="{ left: `${previewPosition}%` }">
                <div class="preview-time">{{ formatTime(previewTime) }}</div>
              </div>
            </div>
            
            <!-- 总时长 -->
            <span class="time">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <audio ref="audioRef" @play="startVisualization" @pause="stopVisualization"></audio>
      <div class="controls">
        <button @click="handleTogglePlay">{{ isPlaying ? t('MUSIC_VISUAL.PAUSE') : t('MUSIC_VISUAL.PLAY') }}</button>
        <el-button @click="handleReplay">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
        <el-button @click="showConfig = !showConfig">
          <el-icon><Setting /></el-icon>
        </el-button>
        <el-button @click="handleUploadMusic">
          <el-icon><Upload /></el-icon>
          <span>{{ t('MUSIC_VISUAL.SELECT_MUSIC') }}</span>
        </el-button>
        <!-- 在控制按钮区域添加音量控制 -->
        <div class="volume-controls">
          <!-- 静音按钮 -->
          <el-button @click="toggleMute">
                <svg-icon v-if="isMuted" class-name="sound-icon" icon-class="sound-disabled"></svg-icon>
                <svg-icon v-else class-name="sound-icon" icon-class="sound"></svg-icon>
          </el-button>
          
          <!-- 音量滑块 -->
          <el-slider
            v-model="volume"
            :min="0"
            :max="1"
            :step="0.01"
            :show-tooltip="true"
            :format-tooltip="(value: any) => `${Math.round(value * 100)}%`"
            @input="setVolume"
            class="volume-slider"
          />
        </div>
      </div>

      <!-- 添加歌词显示区域 -->
      <div class="lyrics-container" v-if="lyrics.length">
        <div class="lyrics-wrapper" :style="{ transform: `translateY(${-currentLyricIndex * 30}px)` }">
          <div v-for="(line, index) in lyrics" 
               :key="index" 
               class="lyric-line"
               :class="{ active: index === currentLyricIndex }">
            {{ line.text }}
          </div>
        </div>
      </div>

      <!-- 配置面板 -->
      <el-drawer v-model="showConfig" :size="350" :title="t('MUSIC_VISUAL.CONFIG_TITLE')">
        <div class="config-panel">
          <!-- 可视化模式选择 -->
          <div class="config-item">
            <span>{{ t('MUSIC_VISUAL.VISUAL_MODE') }}</span>
            <el-radio-group v-model="config.visualMode" size="small">
              <el-radio-button label="bars">{{ t('MUSIC_VISUAL.MODE_BARS') }}</el-radio-button>
              <el-radio-button label="circle">{{ t('MUSIC_VISUAL.MODE_CIRCLE') }}</el-radio-button>
              <el-radio-button label="electric">{{ t('MUSIC_VISUAL.MODE_ELECTRIC') }}</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 背景图片配置（移到所有模式都可见的位置） -->
          <div class="config-item">
            <span>{{ t('MUSIC_VISUAL.BG_IMAGE') }}</span>
            <el-upload
              class="background-uploader"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleCanvasBgUpload"
            >
              <img
                v-if="config.backgroundImage" 
                :src="config.backgroundImage" 
                class="preview-image"
              >
              <el-button v-else>{{ t('MUSIC_VISUAL.SELECT_IMAGE') }}</el-button>
            </el-upload>
            <el-button 
              v-if="config.backgroundImage" 
              @click="clearBackground" 
              type="danger" 
              link
            >
              {{ t('MUSIC_VISUAL.CLEAR') }}
            </el-button>
          </div>

          <!-- 背景透明度配置 -->
          <div class="config-item" v-if="config.backgroundImage">
            <span>{{ t('MUSIC_VISUAL.BG_OPACITY') }}</span>
            <el-slider 
              v-model="config.backgroundOpacity" 
              :min="0.1" 
              :max="1" 
              :step="0.1" 
            />
          </div>

          <!-- 根据不同模式显示对应的配置项 -->
          <template v-if="config.visualMode === 'bars'">
            <!-- 条形图配置 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.BAR_WIDTH') }}</span>
              <el-slider v-model="config.barWidth" :min="8" :max="20" :step="1" />
            </div>
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.BAR_GAP') }}</span>
              <el-slider v-model="config.gap" :min="2" :max="10" :step="1" />
            </div>
          </template>

          <template v-if="config.visualMode === 'circle'">
            <!-- 圆形配置 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.CIRCLE_RADIUS') }}</span>
              <el-slider v-model="config.circleConfig.radius" :min="50" :max="150" :step="10" />
            </div>
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.BAR_COUNT') }}</span>
              <el-slider 
                v-model="config.circleConfig.barCount" 
                :min="60" 
                :max="128" 
                :step="4" 
              />
            </div>
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.BAR_WIDTH') }}</span>
              <el-slider 
                v-model="config.circleConfig.barWidth" 
                :min="2" 
                :max="8" 
                :step="1" 
              />
            </div>
            <!-- 添加中心图片配置 -->
            <div class="config-item">
              <!-- 圆环中心图片 -->
              <span>{{ t('MUSIC_VISUAL.CENTER_IMAGE') }}</span>
              <el-upload
                class="center-image-uploader"
                accept="image/*"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleCircleCenterImageChange"
              >
                <img 
                  v-if="config.circleConfig.centerImage" 
                  :src="config.circleConfig.centerImage" 
                  class="preview-center-image"
                >
                <el-button v-else>{{ t('MUSIC_VISUAL.SELECT_IMAGE') }}</el-button>
              </el-upload>
              <el-button 
                v-if="config.circleConfig.centerImage" 
                @click="clearCenterImage" 
                type="danger" 
                link
              >
                {{ t('MUSIC_VISUAL.CLEAR') }}
              </el-button>
            </div>
            
            <!-- 添加中心圆形大小调节 -->
            <div class="config-item" v-if="config.circleConfig.centerImage">
              <span>{{ t('MUSIC_VISUAL.CENTER_SIZE') }}</span>
              <el-slider 
                v-model="config.circleConfig.centerRadius" 
                :min="0.5" 
                :max="0.9" 
                :step="0.05"
              />
            </div>
          </template>

          <template v-if="['bars', 'circle'].includes(config.visualMode)">
            <!-- 条形图高度系数 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.HEIGHT_RATIO') }}</span>
              <el-slider v-model="config.heightRatio" :min="0.5" :max="1" :step="0.1" />
            </div>
            <!-- 渐变色配置 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.COLOR_BOTTOM') }}</span>
              <el-color-picker v-model="config.colors.bottom" />
            </div>
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.COLOR_MIDDLE') }}</span>
              <el-color-picker v-model="config.colors.middle" />
            </div>
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.COLOR_TOP') }}</span>
              <el-color-picker v-model="config.colors.top" />
            </div>
            <!-- 背景色配置 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.BG_COLOR') }}</span>
              <el-color-picker 
                v-model="config.backgroundColor" 
                show-alpha
                :predefine="[
                  'rgba(0, 0, 0, 0.2)',
                  'rgba(0, 0, 0, 0.5)',
                  'rgba(25, 25, 25, 0.8)'
                ]"
              />
            </div>
            <!-- 发光效果 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.GLOW_INTENSITY') }}</span>
              <el-slider v-model="config.shadowBlur" :min="0" :max="30" :step="1" />
            </div>
  
            <!-- 网格效果开关 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.GRID_EFFECT') }}</span>
              <el-switch v-model="config.showGrid" />
            </div>
  
            <!-- 网格颜色 -->
            <div class="config-item" v-if="config.showGrid">
              <span>{{ t('MUSIC_VISUAL.GRID_COLOR') }}</span>
              <el-color-picker 
                v-model="config.gridColor" 
                show-alpha
                :predefine="[
                  'rgba(255, 255, 255, 0.1)',
                  'rgba(0, 204, 255, 0.1)',
                  'rgba(0, 255, 153, 0.1)'
                ]"
              />
            </div>
  
            <!-- 波动幅度 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.AMPLITUDE') }}</span>
              <el-slider v-model="config.amplitudeRatio" :min="0.1" :max="2" :step="0.1" />
            </div>
          </template>

          <!-- 纵向网格数量配置 -->
          <div class="config-item" v-if="config.showGrid">
            <span>{{ t('MUSIC_VISUAL.GRID_V_COUNT') }}</span>
            <el-slider v-model="config.gridVerticalLines" :min="1" :max="8" :step="1" />
          </div>

          <!-- 横向网格数量配置 -->
          <div class="config-item" v-if="config.showGrid">
            <span>{{ t('MUSIC_VISUAL.GRID_H_COUNT') }}</span>
            <el-slider v-model="config.gridHorizontalLines" :min="1" :max="10" :step="1" />
          </div>
          <!-- 修改电音模式下的中心图片上传部分 -->
          <div class="config-item" v-if="config.visualMode === 'electric'">
            <span>{{ t('MUSIC_VISUAL.CENTER_IMAGE') }}</span>
            <el-upload
              class="emblem-uploader"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleEmblemImageChange"
            >
              <template v-if="config.electric.emblem.image">
                <div class="emblem-preview">
                  <img 
                    :src="config.electric.emblem.image" 
                    class="preview-emblem"
                  >
                </div>
              </template>
              <el-button v-else>{{ t('MUSIC_VISUAL.SELECT_IMAGE') }}</el-button>
            </el-upload>
            <el-button 
              v-if="config.electric.emblem.image" 
              @click="clearEmblemImage" 
              type="danger" 
              link
            >
              {{ t('MUSIC_VISUAL.CLEAR') }}
            </el-button>
          </div>

          <!-- 基础半径配置 -->
          <div class="config-item" v-if="config.electric.emblem.image">
            <span>{{ t('MUSIC_VISUAL.BASE_RADIUS') }}</span>
            <el-slider 
              v-model="config.electric.emblem.radius" 
              :min="50" 
              :max="200" 
              :step="5"
            />
          </div>

          <!-- 半径比例配置 -->
          <div class="config-item" v-if="config.electric.emblem.image">
            <span>{{ t('MUSIC_VISUAL.RADIUS_RATIO') }}</span>
            <el-slider 
              v-model="config.electric.emblem.radiusRatio" 
              :min="0.5" 
              :max="2" 
              :step="0.1"
              :format-tooltip="(val: any) => `${val}x`"
            />
          </div>

          

          <!-- 歌词上传 -->
          <div class="config-item">
            <span>{{ t('MUSIC_VISUAL.LYRIC_FILE') }}</span>
            <el-upload
              class="lyric-uploader"
              accept=".lrc"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleLyricFileChange"
            >
              <el-button>{{ t('MUSIC_VISUAL.SELECT_LYRIC') }}</el-button>
            </el-upload>
            <el-button v-if="lyrics.length" 
              @click="clearLyrics" 
              type="danger" 
              link>
              {{ t('MUSIC_VISUAL.CLEAR') }}
            </el-button>
          </div>

          <!-- 默认封面上传 -->
          <div class="config-item">
            <span>{{ t('MUSIC_VISUAL.DEFAULT_COVER') }}</span>
            <el-upload
              class="cover-uploader"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleDefaultCoverChange"
            >
              <img v-if="defaultCover" :src="defaultCover" class="preview-cover">
              <el-button v-else>{{ t('MUSIC_VISUAL.SELECT_COVER') }}</el-button>
            </el-upload>
            <el-button v-if="defaultCover" 
              @click="clearDefaultCover" 
              type="danger" 
              link>
              {{ t('MUSIC_VISUAL.CLEAR') }}
            </el-button>
          </div>
          <template v-if="config.visualMode === 'circle'">
            <!-- 震动控制选项 -->
            <div class="config-item">
              <span>{{ t('MUSIC_VISUAL.SHAKE_EFFECT') }}</span>
              <el-switch v-model="config.shake.enabled" />
            </div>
  
            <template v-if="config.shake.enabled">
              <div class="config-item">
                <span>{{ t('MUSIC_VISUAL.SHAKE_INTENSITY') }}</span>
                <el-slider 
                  v-model="config.shake.intensity" 
                  :min="0" 
                  :max="1" 
                  :step="0.1" 
                />
              </div>
              
              <div class="config-item">
                <span>{{ t('MUSIC_VISUAL.SHAKE_SPEED') }}</span>
                <el-slider 
                  v-model="config.shake.speed" 
                  :min="0.1" 
                  :max="2" 
                  :step="0.1" 
                />
              </div>
              
              <div class="config-item">
                <span>{{ t('MUSIC_VISUAL.MAX_DISPLACEMENT') }}</span>
                <el-slider 
                  v-model="config.shake.maxDisplacement" 
                  :min="1" 
                  :max="20" 
                  :step="1" 
                />
              </div>
            </template>
          </template>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Setting, RefreshRight, Upload } from '@element-plus/icons-vue'
import { useMusicVisualization } from '@/renderer/hooks/useMusicVisualization'

const { t } = useI18n()

const {
  audioRef,
  config,
  canvasRef,
  lyrics,
  isPlaying,
  currentLyricIndex,
  defaultCover,
  currentTime,
  progress,
  duration,
  stopVisualization,
  handleTogglePlay,
  handleReplay,
  handleLyricFileChange,
  clearBackground,
  clearCenterImage,
  clearDefaultCover,
  clearLyrics,
  handleCanvasBgUpload,
  formatTime,
  handleDefaultCoverChange,
  startVisualization,
  handleCircleCenterImageChange,
  handleUploadMusic,
  handleEmblemImageChange,
  clearEmblemImage,
  volume,
  isMuted,
  setVolume,
  toggleMute
} = useMusicVisualization()

const audio = ref<HTMLAudioElement>()

// 配置面板显示状态
const showConfig = ref(false)

// 添加对 visualMode 的监听

// 扩展 MusicItem 接口
interface MusicItem {
  name: string
  artist?: string
  path: string
  lrcPath?: string
  cover?: string  // 添加封面图片路径
}

// 状态定义
const musicList = ref<MusicItem[]>([])
const currentSongIndex = ref<number>(-1)

// 计算属性
const currentSong = computed<MusicItem | null>(() => 
  currentSongIndex.value >= 0 ? musicList.value[currentSongIndex.value] : null
)

// 进度相关状态
const showPreview = ref(false)
const previewPosition = ref(0)
const previewTime = ref(0)
const progressBar = ref<HTMLElement | null>(null)

// 处理进度条悬停
const handleProgressHover = (e: MouseEvent) => {
  if (!progressBar.value || !duration.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const position = (e.clientX - rect.left) / rect.width
  previewPosition.value = position * 100
  previewTime.value = position * duration.value
  showPreview.value = true
}

// 隐藏预览
const hidePreview = () => {
  showPreview.value = false
}

// 处理进度条点击
const handleProgressClick = (e: MouseEvent) => {
  if (!progressBar.value || !duration.value || !audio.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const position = (e.clientX - rect.left) / rect.width
  audio.value.currentTime = position * duration.value
}

// 背景样式计算
const backgroundStyle = computed(() => {
  if (currentSong.value?.cover || defaultCover.value) {
    return {
      backgroundImage: `url(${currentSong.value?.cover || defaultCover.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: 'blur(3px) brightness(0.8)',
      // transform: 'scale(1.1)', // 避免模糊边缘
    }
  }
  return {}
})

// 添加震动状态管理
const shakeState = reactive({
  waveFrameX: 0,
  waveFrameY: 0,
  waveSpeedX: 1,
  waveSpeedY: 1,
  waveAmplitudeX: 1,
  waveAmplitudeY: 1,
  trigX: Math.round(Math.random()),
  trigY: Math.round(Math.random()),
  // 新增状态
  lastShakeTime: 0,
  currentIntensity: 0,
  targetIntensity: 0
})

// 修改震动效果的应用函数
const applyShakeEffect = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
  if (!config.shake.enabled) return
  
  ctx.save()
  
  // 计算当前音频数据的平均能量
  const avgEnergy = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
  // 归一化能量值到 0-1 范围
  const normalizedEnergy = avgEnergy / 256
  
  // 添加震动阈值
  const SHAKE_THRESHOLD = 0.4
  const MIN_SHAKE_INTERVAL = 100 // 最小震动间隔(ms)
  
  const now = Date.now()
  const timeSinceLastShake = now - shakeState.lastShakeTime

  // 只有当能量超过阈值且间隔足够时才触发新的震动
  if (normalizedEnergy > SHAKE_THRESHOLD && timeSinceLastShake > MIN_SHAKE_INTERVAL) {
    shakeState.targetIntensity = normalizedEnergy
    shakeState.lastShakeTime = now
  }

  // 平滑过渡当前震动强度
  const SMOOTH_FACTOR = 0.15
  shakeState.currentIntensity += (shakeState.targetIntensity - shakeState.currentIntensity) * SMOOTH_FACTOR
  
  // 震动强度随时间衰减
  const DECAY_RATE = 0.95
  shakeState.targetIntensity *= DECAY_RATE

  // 根据音频能量和当前强度计算位移
  const displacement = shakeState.currentIntensity * config.shake.maxDisplacement * config.shake.intensity
  
  // 使用当前强度影响震动速度
  const currentSpeed = config.shake.speed * (0.5 + shakeState.currentIntensity)
  
  // 更新波动
  shakeState.waveFrameX += currentSpeed
  if (shakeState.waveFrameX > config.shake.duration) {
    shakeState.waveFrameX = 0
    shakeState.waveAmplitudeX = 0.5 + (Math.random() * 0.5 * shakeState.currentIntensity)
    shakeState.waveSpeedX = (Math.random() - 0.5) * 2 * shakeState.currentIntensity
    shakeState.trigX = Math.round(Math.random())
  }
  
  shakeState.waveFrameY += currentSpeed
  if (shakeState.waveFrameY > config.shake.duration) {
    shakeState.waveFrameY = 0
    shakeState.waveAmplitudeY = 0.5 + (Math.random() * 0.5 * shakeState.currentIntensity)
    shakeState.waveSpeedY = (Math.random() - 0.5) * 2 * shakeState.currentIntensity
    shakeState.trigY = Math.round(Math.random())
  }
  
  const trigFuncX = shakeState.trigX === 0 ? Math.cos : Math.sin
  const trigFuncY = shakeState.trigY === 0 ? Math.cos : Math.sin
  
  // 使用当前强度调制位移
  const dx = trigFuncX(shakeState.waveFrameX) * displacement * shakeState.waveAmplitudeX
  const dy = trigFuncY(shakeState.waveFrameY) * displacement * shakeState.waveAmplitudeY
  
  ctx.translate(dx, dy)
}
</script>

<style lang="scss" scoped>
.music-player {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-sizing: border-box;
  isolation: isolate;
  flex: 1;
}

canvas {
  /* background: linear-gradient(to bottom, #000000, #1a1a1a); */
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
}

.controls {
  display: flex;
  gap: 1rem;
}

.config-panel {
  padding: 20px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  span {
    min-width: 80px;
  }
  
  .el-slider {
    flex: 1;
  }

  /* 当配置项包含开关时的样式 */
  .el-switch {
    margin-left: auto;
  }

  .el-upload {
    flex: 1;
  }
}

/* 为颜色选择器添加一些预设样式 */
:deep(.el-color-picker__trigger) {
  width: 100px;
}

.background-uploader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 100px;
  height: 60px;
  object-fit: contain; /* 改为 contain 以保持比例 */
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1); /* 添加背景色以显示空白区域 */
}

.lyrics-container {
  width: 100%;
  height: 55px;
  overflow: hidden;
  box-sizing: border-box;
}

.lyrics-wrapper {
  transition: transform 0.3s ease;
}

.lyric-line {
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.lyric-line.active {
  color: #00ccff;
  font-size: 1.1em;
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
}

.disc-container {
  z-index: 1;
}

.disc {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  position: relative;
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
  margin-top: 45px;
  margin-left: 10px;
}

.disc-vinyl {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  overflow: hidden;
}

.disc-light {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    30deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0) 45%, 
    rgba(255, 255, 255, 0.08) 65%
  );
}

.disc-grooves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-radial-gradient(
    circle at 50% 50%,
    transparent 0,
    transparent 1px,
    rgba(255, 255, 255, 0.04) 1.5px,
    transparent 2px
  ),
  repeating-radial-gradient(
    circle at 50% 50%,
    transparent 0,
    transparent 4px,
    rgba(255, 255, 255, 0.06) 5px,
    transparent 6px
  );
  opacity: 0.8;
}

.disc-inner {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 1;
  border: none;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 移除之前的黑色圆圈 */
.disc-inner::after {
  display: none; /* 或直接删除这个伪元素样式 */
}

/* 调整唱片边缘效果 */
.disc::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: linear-gradient(to right,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.3)
  );
  z-index: 2;
  pointer-events: none;
}

/* 优化旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.disc-playing {
  animation-play-state: running;
}

/* 调整可视化区域布局 */
.visualization-area {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

canvas {
  margin-left: 25px;
  /* margin-left: 250px; 为唱片留出空间 */
}

.preview-cover {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #333;
}

.cover-uploader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.needle-wrapper {
  position: absolute;
  left: 18%;
  top: -10px;
  z-index: 2;
  transform: translateX(-25%);
}

.needle-img {
  width: 76px;
  transform-origin: 100% 0;
  transform: rotate(-95deg);
  transition: all 0.3s ease-out;
}

.needle-playing {
  transform: rotate(-73deg);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
  margin: 10px 0;
  box-sizing: border-box;
  
  .time {
    font-size: 12px;
    color: #999;
    min-width: 40px;
  }
}

.progress-bar {
  position: relative;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  
  &:hover {
    height: 6px;
    
    .progress-played {
      height: 6px;
    }
  }
}

.progress-played {
  position: absolute;
  left: 0;
  top: 0;
  height: 4px;
  background: linear-gradient(to right, #00ff99, #00ccff);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-preview-marker {
  position: absolute;
  top: -25px;
  width: 2px;
  height: 20px;
  background: #fff;
  transform: translateX(-50%);
  
  .preview-time {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
  }
}

.preview-center-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.center-image-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.volume-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
  
  .volume-slider {
    width: 100px;
  }
  
  :deep(.el-slider__runway) {
    margin: 0;
  }
}

.emblem-uploader {
  :deep(.el-upload) {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }

  .emblem-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--el-border-color);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .preview-emblem {
    width: 100%;
    height: 100%;
    object-fit: cover; // 保持图片比例并填充容器
    border-radius: 50%;
  }
}
</style>
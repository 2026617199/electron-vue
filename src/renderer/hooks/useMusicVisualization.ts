import { ref, nextTick, onUnmounted, reactive } from 'vue'
import { ipcRenderService } from '../services/ipcService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { i18n } from '@/common/locales'

/**
 * 音乐可视化组件功能清单
 * 
 * 1. 支持多模式切换：柱形图、圆环图、电音动感特效
 * 2. 进度条预览
 * 3. 音量可视化显示：音量调节、静音
 * 4. 歌词字体大小/样式自定义
 * 5. 背景图片上传
 * 6. 背景图片清除
 * 7. 中心图片上传
 * 8. 中心图片清除
 * 9. 默认封面上传
 * 11. 默认封面清除
 * 12. 歌词文件上传
 * 13. 歌词文件清除
 */

// 歌词相关的状态
interface LyricLine {
  time: number;
  text: string;
}

interface VisualizationConfig {
  heightRatio: number
  barWidth: number
  fftSize: number
  gap: number
  colors: {
    bottom: string
    middle: string
    top: string
  }
  backgroundColor: string
  shadowBlur: number
  showGrid: boolean
  gridColor: string
  amplitudeRatio: number
  backgroundImage: string
  backgroundOpacity: number
  gridVerticalLines: number
  gridHorizontalLines: number
  visualMode: 'bars' | 'circle' | 'electric'
  circleConfig: {
    barCount: number
    radius: number
    startColor: string
    endColor: string
    barWidth: number
    minHeight: number
    centerImage: string
    centerRadius: number
  }
  shake: {
    enabled: boolean
    intensity: number
    speed: number
    duration: number
    maxDisplacement: number
  },
  // TODO: 电音效果配置
  electric: any
}

/**
 * 音乐可视化 Hook
 * @param audioElement - 音频元素
 * @param canvasElement - 画布元素
 * @returns 可视化相关的方法和状态
 */
export function useMusicVisualization() {

  const audioRef = ref<HTMLAudioElement>()
  const canvasRef = ref<HTMLCanvasElement>()

  const audioContext = ref<AudioContext>()
  const analyser = ref<AnalyserNode>()
  const source = ref<MediaElementAudioSourceNode>()
  let animationId: number

  const isPlaying = ref(false)

  // 添加音量相关状态
  const gainNode = ref<GainNode | null>(null)
  const volume = ref(1) // 音量值范围 0-1
  const isMuted = ref(false) // 静音状态
  const previousVolume = ref(1) // 存储静音前的音量

  // 默认封面状态
  const defaultCover = ref('')

  const lyrics = ref<LyricLine[]>([])
  const currentLyricIndex = ref(-1)

  // 缓存频繁使用的计算结果
  const canvasSize = reactive({
    width: 550,
    height: 300
  })

  // 进度相关状态
  const currentTime = ref(0)
  const duration = ref(0)
  const showPreview = ref(false)
  const previewPosition = ref(0)
  const previewTime = ref(0)
  const progressBar = ref<HTMLElement | null>(null)
  
  // 顶部小方块高度数组
  const topBlocksHeight = ref<number[]>([])
  
  // 渐变缓存
  const gradientCache = new Map()
  
  // 背景图片对象
  let backgroundImg: HTMLImageElement | null = null
  
  // 默认配置
  const defaultConfig: VisualizationConfig = {
    heightRatio: 1.2,
    barWidth: 12,
    fftSize: 256,
    gap: 5,
    colors: {
      bottom: '#00ff99',
      middle: '#00ccff',
      top: '#0066ff'
    },
    backgroundColor: 'rgba(35, 35, 35, 0.69)',
    shadowBlur: 15,
    showGrid: false,
    gridColor: 'rgba(255, 255, 255, 0.1)',
    amplitudeRatio: 1, // 波动幅度
    backgroundImage: '', // 背景图片 URL
    backgroundOpacity: 0.5, // 背景图片透明度
    gridVerticalLines: 3, // 默认纵向网格线数量
    gridHorizontalLines: 5, // 默认横向网格线数量
    visualMode: 'bars', // 'bars' | 'circle' | 'electric'
    circleConfig: {
      barCount: 60,
      radius: 90,
      startColor: '#16a5a3',
      endColor: '#da2864',
      barWidth: 4,
      minHeight: 4,
      centerImage: '',
      centerRadius: 0.9,
    },
    shake: {
      enabled: false,
      intensity: 0.6,
      speed: 0.5,
      duration: Math.PI / 8,
      maxDisplacement: 7,
    },
    // 电音效果默认配置
    electric: {
      spectrumCount: 8, // 频谱数量
      startBin: 8, // 起始频谱
      keepBins: 40, // 保留频谱
      fftSize: 16384, // 快速傅里叶变换大小
      minDecibels: -40, // 最小分贝，低于此值的音频信号会被忽略
      maxDecibels: -30, // 最大分贝
      minEmblemSize: 480, // 最小图标大小
      temporalSmoothing: 0.1, // 时域平滑常数0-1，越大，频谱变化越平滑，但响应越慢，越小，频谱变化越敏感，但可能会显得跳动
      maxEmblemSize: 600,
      delays: [0, 1, 2, 3, 4, 5, 6, 7],
      smoothMargins: [0, 2, 2, 3, 3, 3, 5, 5],
      colors: ["#FFFFFF", "#FFFF00", "#FF0000", "#FF66FF", "#333399", "#0000FF", "#33CCFF", "#00FF00"],
      spectrumHeightScalar: 0.4,
      exponents: [1, 1.12, 1.14, 1.30, 1.33, 1.36, 1.50, 1.52],
      smoothingPasses: 1,
      glowRadius: 25,
      enableShake: true,
      maxShakeIntensity: Math.PI / 3,
      waveDuration: Math.PI / 8,
      minShakeScalar: 0.9,
      maxShakeScalar: 1.6,
      shake: {
        enabled: true,
        maxIntensity: Math.PI / 3,
        waveDuration: Math.PI / 8,
        minScalar: 0.9,
        maxScalar: 1.6,
        maxDisplacement: 7
      },
      emblem: {
        enabled: true,
        image: '',
        minSize: 480, // 最小尺寸
        maxSize: 600,  // 最大尺寸
        radius: 90,     // 默认半径
        radiusRatio: 1.0 // 默认比例
      },
      smoothingPoints: 3
    }
  }

  const config = reactive<VisualizationConfig>({ ...defaultConfig })

// 添加嵌入图片相关的状态
const emblemState = reactive({
  loaded: false,
  currentRadius: 0,
  image: null as HTMLImageElement | null
})

/**
 * 计算嵌入图片的半径
 */
const calcEmblemRadius = (multiplier: number) => {
  const { radius, radiusRatio } = config.electric.emblem
  // 基础半径 * 配置比例 * 动态变化系数
  return radius * radiusRatio * (1 + multiplier * 0.2) // 0.2 是动态变化的幅度，可以调整
}

/**
 * 处理嵌入图片上传
 */
const handleEmblemImageChange = (file: any) => {
  console.log('handleEmblemImageChange', file)
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      config.electric.emblem.image = e.target?.result as string
      emblemState.image = img
      emblemState.loaded = true
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

/**
 * 清除嵌入图片
 */
const clearEmblemImage = () => {
  config.electric.emblem.image = ''
  emblemState.image = null
  emblemState.loaded = false
}


/**
 * 绘制嵌入图片
 */
const drawEmblem = (ctx: CanvasRenderingContext2D, multiplier: number) => {
  if (!config.electric.emblem.enabled || !emblemState.loaded || !emblemState.image) {
    return
  }

  const img = emblemState.image
  emblemState.currentRadius = calcEmblemRadius(multiplier)
  
  // 计算绘制参数
  const centerX = canvasSize.width / 2
  const centerY = canvasSize.height / 2
  const diameter = emblemState.currentRadius * 2
  
  // 计算图片绘制尺寸和位置
  const imgRatio = img.width / img.height
  let drawWidth, drawHeight, drawX, drawY
  
  if (imgRatio > 1) {
    // 图片较宽
    drawHeight = diameter
    drawWidth = drawHeight * imgRatio
    drawX = centerX - drawWidth / 2
    drawY = centerY - diameter / 2
  } else {
    // 图片较高
    drawWidth = diameter
    drawHeight = drawWidth / imgRatio
    drawX = centerX - diameter / 2
    drawY = centerY - drawHeight / 2
  }
  
  ctx.save()
  
  // 创建圆形裁剪区域
  ctx.beginPath()
  ctx.arc(centerX, centerY, emblemState.currentRadius, 0, Math.PI * 2)
  ctx.clip()
  
  // 绘制图片，保持原始比例
  ctx.drawImage(
    img,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  )
  
  ctx.restore()
}
  // 添加震动效果状态
  const shakeState = reactive({
    waveFrameX: 0,
    waveFrameY: 0,
    waveSpeedX: 1,
    waveSpeedY: 1,
    waveAmplitudeX: 1,
    waveAmplitudeY: 1,
    trigX: Math.round(Math.random()),
    trigY: Math.round(Math.random())
  })

  /**
   * 初始化音频上下文
   * @param audioElement - 音频元素
   */
  const initAudioContext = () => {
    if (audioContext.value && analyser.value) return

    audioContext.value = new AudioContext()
    analyser.value = audioContext.value.createAnalyser()
    // 创建音量控制节点
    gainNode.value = audioContext.value.createGain()
    // 默认2048 越大窗口越精细
    analyser.value.fftSize = 256
    // 电音效果
    if (config.visualMode === 'electric') {
      analyser.value.fftSize = config.electric.fftSize
      analyser.value.smoothingTimeConstant = config.electric.temporalSmoothing;
      analyser.value.minDecibels = config.electric.minDecibels;
      analyser.value.maxDecibels = config.electric.maxDecibels;
    } else if (config.visualMode === 'bars') {
      analyser.value.fftSize = config.fftSize
      analyser.value.smoothingTimeConstant = 0.8
      analyser.value.minDecibels = -100
      analyser.value.maxDecibels = -30
    }

    if (audioRef.value) {
      source.value = audioContext.value.createMediaElementSource(audioRef.value!)
      // 连接顺序: source -> gainNode -> analyser -> destination
      source.value.connect(gainNode.value)
      gainNode.value.connect(analyser.value)
      analyser.value.connect(audioContext.value.destination)

      // 设置初始音量
      gainNode.value.gain.value = volume.value
    }
  }
  /**
   * 绘制圆形可视化
   */
  // 添加圆形可视化绘制函数
  const drawCircle = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const centerX = canvasRef.value!.width / 2
    const centerY = canvasRef.value!.height / 2
    const { barCount, radius, startColor, endColor, barWidth, minHeight, centerImage, centerRadius } = config.circleConfig
    
    ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
    
    // 绘制背景图片
    if (backgroundImg) {
      ctx.globalAlpha = config.backgroundOpacity
      const drawParams = getBackgroundDrawParams()
      if (drawParams) {
        ctx.drawImage(backgroundImg, 
          drawParams.x, 
          drawParams.y, 
          drawParams.width, 
          drawParams.height
        )
      }
      ctx.globalAlpha = 1
    }
    
    // 绘制半透明背景
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
    
    const angleStep = (Math.PI * 2) / barCount
    
    for (let i = 0; i < barCount; i++) {
      const angle = angleStep * i
      const x = centerX + Math.sin(angle) * radius
      const y = centerY + Math.cos(angle) * radius
      
      // 使用渐变色
      const color = gradientColor(startColor, endColor, i, barCount)
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-angle)
      
      // 创建渐变
      const value = Math.max(minHeight, dataArray[i] || 0)
      const height = (value / 256) * 60 * config.amplitudeRatio
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, config.colors.bottom)
      gradient.addColorStop(0.5, config.colors.middle)
      gradient.addColorStop(1, config.colors.top)
      
      ctx.fillStyle = gradient
      ctx.shadowBlur = config.shadowBlur
      ctx.shadowColor = config.colors.middle
      
      // 绘制条形
      ctx.beginPath()
      ctx.roundRect(-barWidth/2, 0, barWidth, height, barWidth/2)
      ctx.fill()
      
      // 绘制顶部小方块
      if (topBlocksHeight.value[i] === undefined) {
        topBlocksHeight.value[i] = height
      }
      
      // 更新顶部小方块位置
      if (height > topBlocksHeight.value[i]) {
        topBlocksHeight.value[i] = height
      } else {
        topBlocksHeight.value[i] = Math.max(
          height,
          topBlocksHeight.value[i] - 0.8
        )
      }
      
      // 绘制顶部小方块
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-barWidth/2, topBlocksHeight.value[i], barWidth, 2)
      
      ctx.restore()
    }
    
    // 绘制中心图片
    if (centerImage) {
      const img = new Image()
      img.src = centerImage
      
      // 创建圆形裁剪区域
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * centerRadius, 0, Math.PI * 2)
      ctx.clip()
      
      // 计算图片绘制参数，确保图片完整覆盖圆形区域
      const imgRatio = img.width / img.height
      const circleSize = radius * centerRadius * 2 // 直径
      
      let drawWidth, drawHeight
      if (imgRatio > 1) {
        // 图片较宽
        drawHeight = circleSize
        drawWidth = drawHeight * imgRatio
      } else {
        // 图片较高
        drawWidth = circleSize
        drawHeight = drawWidth / imgRatio
      }
      
      // 居中绘制图片
      ctx.drawImage(
        img,
        centerX - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
      )
      
      ctx.restore()
    }
    
    // 恢复 context 状态
    if (config.shake.enabled) {
      ctx.restore()
    }
  }

  /**
   * 绘制条形图可视化
   */
  const drawBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvasWidth: number, canvasHeight: number) => {
    
    // 绘制背景图片
    if (backgroundImg) {
      ctx.globalAlpha = config.backgroundOpacity
      const drawParams = getBackgroundDrawParams()
      if (drawParams) {
        ctx.drawImage(backgroundImg, 
          drawParams.x,
          drawParams.y, 
          drawParams.width, 
          drawParams.height
        )
      }
      ctx.globalAlpha = 1
    }
    
    // 绘制半透明背景
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 预计算条形图的布局参数
    const barWidth = config.barWidth // 使用配置中的固定条形宽度
    const gap = config.gap
    const totalBars = dataArray.length
    const totalWidth = (barWidth + gap) * totalBars - gap // 总宽度 = (条形宽度 + 间距) * 条形数量 - 最后一个间距
    
    // 计算起始 x 坐标，使条形图居中显示
    let startX = (canvasWidth - totalWidth) / 2
    
    // 使用缓存的渐变对象
    const getGradient = (height: number) => {
      const gradientKey = `${height}-${config.colors.bottom}-${config.colors.middle}-${config.colors.top}`
      let gradient = gradientCache.get(gradientKey)
      
      if (!gradient) {
        gradient = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight - height)
        gradient.addColorStop(0, config.colors.bottom)
        gradient.addColorStop(0.5, config.colors.middle)
        gradient.addColorStop(1, config.colors.top)
        gradientCache.set(gradientKey, gradient)
      }
      
      return gradient
  }
    
    // 平滑处理数组
    const smoothedData = new Array(dataArray.length)
    const smoothFactor = 0.8 // 平滑系数，可以根据需要调整
    
    for (let i = 0; i < dataArray.length; i++) {
      if (smoothedData[i] === undefined) {
        smoothedData[i] = dataArray[i]
      } else {
        smoothedData[i] = smoothedData[i] * smoothFactor + dataArray[i] * (1 - smoothFactor)
      }
    }
    
    // 绘制条形和网格
    for (let i = 0; i < dataArray.length; i++) {
      const value = smoothedData[i]
      const height = (value / 256) * canvasHeight * config.heightRatio * config.amplitudeRatio
      const x = startX + (barWidth + gap) * i
      
      // 获取渐变
      const gradient = getGradient(height)
      
      ctx.fillStyle = gradient
      ctx.shadowBlur = config.shadowBlur
      ctx.shadowColor = config.colors.middle
      
      // 使用 fillRect 替代 roundRect
      ctx.fillRect(
        Math.round(x),
        Math.round(canvasHeight - height),
        Math.round(barWidth),
        Math.round(height)
      )
      
      // 在每个条形上绘制网格
      if (config.showGrid && height > 0) {
        ctx.strokeStyle = config.gridColor
        ctx.lineWidth = 1
        
        // 绘制水平线
        const horizontalLines = config.gridHorizontalLines
        const lineGap = height / horizontalLines
        for (let j = 1; j <= horizontalLines; j++) {
          const y = Math.round(canvasHeight - height + (lineGap * j)) // 对坐标进行取整
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + barWidth, y)
          ctx.stroke()
        }
        
        // 绘制垂直线
        const verticalLines = config.gridVerticalLines
        const verticalGap = barWidth / verticalLines
        for (let j = 1; j < verticalLines; j++) {
          const xPos = Math.round(x + (verticalGap * j)) // 对坐标进行取整
          ctx.beginPath()
          ctx.moveTo(xPos, canvasHeight - height)
          ctx.lineTo(xPos, canvasHeight)
          ctx.stroke()
        }
      }
      
      // 更新和绘制顶部小方块
      if (height > (topBlocksHeight.value[i] || 0)) {
        topBlocksHeight.value[i] = height
      } else {
        topBlocksHeight.value[i] = Math.max(
          height,
          (topBlocksHeight.value[i] || 0) - 0.8
        )
      }
      
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(
        Math.round(x),
        Math.round(canvasHeight - topBlocksHeight.value[i] - 2),
        Math.round(barWidth),
        2
      )
    }
    
    // 恢复 context 状态
    if (config.shake.enabled) {
      ctx.restore()
    }
  }

  // 绘制频谱
  function drawElectric(ctx: CanvasRenderingContext2D, dataArray: Uint8Array) {
    // 清除画布
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    // 如果有背景图片，先绘制背景
    if (config.backgroundImage) {
      const img = new Image()
      img.src = config.backgroundImage
      
      // 绘制背景图片并应用透明度
      ctx.save()
      ctx.globalAlpha = config.backgroundOpacity
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)
      ctx.restore()
    } else {
      // 如果没有背景图片，使用背景色
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
    }

    // 获取音频数据
    analyser.value!.getByteFrequencyData(dataArray as any)
    let spectrum = transform(dataArray)
    let multiplier = Math.pow(multiplierFun(spectrum), 0.8)
    
    // 应用震动效果
    if (config.electric.shake.enabled) {
      applyShakeEffect(ctx, multiplier)
    }
    
    // 缓存频谱数据，用于创建延迟效果
    if (spectrumCache.length >= maxBufferSize) {
        spectrumCache.shift();
    }
    spectrumCache.push(spectrum);
    // 计算当前半径
    // 测试半径
    let curRad = 100
    // let curRad = calcRadius(multiplier);

    for (let s = config.electric.spectrumCount - 1; s >= 0; s--) {
      // 为每个频谱层保存状态
      ctx.save();
      // 平滑处理频谱数据
      let curSpectrum = smooth(spectrumCache[Math.max(spectrumCache.length - config.electric.delays[s] - 1, 0)],
        config.electric.smoothMargins[s]);

      let points = [];
      // 填充颜色
      ctx.fillStyle = config.electric.colors[s];
      // 阴影颜色
      ctx.shadowColor = config.electric.colors[s];
      // 阴影模糊度
      ctx.shadowBlur = config.electric.glowRadius * getResolutionMultiplier();

      let len = curSpectrum.length;
      let t = 0;
      let r = 0;
      let x = 0;
      let y = 0;
      // 计算每层的点坐标
      for (let i = 0; i < len; i++) {
        t = Math.PI * (i / (len - 1)) - Math.PI / 2;
        // 计算半径
        r = curRad + Math.pow(curSpectrum[i] * config.electric.spectrumHeightScalar * getResolutionMultiplier(),
          config.electric.exponents[s]);
        // 转换为笛卡尔坐标
        x = r * Math.cos(t);
        y = r * Math.sin(t);
        points.push({x: x, y: y});
      }

      drawElectricPoints(ctx, points);
      
      // 恢复每个频谱层的状态
      ctx.restore();
    }

    // 绘制嵌入图片
    drawEmblem(ctx, multiplier)
    
    ctx.restore()
  }

  const maxBufferSize = Math.max.apply(null, config.electric.delays);
  let spectrumCache = Array();
  function drawElectricPoints(ctx: CanvasRenderingContext2D, points: any) {
    if (points.length == 0) {
        return;
    }

    ctx.beginPath();

    let halfWidth = canvasSize.width / 2;
    let halfHeight = canvasSize.height / 2;
    // 绘制左右对称的两部分
    for (let neg = 0; neg <= 1; neg++) {
      // 计算 x 方向的缩放因子
      let xMult = neg ? -1 : 1;

      ctx.moveTo(halfWidth, points[0].y + halfHeight);
      // 使用二次贝塞尔曲线连接所有点
      let len = points.length;
      for (let i = 1; i < len - 2; i++) {
        // 计算控制点和终点
        let c = xMult * (points[i].x + points[i + 1].x) / 2 + halfWidth;
        let d = (points[i].y + points[i + 1].y) / 2 + halfHeight;
        ctx.quadraticCurveTo(xMult * points[i].x + halfWidth, points[i].y + halfHeight, c, d);
      }
      ctx.quadraticCurveTo(xMult * points[len - 2].x + halfWidth + neg * 2,
        points[len - 2].y + halfHeight, xMult * points[len - 1].x + halfWidth,
        points[len - 1].y + halfHeight);
    }
    
    // 保存当前上下文状态
    ctx.save();
    // 填充路径
    ctx.fill();
    // 恢复上下文状态
    ctx.restore();
  }

  /**
   * 开始可视化
   */
  const startVisualization = () => {
    if (!audioRef.value) return

    // 检查音频源是否有效
    if (!audioRef.value.src) {
      ElMessage.warning(i18n.global.t('MUSIC_VISUAL.PLEASE_SELECT_AUDIO'))
      return
    }

    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    const bufferLength = analyser.value!.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const ctx = canvasRef.value!.getContext('2d')!

    // 初始化顶部小方块高度数组
    const maxBars = Math.min(config.circleConfig.barCount, bufferLength)
    topBlocksHeight.value = new Array(maxBars).fill(0)

    const draw = () => {
      animationId = requestAnimationFrame(draw)
      analyser.value!.getByteFrequencyData(dataArray)
      // 更新歌词
      updateLyrics()

      if (config.visualMode === 'circle') {
        drawCircle(ctx, dataArray)
      } else if (config.visualMode === 'bars') {
        drawBars(ctx, dataArray, canvasSize.width, canvasSize.height)
      } else if (config.visualMode === 'electric') {
        drawElectric(ctx, dataArray)
      }
    }

    draw()
  }

  // 音量调节方法
  const setVolume = (value: any) => {
    if (!gainNode.value) return
    
    // 确保音量在 0-1 范围内
    const normalizedValue = Math.max(0, Math.min(1, value))
    volume.value = normalizedValue
    gainNode.value.gain.value = normalizedValue
    
    // 如果设置的音量大于0，取消静音状态
    if (normalizedValue > 0) {
      isMuted.value = false
    }
  }

  // 静音切换方法
  const toggleMute = () => {
    if (!gainNode.value) return
    
    if (isMuted.value) {
      // 取消静音
      gainNode.value.gain.value = previousVolume.value
      volume.value = previousVolume.value
      isMuted.value = false
    } else {
      // 静音
      previousVolume.value = volume.value
      gainNode.value.gain.value = 0
      volume.value = 0
      isMuted.value = true
    }
  }

  // 音量增加方法
  const increaseVolume = (step = 0.1) => {
    setVolume(volume.value + step)
  }

  // 音量减小方法
  const decreaseVolume = (step = 0.1) => {
    setVolume(volume.value - step)
  }

  // 更新音频时间
  const updateTime = () => {
    if (!audioRef.value) return
    currentTime.value = audioRef.value.currentTime
    duration.value = audioRef.value.duration
  }

  // 计算播放进度百分比
  const progress = computed(() => {
    return duration.value ? (currentTime.value / duration.value) * 100 : 0
  })

  // 更新歌词
  const updateLyrics = () => {
    if (!audioRef.value || !lyrics.value.length) return
    
    const currentTime = audioRef.value.currentTime
    let index = lyrics.value.findIndex(lyric => lyric.time > currentTime)
    
    if (index === -1) {
      index = lyrics.value.length
    }
    currentLyricIndex.value = index - 1
  }

  /**
   * 停止可视化
   */
  const stopVisualization = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }

  /**
   * 清理资源
   */
  const cleanup = () => {
    stopVisualization()
    gradientCache.clear()
    if (audioContext.value) {
      audioContext.value.close()
    }
    if (source.value) {
      source.value.disconnect()
    }
  }

  // 上传音乐文件
  const handleUploadMusic = async () => {
    const filePath = await ipcRenderService.invoke('app:select-music-file')
    if (filePath) {
      if (!audioRef.value) return
      audioRef.value.src = filePath.filePaths[0]
      ElMessage.success(i18n.global.t('MUSIC_VISUAL.UPLOAD_MUSIC_OK'))
    } else {
      ElMessage.error(i18n.global.t('MUSIC_VISUAL.UPLOAD_MUSIC_FAIL'))
    }
  }

  // 上传歌词文件
  const handleLyricFileChange = (file: any) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseLyrics(content)
    }
    reader.readAsText(file.raw)
  }

  const parseLyrics = (lrcContent: string) => {
    const lines = lrcContent.split('\n')
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
    const parsedLyrics: LyricLine[] = []
  
    lines.forEach(line => {
      const match = timeRegex.exec(line)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3])
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = line.replace(timeRegex, '').trim()
        
        if (text) {
          parsedLyrics.push({ time, text })
        }
      }
    })
  
    lyrics.value = parsedLyrics.sort((a, b) => a.time - b.time)
  }
  // 添加播放完成的处理
  const handlePlayEnd = () => {
    isPlaying.value = false
    stopVisualization()
    // 重置进度
    currentTime.value = 0
    // 重置歌词索引
    currentLyricIndex.value = -1
  }

  const handleReplay = async () => {
    if (!audioRef.value) return
    // // 重置音频时间到开始
    audioRef.value.currentTime = 0
    // 如果当前未播放，则开始播放
    if (audioRef.value.paused) {
      await handleTogglePlay()
    }
  }

  // 播放/暂停切换
  const handleTogglePlay = async () => {
    console.log('handleTogglePlay', audioRef.value)
    if (!audioRef.value) return
    if (!audioRef.value.src) {
      ElMessage.warning(i18n.global.t('MUSIC_VISUAL.PLEASE_SELECT_AUDIO'))
      return
    }
    if (audioRef.value.paused) {
      await audioRef.value.play()
      isPlaying.value = true
    } else {
      audioRef.value.pause()
      isPlaying.value = false
    }
  }

  const getBackgroundDrawParams = (() => {
    let cachedParams: { x: number; y: number; width: number; height: number; } | null = null
    let lastImgWidth = 0
    let lastImgHeight = 0
    
    return () => {
      // 只有当图片尺寸改变时才重新计算
      if (backgroundImg && 
          (lastImgWidth !== backgroundImg.width || 
           lastImgHeight !== backgroundImg.height)) {
        
        const imgRatio = backgroundImg.width / backgroundImg.height
        const canvasRatio = canvasSize.width / canvasSize.height
        
        let drawWidth = canvasSize.width
        let drawHeight = canvasSize.height
        let drawX = 0
        let drawY = 0
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvasSize.height
          drawWidth = canvasSize.height * imgRatio
          drawX = (canvasSize.width - drawWidth) / 2
        } else {
          drawWidth = canvasSize.width
          drawHeight = canvasSize.width / imgRatio
          drawY = (canvasSize.height - drawHeight) / 2
        }
        
        cachedParams = { x: drawX, y: drawY, width: drawWidth, height: drawHeight }
        lastImgWidth = backgroundImg.width
        lastImgHeight = backgroundImg.height
      }
      
      return cachedParams
    }
  })()

  // 处理背景图片上传
  const handleCanvasBgUpload = (file: any) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        backgroundImg = img // 保存背景图片对象的引用
        config.backgroundImage = e.target?.result as string
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }

  // 处理默认封面上传
  const handleDefaultCoverChange = (file: any) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      defaultCover.value = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }

  // 添加中心图片上传处理函数
  const handleCircleCenterImageChange = (file: any) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        config.circleConfig.centerImage = e.target?.result as string
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }

  // 清除默认封面
  const clearDefaultCover = () => {
    defaultCover.value = ''
  }

  // 清除背景图片
  const clearBackground = () => {
    config.backgroundImage = ''
    backgroundImg = null
  }

  // 清除中心图片
  const clearCenterImage = () => {
    config.circleConfig.centerImage = ''
  }

  // 清除歌词
  const clearLyrics = () => {
    lyrics.value = []
    currentLyricIndex.value = -1
  }

  // ------------------------------- 工具函数 ------------------------------------------
  /**
   * 计算电音效果
   * @param spectrum 
   * @returns 
   */
  function transform (spectrum: any) {
    let subArr = spectrum.slice(config.electric.startBin, config.electric.startBin + config.electric.keepBins);
    subArr = savitskyGolaySmooth(subArr);
    return subArr;
  }

  function smooth(points: any, margin: number) {
    if (margin == 0) {
        return points;
    }

    let newArr = Array();
    for (let i = 0; i < points.length; i++) {
        let sum = 0;
        let denom = 0;
        for (let j = 0; j <= margin; j++) {
            if (i - j < 0 || i + j > points.length - 1) {
                break;
            }
            sum += points[i - j] + points[i + j];
            denom += (margin - j + 1) * 2;
        }
        newArr[i] = sum / denom;
    }
    return newArr;
  }

  function getResolutionMultiplier() {
      let resMult = 1;
      let width = window.innerWidth;
      let height = window.innerHeight;
      if (width >= height) {
          resMult = width / 1920;
      } else {
          resMult = height / 1080;
      }
      return resMult;
  }

  function calcRadius (multiplier: number) {
    let minSize = config.electric.minEmblemSize;
    let maxSize = config.electric.maxEmblemSize;
    let scalar = multiplier * (maxSize - minSize) + minSize;
    return getResolutionMultiplier() * scalar / 2;
  }

  /**
   * 计算电音效果
   * @param spectrum 
   * @returns 
   */
  function multiplierFun (spectrum: any) {
      let sum = 0;
      let len = spectrum.length;
      for (let i = 0; i < len; i++) {
          sum += spectrum[i];
      }
      let intermediate = sum / config.electric.keepBins / 256;
      let transformer = 1.2;
      return (1 / (transformer - 1)) * (-Math.pow(intermediate, transformer) + transformer * intermediate);
  }

  /**
   * 平滑处理
   * @param array 
   * @returns 
   */
  function savitskyGolaySmooth(array: any) {
      let lastArray = array;
      let newArr = [];
      for (let pass = 0; pass < config.electric.smoothingPasses; pass++) {
          let sidePoints = Math.floor(config.electric.smoothingPoints / 2); // our window is centered so this is both nL and nR
          let cn = 1 / (2 * sidePoints + 1); // constant
          for (let i = 0; i < sidePoints; i++) {
              newArr[i] = lastArray[i];
              newArr[lastArray.length - i - 1] = lastArray[lastArray.length - i - 1];
          }
          for (let i = sidePoints; i < lastArray.length - sidePoints; i++) {
              let sum = 0;
              for (let n = -sidePoints; n <= sidePoints; n++) {
                  sum += cn * lastArray[i + n] + n;
              }
              newArr[i] = sum;
          }
          lastArray = newArr;
      }
      return newArr;
  }
  // 添加颜色渐变工具函数
  const gradientColor = (startColor: string, endColor: string, step: number, count: number) => {
    const parseColor = (color: string) => {
      const hex = color.replace('#', '')
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      }
    }
    
    const start = parseColor(startColor)
    const end = parseColor(endColor)
    const ratio = step / count
    
    const r = Math.round(start.r + (end.r - start.r) * ratio)
    const g = Math.round(start.g + (end.g - start.g) * ratio)
    const b = Math.round(start.b + (end.b - start.b) * ratio)
    
    return `rgb(${r}, ${g}, ${b})`
  }

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // ------------------------------- 监听配置变化 --------------------------------
  // 添加颜色变化的监听
  watch(
    () => [config.colors.bottom, config.colors.middle, config.colors.top],
    () => {
      // 清除渐变缓存
      gradientCache.clear()
    },
    { deep: true }
  )
  watch(() => config.visualMode, () => {
    if (config.visualMode === 'electric') {
      if (analyser.value) {
        analyser.value.fftSize = config.electric.fftSize
        analyser.value.smoothingTimeConstant = config.electric.temporalSmoothing;
        analyser.value.minDecibels = config.electric.minDecibels;
        analyser.value.maxDecibels = config.electric.maxDecibels;
      }
    } else if (config.visualMode === 'bars') {
      if (analyser.value) {
        analyser.value.fftSize = config.fftSize
        analyser.value.smoothingTimeConstant = 0.8
        analyser.value.minDecibels = -100
        analyser.value.maxDecibels = -30
      }
    }
    if (isPlaying.value) {
      startVisualization()
    }
  })

  onMounted(() => {
    initAudioContext()
    if (!audioRef.value) return
    audioRef.value.addEventListener('timeupdate', updateTime)
    audioRef.value.addEventListener('ended', handlePlayEnd)
    // 总时长
    audioRef.value.addEventListener('loadedmetadata', () => {
      duration.value = audioRef.value!.duration
    })
  })

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
    if (audioRef.value) {
      audioRef.value.removeEventListener('timeupdate', updateTime)
      audioRef.value.removeEventListener('ended', handlePlayEnd)
      audioRef.value.removeEventListener('loadedmetadata', () => {
        duration.value = audioRef.value!.duration
      })
    }
  
    if (source.value) {
      source.value.disconnect()
    }
    if (gainNode.value) {
      gainNode.value.disconnect()
    }
    if (analyser.value) {
      analyser.value.disconnect()
    }
  })

  /**
   * 应用震动效果
   */
  const applyShakeEffect = (ctx: CanvasRenderingContext2D, multiplier: number) => {
    if (!config.electric.shake.enabled) return

    ctx.save()

    const step = config.electric.shake.maxIntensity * multiplier
    
    // 更新 X 轴波浪
    shakeState.waveFrameX += step * shakeState.waveSpeedX
    if (shakeState.waveFrameX > config.electric.shake.waveDuration) {
      shakeState.waveFrameX = 0
      shakeState.waveAmplitudeX = random(
        config.electric.shake.minScalar,
        config.electric.shake.maxScalar
      )
      shakeState.waveSpeedX = random(
        config.electric.shake.minScalar,
        config.electric.shake.maxScalar
      ) * (Math.random() < 0.5 ? -1 : 1)
      shakeState.trigX = Math.round(Math.random())
    }

    // 更新 Y 轴波浪
    shakeState.waveFrameY += step * shakeState.waveSpeedY
    if (shakeState.waveFrameY > config.electric.shake.waveDuration) {
      shakeState.waveFrameY = 0
      shakeState.waveAmplitudeY = random(
        config.electric.shake.minScalar,
        config.electric.shake.maxScalar
      )
      shakeState.waveSpeedY = random(
        config.electric.shake.minScalar,
        config.electric.shake.maxScalar
      ) * (Math.random() < 0.5 ? -1 : 1)
      shakeState.trigY = Math.round(Math.random())
    }

    // 计算位移
    const trigFuncX = shakeState.trigX === 0 ? Math.cos : Math.sin
    const trigFuncY = shakeState.trigY === 0 ? Math.cos : Math.sin

    const dx = trigFuncX(shakeState.waveFrameX) * 
      config.electric.shake.maxDisplacement * 
      shakeState.waveAmplitudeX * 
      multiplier
    const dy = trigFuncY(shakeState.waveFrameY) * 
      config.electric.shake.maxDisplacement * 
      shakeState.waveAmplitudeY * 
      multiplier

    ctx.translate(dx, dy)
  }

  /**
   * 生成随机数
   */
  const random = (min: number, max: number) => {
    return Math.random() * (max - min) + min
  }

  return {
    config,
    audioRef,
    canvasRef,
    defaultCover,
    currentLyricIndex,
    progress,
    duration,
    handleUploadMusic,
    formatTime,
    clearLyrics,
    clearBackground,
    handleLyricFileChange,
    clearCenterImage,
    clearDefaultCover,
    startVisualization,
    stopVisualization,
    handleCircleCenterImageChange,
    handleDefaultCoverChange,
    handleTogglePlay,
    handleReplay,
    isPlaying,
    currentTime,
    lyrics,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    increaseVolume,
    decreaseVolume,
    handleCanvasBgUpload,
    handleEmblemImageChange,
    clearEmblemImage,
    cleanup
  }
}
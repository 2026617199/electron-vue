// 将hex颜色转换为rgb
const hexToRgb = (hex: string): number[] => {
  const rgb = []
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(item => item + item).join('')
  }
  for (let i = 0; i < 6; i += 2) {
    rgb.push(parseInt(hex.slice(i, i + 2), 16))
  }
  return rgb
}

// 将rgb转换为hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const hex = [r, g, b].map(n => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  })
  return '#' + hex.join('')
}

// 混合颜色
export const mix = (color1: string, color2: string, weight: number): string => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  const result = rgb1.map((c1, i) => {
    const c2 = rgb2[i]
    return Math.round(c1 * (1 - weight) + c2 * weight)
  })
  return rgbToHex(result[0], result[1], result[2])
}

// 生成主题色的不同色阶
export const generateColors = (primary: string): Record<string, string> => {
  const colors: Record<string, string> = {
    'primary': primary
  }
  
  // 白色混合比例
  const WHITE_MIX_LEVELS = {
    'light-1': 0.1,
    'light-2': 0.2,
    'light-3': 0.3,
    'light-4': 0.4,
    'light-5': 0.5,
    'light-6': 0.6,
    'light-7': 0.7,
    'light-8': 0.8,
    'light-9': 0.9
  }
  
  // 黑色混合比例
  const BLACK_MIX_LEVELS = {
    'dark-1': 0.1,
    'dark-2': 0.2
  }

  // 生成浅色系列
  Object.entries(WHITE_MIX_LEVELS).forEach(([key, value]) => {
    colors[key] = mix(primary, '#ffffff', value)
  })

  // 生成深色系列
  Object.entries(BLACK_MIX_LEVELS).forEach(([key, value]) => {
    colors[key] = mix(primary, '#000000', value)
  })

  return colors
} 
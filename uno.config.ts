import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // 添加 UnoCSS 的默认样式预设
    presetAttributify({
      /* preset options */ 
    })
  ],
  rules: [
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${Number(d) * 10}px` })],
    [/^mt-(\d+)$/, ([, d]) => ({ 'margin-top': `${Number(d) * 2}px` })],
    [/^p-(\d+)$/, ([, d]) => ({ padding: `${Number(d) * 10}px` })],
  ],
  shortcuts: {
    'wh-full': 'w-full h-full',
    'flex-center': 'flex items-center justify-center'
  },
})
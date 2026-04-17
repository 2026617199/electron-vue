/**
 * ============================================================================
 * @file        vite.config.js
 * @description [vite配置文件]
 * @author      前端飞行手册 <frontpilot@163.com>
 * @homepage    https://frontpilot.cn/
 * @license     Commercial Source License v1.0
 * @copyright   Copyright (c) 2026 前端飞行手册. All rights reserved.
 *
 * Licensed under the Commercial Source License.
 * You may NOT redistribute, resell, sublicense, or publish this source code.
 * See LICENSE file in the project root for full license terms.
 * ============================================================================
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import electronBytenodePlugin from './build/bytenode/vite-plugin-electron-encrypt.ts'

import * as path from 'path'
import pkg from './package.json' assert { type: 'json' }

import UnoCSS from 'unocss/vite'

const pathSrc = path.resolve(__dirname, 'src/renderer')

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    UnoCSS(),
    // vueDevTools(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite:{
          plugins: [
            electronBytenodePlugin({
              keepSource: process.env.NODE_ENV === 'development'
            }),
          ],
          resolve: {
            alias: {
              '@/main': path.resolve(__dirname, './src/main'),
              '@/common': path.resolve(__dirname, './src/common'),
              // '@/shared': path.resolve(__dirname, './src/shared'),
            }
          },
          build:{
            outDir: 'dist-electron/main',
            rollupOptions: {
              output: {
                entryFileNames: '[name].js' // 强制保留.js扩展名
              },
              external: ['bytenode', /\.jsc$/], // 确保 bytenode 不被打包
            }
          }
        }
      },
      {
        entry: 'src/preload/index.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              output: {
                entryFileNames: '[name].js'
              }
            }
          }
        }
      }
    ]),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [
        ElementPlusResolver(),
      ],
      eslintrc: {
      	// 这里先设置成true然后npm run dev 运行之后会生成 .eslintrc-auto-import.json 文件之后，在改为false
        enabled: true,
        filepath: './.eslintrc-auto-import.json', // 生成的文件路径
        globalsPropValue: true,
      },
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        }),
      ],
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(__dirname, 'src/assets/svg')],
      // 指定symbolId格式
      symbolId: 'icon-[name]',
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // https://rollupjs.org/configuration-options/
    rollupOptions: {
      output: {
        // 根据文件类型分类输出
        assetFileNames: (assetInfo) => {
          const fileNames = assetInfo.name || ''
          const info = fileNames.split('.')
          let extType = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(fileNames)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(fileNames)) {
            extType = 'images'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(fileNames)) {
            extType = 'fonts'
          }
          
          return `assets/${extType}/[name]-[hash][extname]`
        },
        // JS文件输出管理
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 代码分割策略
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],  // 第三方库
          'ui': ['element-plus'],                     // UI框架
          'echarts': ['echarts']                      // 大型库单独分割
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}/`,
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', 'jpg']
  },
  optimizeDeps: {
    include: [
      'element-plus/es/components/radio-group/style/index',
      'element-plus/es/components/radio-button/style/index',
      'element-plus/es/components/dialog/style/index',
      'element-plus/es/components/progress/style/index'
    ],
    force: false,
  },
  server: {
    port: 8008,
    open: false
  },
  css: {
    // 指定传递给 CSS 预处理器的选项
    preprocessorOptions: {
      scss: {
        // 两种方式都可以
        // additionalData: '@import "@/style/global.scss";',
        // additionalData: '@use "@/style/global.scss" as *;'
        // 在每个样式文件的开头自动注入代码，全局引入变量、混合器(mixins)或函数
        // 使用 @use 比 @import 更推荐（避免重复导入）
        additionalData: `
          @use "@/renderer/styles/element/index.scss" as *;
          @use "@/renderer/styles/app-vars.scss" as *;
          @use "@/renderer/styles/themes/index.scss" as *;
        `,
        silenceDeprecations: ['legacy-js-api'],
        // @use "@/style/global.scss" as *;
      }
    }
  },
  // 解决vue-i18n报错问题
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: true,
    __INTLIFY_PROD_DEVTOOLS__: false,
    // 应用信息，从package.json中获取
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_VERSION__: JSON.stringify(pkg.version)
  }
})

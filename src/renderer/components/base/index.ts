import { App } from 'vue';

/**
 * 
 * base目录下的组件自动注册，组件文件夹内可自动注册多个导出组件
 */
export const registerComponents = (app: App) => {
  const components: Record<string, any> = import.meta.glob('../base/**/index.ts', { eager: true })

  Object.keys(components).forEach((filePath: string) => {

    // 导入组件
    const namedExports = components[filePath]

    // 注册命名导出的组件
    Object.keys(namedExports).forEach(componentName => {
      if (componentName !== 'default') {
        const component = namedExports[componentName]
        const componentNameCamelCase = componentName.replace(/-/g, '').charAt(0).toUpperCase() + componentName.slice(1)
        app.component(componentNameCamelCase, component)
      }
    })

  })
}
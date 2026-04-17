const modules: {
  [index: string]: any
} = {}

// const files = import.meta.glob('./*.ts', { as: 'raw' })
const files: any = import.meta.globEager('./*.ts')

Object.keys(files).forEach((fileName: any) => {
  const name = fileName.replace(/\.\/|\.ts/g, '')
  modules[name] = files[fileName].default
})

export default modules
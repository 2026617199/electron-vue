## 安装

```js
npm install quill@2.0.2
```


## 使用

```js
// index.html引入css文件
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />


// 组件使用
import Quill from 'quill'
import "quill/dist/quill.core.css";

onMounted(() => {
  const quill = new Quill('#editor', {
    modules: {
      toolbar: true,
    },
    placeholder: 'Compose an epic...',
    theme: 'snow', // bubble(选中弹框提示) | snow
  })
})
```

## 功能支持

- 只读模式
- 插入自定义文本
- 从指定位置删除字符
- 自定义工具栏位置
- 自定义工具栏功能
## 基本使用
```js
<WaterMark content="基本使用">
  <div style="height: 360px" />
</WaterMark>

```


## 平行布局水印
```js
<WaterMark layout="parallel" content="平行布局水印">
  <div style="height: 360px" />
</WaterMark>

```



## 多行水印
```js
<WaterMark :content="['Electron App', 'Hello World']">
  <div style="height: 400px" />
</WaterMark>

```


## 图片水印
```js
<WaterMark
  :height="30"
  :width="30"
  image="https://www.electronjs.org/zh/assets/img/logo.svg">
  <div style="height: 360px" />
</WaterMark>
```


## 全屏幕水印
```js
<WaterMark
  content="Electron App"
  fullscreen 
>
  <div style="height: 360px" />
</WaterMark>
```


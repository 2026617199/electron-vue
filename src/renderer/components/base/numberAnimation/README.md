## 基本使用
```js
<NumberAnimation :to="100000000.12345" />

<NumberAnimation :to="100000000.12345" separator="" />
```


## 精度
```js
<NumberAnimation :from="0.00" :to="100000000.12345" :precision="2" />

<NumberAnimation :to="100000000.12345" :precision="3" />
```


## 自定义前缀 & 后缀
```js
<NumberAnimation
  prefix="$"
  :from="0"
  :to="100000000" />

<NumberAnimation
  :from="0"
  :to="100000000"
  suffix="元" />
```



## 自定义样式
```js
<NumberAnimation
  :value-style="{fontSize: '30px', fontWeight: 600, color: '#d4380d'}"
  :from="0"
  :to="100000000" />
```


## 自定义播放和动画时间
```js
<NumberAnimation
  ref="animationRef"
  :from="0"
  :to="100000000"
  :duration="5000"
  :precision="2"
  :autoplay="false"
  @started="onStarted"
  @finished="onFinished" />
```
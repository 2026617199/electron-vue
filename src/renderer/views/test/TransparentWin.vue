<template>
  <div class="blur-bg">
    <CommonBar />
    <div class="transparent-wrapper">
      {{ $t('TEST.TRANSPARENT_WINDOW_HINT') }}
    </div>
  </div>
</template>

<script setup lang='ts'>

</script>


<style lang="scss" scoped>
.transparent-wrapper {
  color: #fff;
  padding: 20px;
  .card-flex {
    display: flex;
    justify-content: space-around;
  }
}
.blur-bg{
   position: relative;
   height: 100vh;
   border-radius: 10px;
}
.blur-bg::before {
  position: absolute;
  z-index: -1;
  background:rgba(255, 255, 255, 0.144);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  content: '';
  filter: blur(0px);
}
</style>

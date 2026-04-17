<script setup lang='ts'>

</script>

<template>
  <div class="chart-container">
    <div class="head"></div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  border-radius: 3px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.12);
  .content {
    width: 100%;
  }
}
</style>

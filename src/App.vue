<script setup>
import SiderBar from "./components/siderBar.vue";
</script>

<template>
  <div><SiderBar /><router-view /></div>
</template>

<style lang="less" scoped>
div {
  display: flex;
}
</style>

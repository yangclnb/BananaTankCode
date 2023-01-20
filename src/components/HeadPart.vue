<script setup>
import { ElButton } from "element-plus";
import { Document, Share } from "@element-plus/icons-vue";
import router from "../router";

const toDevDocPage = () => {
  router.push({ name: "devDoc" });
};
</script>

<template>
  <div id="head">
    <h2><span>Tank</span> <span>Code</span></h2>
    <div id="button_box">
      <el-button :icon="Share" color="var(--theme-red-color)">分享</el-button>
      <el-button
        :icon="Document"
        color="var(--theme-green-color)"
        @click="toDevDocPage"
        >开发文档</el-button
      >
    </div>
  </div>
</template>

<style lang="less" scoped>
#head {
  height: 70px;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    span:first-child {
      color: var(--theme-red-color);
    }
  }

  #button_box {
    display: flex;
    height: 30px;

    div {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 20px;

      border-radius: 10px;
    }
  }
}
</style>

<script setup>
import DynamicContent from "@/components/DynamicContent.vue";
import { ElButton } from "element-plus";
</script>

<template>
  <div id="information">
    <div id="leftBar">
      <h2>什么是 TankCode ?</h2>
      <DynamicContent fill="false">
        <h3>
          欢迎来到 CodeTank
          的世界，将会带你进入一个神奇和充满挑战的代码机器人的世界！
        </h3></DynamicContent
      >
      <div>
        <router-link to="/home">
          <el-button color="var(--theme-green-color)"> 快速开始 </el-button>
        </router-link>
        <router-link to="/devDoc">
          <el-button color="var(--theme-second-background)">
            开发文档
          </el-button>
        </router-link>
      </div>
    </div>
    <img draggable="false" src="@/assets/tankDescribe.png" />
  </div>
</template>

<style scoped lang="less">
#information {
  margin: 0 20px;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: space-between;

  #leftBar {
    padding-left: 30px;
    width: 40%;
    display: flex;
    flex-direction: column;

    h3 {
      font-size: 25px;
      padding: 20px 0;
    }

    a {
      margin-right: 12px;
    }

    @media (max-width: 576px) {
      padding-left: 0px;
      margin-top: 30px;
      width: 90%;
    }
  }

  img {
    width: 50%;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
}
</style>

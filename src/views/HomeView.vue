<script setup>
import headVue from "../components/head.vue";
import {
  ElDropdown,
  ElButton,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import { Setting, Platform, Timer } from "@element-plus/icons-vue";
import { startAnimate, stopAnimate, restart } from "@/tank/main.js";

let currentAnimateState = "暂停";
const startAndStop = () => {
  window.play_animate ? stopAnimate() : startAnimate();
  currentAnimateState = window.play_animate ? "暂停" : "开始";
  console.log("currentAnimateState :>> ", currentAnimateState);
};
</script>

<template>
  <div id="home_page">
    <headVue />
    <div id="game_box">
      <div id="tools_bar">
        <div id="left_tools">
          <el-dropdown trigger="click">
            <el-button color="var(--theme-second-background)">
              开发者模式<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>PVP模式</el-dropdown-item>
                <el-dropdown-item>PVE模式</el-dropdown-item>
                <el-dropdown-item>开发者模式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button color="var(--theme-green-color)" @click="startAndStop">{{
            currentAnimateState
          }}</el-button>
        </div>

        <div id="right_tools">
          <el-button :icon="Platform" color="var(--theme-green-color)"
            >控制台</el-button
          >
          <el-button
            :icon="Timer"
            color="var(--theme-red-color)"
            @click="restart"
            >重新开始</el-button
          >
          <el-button :icon="Setting" type="primary">设置</el-button>
        </div>
      </div>
      <div id="canvas_box">
        <canvas id="main_canvas" width="900" height="500"
          >当前浏览器不支持canvas~</canvas
        >
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
#home_page {
  width: 100%;
  display: flex;
  flex-direction: column;

  #tools_bar {
    padding: 20px;
    display: flex;
    justify-content: space-between;
  }

  #game_box {
    background-color: var(--theme-second-background);
    margin: 0 auto;
    width: 900px;
  }
}
</style>

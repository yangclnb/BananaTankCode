<script setup>
import Editor from "../components/CodeEditor.vue";
import HeadPart from "../components/HeadPart.vue";

import {
  ElDropdown,
  ElButton,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import { Setting, Platform, Refresh } from "@element-plus/icons-vue";
import {
  init_canvas,
  startAnimate,
  stopAnimate,
  restart,
} from "@/tank/main.js";
import { onMounted, onUnmounted, ref } from "vue";
import { useConsoleDisplayStore } from "@/stores/consoleStatus";
import { useTankStatusStore } from "../stores/tankStatus";
import { storeToRefs } from "pinia";

let currentAnimateState = ref("暂停");
const startAndStop = () => {
  window.play_animate ? stopAnimate() : startAnimate();
  currentAnimateState.value = window.play_animate ? "暂停" : "开始";
};

onMounted(() => {
  document.title = "TankCode | 主页";
  startAnimate();
  init_canvas();
});

onUnmounted(() => {
  stopAnimate();
});

// 控制控制台出现
const consoleDisplay = useConsoleDisplayStore();
function showConsole() {
  consoleDisplay.show();
}

// 控制游戏模式
const gameMode = useTankStatusStore();
const { mode } = storeToRefs(gameMode);
</script>

<template>
  <div id="home_page">
    <HeadPart />
    <div id="game_box">
      <div id="tools_bar">
        <div id="left_tools">
          <el-dropdown trigger="click">
            <el-button color="var(--theme-second-background)">
              {{ mode.toUpperCase() + " 模式"
              }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="gameMode.PVPBattleMode"
                  >PVP模式</el-dropdown-item
                >
                <el-dropdown-item @click="gameMode.PVEBattleMode"
                  >PVE模式</el-dropdown-item
                >
                <el-dropdown-item @click="gameMode.consoleBattleMode"
                  >开发者模式</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button color="var(--theme-green-color)" @click="startAndStop">{{
            currentAnimateState
          }}</el-button>
        </div>

        <div id="right_tools">
          <el-button
            @click="showConsole"
            :icon="Platform"
            color="var(--theme-green-color)"
            >控制台</el-button
          >
          <el-button
            :icon="Refresh"
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
    <Editor />
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

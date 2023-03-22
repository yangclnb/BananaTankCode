<script setup>
import Editor from "../components/CodeEditor.vue";
import HeadPart from "../components/HeadPart.vue";
import ReportBox from "../components/ReportBox.vue";
import { ElButton, ElSelect, ElOption, ElSwitch } from "element-plus";
import {
  Setting,
  Platform,
  Refresh,
  Check,
  Close,
} from "@element-plus/icons-vue";
import {
  init_canvas,
  startAnimate,
  stopAnimate,
  restart,
} from "@/tank/main.js";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useConsoleDisplayStore } from "@/stores/consoleStatus";
// import { useTankStatusStore } from "../stores/tankStatus";
import { storeToRefs } from "pinia";
import { backgroundList } from "../tank/js/EnumObject";

let currentAnimateState = ref("暂停");
const dialogFormVisible = ref(false);
const showRadarLine = ref(window.displayRadar);
const currentBackground = ref(window.canvasBackground);

const startAndStop = () => {
  window.play_animate ? stopAnimate() : startAnimate();
  currentAnimateState.value = window.play_animate ? "暂停" : "开始";
};

watch(showRadarLine, (newVal) => {
  window.displayRadar = newVal;
});

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

// 控制设置框出现
function dialogFormDispaly() {
  dialogFormVisible.value = true;
}

// 改变背景时触发
function changeBackground(selectBackground) {
  window.canvasBackground = selectBackground;
}

// 控制游戏模式
// const gameMode = useTankStatusStore();
// const { mode } = storeToRefs(gameMode);
</script>

<template>
  <div id="home_page">
    <ReportBox />
    <HeadPart />
    <div id="game_box">
      <div id="tools_bar">
        <div id="left_tools">
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
          <el-button :icon="Setting" type="primary" @click="dialogFormDispaly"
            >设置</el-button
          >
        </div>
      </div>
      <div id="canvas_box">
        <canvas id="main_canvas" width="900" height="500"
          >当前浏览器不支持canvas~</canvas
        >
      </div>
    </div>
    <Editor />
    <el-dialog v-model="dialogFormVisible" title="界面设置">
      <table>
        <tr>
          <td>显示雷达线条：</td>
          <td>
            <el-switch
              v-model="showRadarLine"
              class="mt-2"
              style="margin-left: 24px"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
            />
          </td>
        </tr>
        <tr>
          <td>切换地图：</td>
          <td>
            <el-select
              v-model="currentBackground"
              class="m-2"
              placeholder="Select"
              @change="changeBackground"
            >
              <el-option-group
                v-for="group in backgroundList"
                :key="group.typeID"
                :label="group.type"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.name"
                  :label="item.name"
                  :value="item.data"
                />
              </el-option-group>
            </el-select>
          </td>
        </tr>
      </table>
    </el-dialog>
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

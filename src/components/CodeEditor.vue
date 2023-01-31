<script setup>
import MonacoEditor from "monaco-editor-vue3";
import { vDrag } from "@/tank/js/utils/drag.js";
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useConsoleDisplayStore } from "@/stores/consoleStatus";
import { storeToRefs } from "pinia";
import { useTankStatusStore } from "../stores/tankStatus";
import { UserTank } from "@/tank/js/tank/UserTank.js";
import { AITank } from "@/tank/js/tank/AITank.js";
import { simplyVal } from "@/tank/js/tank/tankMoveTemplate.js";
const store = useConsoleDisplayStore();
const { state } = storeToRefs(store);

let editor = ref(null);
let options = reactive({
  colorDecorators: true,
  lineHeight: 24,
  tabSize: 2,
  foldingStrategy: "indentation", // 代码可分小段折叠
  automaticLayout: true, // 自适应布局
  overviewRulerBorder: false, // 不要滚动条的边框
  autoClosingBrackets: true,
});
const userCode = localStorage.getItem("userCode");
let defaultValue = ref(userCode || simplyVal);

// 隐藏控制台
function closeConsole() {
  store.hidde();
}

// 获取游戏模式
const gameMode = useTankStatusStore();
const { mode } = storeToRefs(gameMode);

// 更新代码防抖
function updateTankCheck() {
  let timer = null;
  return function (value) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // 判断当前游戏模式
      if (mode.value === "console") {
        UserTank.executeUserCode(value);

        // console.log("window.tank_list :>> ", window.tank_list);
      } else if (mode.value === "pve") {
        UserTank.executeUserCode(value);
        AITank.create();
        AITank.create();
        AITank.create();
      }

      // 存储代码到本地
      localStorage.setItem("userCode", value);

      ElMessage({
        message: `您提交的代码已更新 - 当前模式 ${mode.value.toUpperCase()}`,
        type: "success",
      });
    }, 2000);
  };
}
// 提交代码
const updateTank = updateTankCheck();

// 输入改变时提交代码
function onChange(value) {
  updateTank(value);
}

// 添加拖动
onMounted(() => {
  vDrag.inserted(editor.value);
});
</script>

<template>
  <div v-show="state" ref="editor" id="editor">
    <div id="decorateBar">
      <div @click="closeConsole"></div>
      <div></div>
      <div></div>
    </div>
    <MonacoEditor
      theme="vs-dark"
      language="javascript"
      :value="defaultValue"
      :options="options"
      @change="onChange"
    ></MonacoEditor>
  </div>
</template>

<style lang="less" scoped>
#editor {
  width: 40%;
  height: 75vh;
  padding: 0 10px 40px 10px;

  background-color: #1e1e1e;

  z-index: 9;
  position: absolute;
  top: 0;

  #decorateBar {
    display: flex;
    width: 100%;

    margin: 10px 0;

    div {
      width: 12px;
      height: 12px;
      border-radius: 30px;
      margin-right: 7px;
    }

    div:nth-child(1) {
      background-color: var(--theme-red-color);
      cursor: pointer;
    }
    div:nth-child(2) {
      background-color: var(--theme-yellow-color);
    }
    div:nth-child(3) {
      background-color: var(--theme-green-color);
    }
  }
}
</style>

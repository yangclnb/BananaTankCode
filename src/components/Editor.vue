<script setup>
import MonacoEditor from "monaco-editor-vue3";
import { vDrag } from "@/tank/js/utils/drag.js";
import { onMounted, reactive, ref } from "vue";
import { useConsoleDisplayStore } from "@/stores/consoleStatus";
import { storeToRefs } from "pinia";

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

let defaultValue = ref(`window.tank_list = [];
  // 650，0
  window.tank_list.push(new Tank(600, 300, 180, 180, 10, "blue", 0, false));
  window.tank_list[0].run.operation = function () {
    // console.log('this.action_queue :>> ', this);

    // 调整为异步执行模式
    this.asynchronous_mode();
    this.say("我是异步运动的~");

    // 检测敌人 -----------------
    // this.radar_turn(-300);
    // this.back(400);

    // 检测行动 -----------------
    // this.say("我先开一炮");
    // this.fire();
    // this.say("向前移动 200");
    // this.ahead(200);
    // this.say("向左转 45°");
    // this.tank_turn(45);
    // this.say("向前移动 200");
    // this.ahead(200);
    // this.say("向右转 45°");
    // this.tank_turn(-45);
    // this.say("向后移动 100");
    // this.back(100);
    // this.say("向左转 90°");
    // this.tank_turn(90);
    // this.say("向前移动 20");
    // this.ahead(20);
    // this.say("向右转 180°");
    // this.tank_turn(-180);
    // this.say("向前移动 200");
    // this.ahead(200);
    // this.say("炮口向右转 90°");
    // this.cannon_turn(-90);
    // this.say("雷达向右转 180°");
    // this.radar_turn(-180);
    // this.say("再来一炮");
    // this.fire();

    // 方向测试 ----------------
    // this.ahead(300);

    // 调试弹道 ----------------
    // this.cannon_turn(330);
    // this.fire();

    // 测试异步执行 -------------
    // this.fire();
    // this.tank_turn(360);
    // this.radar_turn(360);
    // this.ahead(500);
    // this.say("到达终点");

    // 动作循环 ----------------
    this.loop = function () {
      this.tank_turn(30);
      this.ahead(200);
      this.cannon_turn(360);
      this.radar_turn(360);
    };
    // 还是需要执行的
    this.loop();
  };

  window.tank_list[0].on_hit_wall.operation = function () {
    this.say("撞墙啦");
    this.tank_turn(45);
    this.back(20);
  };
`);

// 隐藏控制台
function closeConsole() {
  store.hidde();
}

// 输入改变时调用
function onChange(value) {
  console.log(value);
}

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

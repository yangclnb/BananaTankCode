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

let defaultValue = ref(`// tank的运动方法
const run = function () {
  // 调整为异步执行模式
  // this.asynchronous_mode();
  // this.say("我是异步运动的~");

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
  // this.loop = function () {
  //   this.tank_turn(30);
  //   this.ahead(200);
  //   this.cannon_turn(360);
  //   this.radar_turn(360);
  // };
  // 还是需要执行的
  // this.loop();
};

// 发现敌人时触发
// enemy_angle 敌人的角度
const scannedRobot = function(enemy_angle){
  // this.say("我发现你了~~");
}

// 撞墙时触发
const hitWall = function(){
  // this.say("怎么撞墙了");
  // this.back(30);
  // this.tank_turn(45);
}

// 被击中时触发
const hitByBullet = function(){
  // this.say("捏麻麻滴");
}

// 初始化配置
const options = {
  color: "red", //坦克颜色
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, //初始位置，按照象限划分
};

UserTank.create(
    options,
    run,
    scannedRobot,
    hitWall,
    hitByBullet
  );
`);

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

      ElMessage({
        message: `您提交的代码已更新 - 当前模式 ${mode.value.toUpperCase()}`,
        type: "success",
      });
    }, 2000);
  };
}

const updateTank = updateTankCheck();
// 输入改变时调用
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

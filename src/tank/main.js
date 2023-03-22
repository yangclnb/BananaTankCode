import { Canvas } from "./js/canvas.js";
import { checkResult } from "./js/tank/BasicTank.js";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { GIF } from "./js/utils/ControlGIF";
import { AITank } from "./js/tank/AITank.js";

window.play_animate = true;

window.tank_img = new Image();
window.tank_img.src = resource_img;
window.tank_img.onload = () => {
  init();
};

// 初始化坦克列表
export let tankList = [];
// 初始化坦克列表
export function initTankList() {
  tankList = [];
}
// 初始化canvas类
export let canvas;
let animateTimer = null;
/**
 * @function: init
 * @description: 全局初始化
 * @author: Banana
 */
function init() {
  init_canvas();
  init_tank();
  animate();
}

export function init_canvas() {
  // 初始化页面找不到canvas 等待2秒重试
  try {
    let canvasElement = document.querySelector("#main_canvas");
    canvas = new Canvas(canvasElement);
    console.log(
      "单格大小 :>> ",
      canvas.square_width,
      ", ",
      canvas.square_height
    );
  } catch (error) {
    setTimeout(init, 2000);
  }
}

/**
 * @function: init_tank
 * @description: 初始化坦克
 * @author: Banana
 */
function init_tank() {
  tankList = [];

  AITank.create();
  AITank.create();
  AITank.create();
  AITank.create();
}

/**
 * @function: animate
 * @description: 开启动画
 * @author: Banana
 */
function animate() {
  clearTimeout(animateTimer);
  animateTimer = setInterval(() => {
    if (window.play_animate && tankList.length) {
      canvas.init();
      tankList.forEach((tankItem) => {
        // console.log("tankList :>> ", tankList);
        tankItem.implement_current_operation();
        tankItem.draw();
      });
      // 播放爆炸动画
      GIF.play();
      // 判断用户是否胜利
      checkResult();
    }
  }, 12);
}

export function startAnimate() {
  window.play_animate = true;
}

export function stopAnimate() {
  window.play_animate = false;
}

export function restart() {
  // 初始化爆炸动画列表
  GIF.boom_play_list = [];
  // 初始化坦克队列
  init_tank();
}

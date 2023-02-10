import { Canvas } from "./js/canvas.js";
import { addTank, checkResult, Tank } from "./js/tank/BasicTank.js";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { GIF } from "./js/utils/ControlGIF";
import { UserTank } from "./js/tank/UserTank.js";
import { AITank } from "./js/tank/AITank.js";

window.play_animate = true;

window.tank_img = new Image();
window.tank_img.src = resource_img;
window.onload = () => {
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
  let canvasElement = document.querySelector("#main_canvas");
  canvas = new Canvas(canvasElement);
  console.log("单格大小 :>> ", canvas.square_width, ", ", canvas.square_height);
}

/**
 * @function: init_tank
 * @description: 初始化坦克
 * @author: Banana
 */
function init_tank() {
  tankList = [];

  // UserTank.create(
  //   { color: "blue", initDirection: 0, initPosition: 2 },
  //   function () {
  //     this.back(100);
  //   },
  //   null,
  //   null,
  //   null
  // );

  AITank.create();
  AITank.create();
  AITank.create();
  AITank.create();

  // let tank = new Tank(280, 300, 90, 0, 0, "red", 0);
  // tank.run.operation = function () {
  //   this.cannon_turn(-90);
  //   this.fire();
  // };

  // tank.on_scanned_robot.operation = function (enemy_angle) {
  //   if (
  //     this.get_cannnon_reload_time() <=
  //     Date.now() - this.get_last_launch_time()
  //   ) {
  //     this.say("我发现你了~");
  //     const cannon_angle = this.get_current_cannon_angle();
  //     console.log("enemy_angle,cannon_angle :>> ", enemy_angle, cannon_angle);
  // this.cannon_turn(70);
  //     this.cannon_turn(enemy_angle - cannon_angle);
  //     this.fire();
  // this.ahead(200);
  //   } else {
  //     this.say("装填中...");
  //   }
  //   this.continualScan();
  // };
  // tank.run.operation();
  // addTank(tank);
  // addTank(new Tank(280, 400, 90, 160, 160, "blue", 0));

  // self.tank_list[0].run.operation();

  // addTank(new Tank(10, 260, 180, 160, 160, "yellow", 0));
  // addTank(new Tank(0, 300, 180, 160, 160, "green", 0));
}

/**
 * @function: animate
 * @description: 开启动画
 * @author: Banana
 */
function animate() {
  if (window.play_animate && tankList.length) {
    canvas.init();
    tankList.forEach((tankItem) => {
      tankItem.implement_current_operation();
      tankItem.draw();
    });
    // 播放爆炸动画
    GIF.play();
    // 判断用户是否胜利
    checkResult();
  }

  requestAnimationFrame(animate);
}

export function startAnimate() {
  window.play_animate = true;
}

export function stopAnimate() {
  window.play_animate = false;
}

export function restart() {
  init_tank();
}

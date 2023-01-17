import { Canvas } from "./js/canvas.js";
import { checkResult } from "./js/tank/BasicTank.js";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { playBoomList } from "./js/utils/ControlGIF";
import { UserTank } from "./js/tank/UserTank.js";
import { AITank } from "./js/tank/AITank.js";

window.tank_img = new Image();
window.tank_position = new Map();
window.play_animate = true;
window.tank_img.src = resource_img;
window.onload = () => {
  init();
};

/**
 * @function: init
 * @description: 全局初始化
 * @author: Banana
 */
export function init() {
  init_canvas();
  init_tank();
  animate();
}

export function init_canvas() {
  let canvasElement = document.querySelector("#main_canvas");
  window.game_canvas = new Canvas(canvasElement);
  console.log(
    "单格大小 :>> ",
    window.game_canvas.square_width,
    ", ",
    window.game_canvas.square_height
  );
}

/**
 * @function: init_tank
 * @description: 初始化坦克
 * @author: Banana
 */
export function init_tank() {
  window.tank_list = [];

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

  // let tank = new Tank(600, 300, 0, 0, 0, "blue", 0);
  // tank.run.operation = function () {
  //   this.ahead(100);
  // };
  // tank.on_scanned_robot.operation = function () {};
  // tank.on_hit_wall.operation = function () {};
  // tank.on_hit_by_bullet.operation = function () {};
  // tank.run.operation();
  // addTank(tank);

  // addTank(new Tank(300, 300, 90, 160, 160, "red", 0));
  // window.tank_list[0].run.operation();

  // addTank(new Tank(300, 300, 180, 160, 160, "yellow", 0));
  // addTank(new Tank(0, 300, 180, 160, 160, "green", 0));
}

/**
 * @function: animate
 * @description: 开启动画
 * @author: Banana
 */
function animate() {
  //TODO 判断用户坦克状态 是胜利或失败执行对应的动画 然后return

  if (window.play_animate && window.tank_list.length) {
    window.game_canvas.init();
    // console.log('window.tank_position :>> ', window.tank_position);
    window.tank_list.forEach((tank_item) => {
      // console.log('object :>> ', tank_item.tank_action);
      tank_item.implement_current_operation();
      tank_item.draw();
    });
    // 播放爆炸动画
    playBoomList();
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

import "./less/index.less";
import { Canvas } from "./js/canvas.js";
import { Tank } from "./js/BasicTank.js";
// import { UserTank } from "./js/UserTank";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { angle, classify_radian, radian } from "./js/utils.js";
import { playBoom, playBoomList } from "./js/ControlGIF";

window.tank_img = new Image();
window.tank_position = new Map();
window.play_animate = true;
tank_img.src = resource_img;
window.tank_list = [];
window.onload = () => {
  init();
};

/**
 * @function: init
 * @description: 全局初始化
 * @author: Banana
 */
function init() {
  let canvasElement = document.querySelector("#main_canvas");
  window.game_canvas = new Canvas(canvasElement);

  console.log(
    "单格大小 :>> ",
    window.game_canvas.square_width,
    ", ",
    window.game_canvas.square_height
  );
  init_tank();

  animate();
}

/**
 * @function: init_tank
 * @description: 初始化坦克
 * @author: Banana
 */
function init_tank() {
  window.tank_list = [];
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

  // 右上方
  window.tank_list.push(new Tank(0, 0, 180, 160, 160, "red", 0, false));

  // 右下方
  window.tank_list.push(new Tank(300, 300, 180, 160, 160, "yellow", 0, false));

  // 左下方
  window.tank_list.push(new Tank(0, 300, 180, 160, 160, "green", 0, false));

  window.tank_list.forEach((tank_item) => {
    tank_item.run.operation();
  });
}

/**
 * @function: animate
 * @description: 开启动画
 * @author: Banana
 */
function animate() {
  if (window.play_animate) {
    window.game_canvas.init();
    // console.log('window.tank_position :>> ', window.tank_position);
    window.tank_list.forEach((tank_item) => {
      // console.log('object :>> ', tank_item.tank_action);
      tank_item.implement_current_operation();
      tank_item.draw();
    });
    playBoomList();
  }

  requestAnimationFrame(animate);
}

document.querySelector("#start").onclick = () => {
  window.play_animate = true;
};

document.querySelector("#stop").onclick = () => {
  window.play_animate = false;
};

document.querySelector("#restart").onclick = () => {
  init_tank();
};

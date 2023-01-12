import { Canvas } from "./js/canvas.js";
import { Tank, addTank } from "./js/tank/BasicTank.js";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { playBoomList } from "./js/utils/ControlGIF";
import { UserTank } from "./js/tank/UserTank.js";

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

  UserTank.create(
    { color: "red", initDirection: 0, initPosition: 4 },
    function () {
      this.back(100);
    },
    null,
    null,
    null
  );

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

export function startAnimate() {
  window.play_animate = true;
}

export function stopAnimate() {
  window.play_animate = false;
}

export function restart() {
  init_tank();
}

function run() {
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
  this.loop = function () {
    this.tank_turn(30);
    this.ahead(200);
    this.cannon_turn(360);
    this.radar_turn(360);
  };
  // 还是需要执行的
  this.loop();
}

const hitWall = function () {
  this.say("撞墙啦");
  this.tank_turn(45);
  this.back(20);
};

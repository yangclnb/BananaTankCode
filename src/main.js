import "./less/index.less";
import { Canvas } from "./js/Canvas";
import { Tank } from "./js/BasicTank";
import { UserTank } from "./js/UserTank";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { angle, classify_radian, radian } from "./js/utils";

window.tank_img = new Image();
window.tank_position = new Map();
tank_img.src = resource_img;
let tank_list = [];
window.onload = () => {
  init();
};

function init() {
  let canvasElement = document.querySelector("#main_canvas");
  window.game_canvas = new Canvas(canvasElement);

  console.log(
    "单格大小 :>> ",
    window.game_canvas.square_width,
    ", ",
    window.game_canvas.square_height
  );

  tank_list.push(new Tank(100, 300, 180, 270, 270, "blue", 0, false));
  tank_list[0].run.operation = function () {
    // console.log('this.action_queue :>> ', this);

    // 检测敌人 -----------------
    // this.radar_turn(300);
    this.back(400);

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

    // 动作循环 ----------------
    this.loop = function(){
      this.tank_turn(-90);
      this.ahead(100);
    }
    // 还是需要执行的
    this.loop();
  };

  // 右上方
  tank_list.push(new Tank(220, 110, 180, 160, 160, "red", 0, false));

  // 右下方
  tank_list.push(new Tank(300, 220, 180, 160, 160, "yellow", 0, false));

  // 左上方
  // tank_list.push(new Tank(100, 110, 180, 160, 160, "red", 0, false));

  // 左下方
  tank_list.push(new Tank(100, 210, 180, 160, 160, "green", 0, false));

  // tank_list.push(new Tank(300, 20, 170, 90, 0, "blue", 0, false));
  // tank_list[1].tank.action = 0;
  // tank_list[1].radar.rotate_state = false;

  // tank_list[1].cannon_rotate = false;
  // tank_list.push(new Tank(100, 0, 90, 0, 0, "green", 0, false));
  // tank_list.push(new Tank(400, 120, 270, 0, 0, "yellow", 0, false));

  tank_list.forEach((tank_item) => {
    tank_item.run.operation();
  });

  animate();
}

function animate() {
  window.game_canvas.init();
  // console.log('window.tank_position :>> ', window.tank_position);
  tank_list.forEach((tank_item) => {
    // console.log('object :>> ', tank_item.tank_action);
    tank_item.implement_current_operation();
    tank_item.draw();
  });
  requestAnimationFrame(animate);
}

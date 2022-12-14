import "./less/index.less";
import { Canvas } from "./js/canvas";
import { Tank } from "./js/tank";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { angle } from "./js/utils";

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
    window.game_canvas.square_width,", ",
    window.game_canvas.square_height
  );

  tank_list.push(new Tank(300, 200, 180, 160, 160, "red", 0, false));
  tank_list[0].tank.action = 0;
  // tank_list[0].cannon.rotate_state = false;

  tank_list.push(new Tank(120, 100, 0, 0, 0, "blue", 0, false));
  tank_list[1].tank.action = 0;
  tank_list[1].radar.rotate_state = false;

  // tank_list[1].cannon_rotate = false;
  // tank_list.push(new Tank(100, 0, 90, 0, 0, "green", 0, false));
  // tank_list.push(new Tank(400, 120, 270, 0, 0, "yellow", 0, false));

  animate();
}

function animate() {
  window.game_canvas.init();
  // console.log('window.tank_position :>> ', window.tank_position);
  tank_list.forEach((tank_item) => {
    // console.log('object :>> ', tank_item.tank_action);
    tank_item.move();
    tank_item.adjust_tank_direction();
    tank_item.adjust_cannon_direction();
    tank_item.adjust_radar_direction();
  });
  requestAnimationFrame(animate);
}

import "./less/index.less";
import { Canvas } from "./js/canvas";
import { Tank } from "./js/tank";
// import resource_img from "./img/tank.png";
import resource_img from "./img/tank_no_background.png";
import { angle } from "./js/utils";

window.tank_img = new Image();
tank_img.src = resource_img;
let tank_list = [];
window.onload = () => {
  init();
};

function init() {
  let canvasElement = document.querySelector("#main_canvas");
  window.game_canvas = new Canvas(canvasElement);

  tank_list.push(new Tank(400, 200, angle(0), angle(0), "red", 0, false));
  // tank_list.push(new Tank(50, 0, angle(0), angle(0), "blue", 0, false));
  // tank_list.push(new Tank(100, 0, angle(90), angle(0), "green", 0, false));
  // tank_list.push(new Tank(400, 120, angle(270), angle(0), "yellow", 0, false));

  animate();
}

function animate() {
  window.game_canvas.init(); 

  tank_list.forEach((tank_item) => {
    // console.log('object :>> ', tank_item.tank_action);
    tank_item.move();
    tank_item.adjust_tank_direction();
    tank_item.adjust_cannon_direction();
  });
  requestAnimationFrame(animate);
}

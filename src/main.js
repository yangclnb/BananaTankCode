import "./less/index.less";
import { Canvas } from "./js/canvas";
import { Tank } from "./js/tank";

window.tank_img = new Image();
tank_img.src = "./img/tank.png";
tank_img.onload = () => {
  let canvasElement = document.querySelector("#main_canvas");
  window.game_canvas = new Canvas(canvasElement);
  const tank = new Tank(0, 0, 0, 0, "red", 0, false);
  const tank1 = new Tank(50, 0, 0, 0, "blue", 0, false);
  const tank2 = new Tank(100, 0, 0, 0, "green", 0, false);
  const tank3 = new Tank(150, 0, 0, 0, "yellow", 0, false);
};

import boom1 from "../../img/boom/1.png";
import boom2 from "../../img/boom/2.png";
import boom3 from "../../img/boom/3.png";
import boom4 from "../../img/boom/4.png";
import boom5 from "../../img/boom/5.png";
import boom6 from "../../img/boom/6.png";
import boom7 from "../../img/boom/7.png";
import boom8 from "../../img/boom/8.png";
import { canvas } from "../../main.js";

class GIFClass {
  constructor() {
    this.boom = [boom1, boom2, boom3, boom4, boom5, boom6, boom7, boom8];
    this.boom_play_list = []; // 爆炸队列
  }
  addEvent(x, y) {
    let boom_img = [];
    for (const item of this.boom) {
      let temp = new Image();
      temp.src = item;
      boom_img.push({ showNum: 10, img: temp });
    }

    this.boom_play_list.push({ x, y, boom_img });
  }

  play() {
    const ctx = canvas.ctx;
    const square_width = canvas.square_width;
    const square_height = canvas.square_height;
    let index = 0;

    for (const item of this.boom_play_list) {
      const boom_img = item.boom_img;

      if (boom_img.length === 0) {
        this.boom_play_list.splice(index, 1);
        continue;
      }

      let current_head = boom_img[0];

      if (current_head.showNum === 0) {
        boom_img.shift();
        return this.play();
      }

      current_head.showNum--;
      ctx.drawImage(
        current_head.img,
        0,
        0,
        320,
        320,
        item.x - square_width,
        item.y - square_height,
        square_width * 2,
        square_height * 2
      );

      index++;
    }
  }
}

export const GIF = new GIFClass();

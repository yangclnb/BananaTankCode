const map_color_scheme = { a: ["#707eaf", "#307eaf"] };
const map_faction_position = {
  brick: { x: 106, y: 155 },
  metal: { x: 156, y: 155 },
  rock: { x: 210, y: 155 },
};

export class Canvas {
  constructor(canvasElement) {
    console.log("canvasElement :>> ", canvasElement);
    this.canvas = canvasElement;
    const ctx = canvasElement.getContext("2d");

    this.ctx = ctx;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.square_width = this.canvas.width / 15;
    this.square_height = this.canvas.height / 10;

    this.init();
  }

  init(tank_list) {
    this.create_vertical_background("#707eaf", "#307eaf");
    // this.fill_texture_background("brick");
  }

  /**
   * @function: create_horizontal_background
   * @description: 纵向地图
   * @param {*} color_1
   * @param {*} color_2
   * @return {*}
   * @author: Banana
   */
  create_horizontal_background(color_1, color_2) {
    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 10; y++) {
        this.ctx.fillStyle = x % 2 == 0 ? color_1 : color_2;
        this.ctx.fillRect(
          x * this.square_width,
          y * this.square_height,
          this.canvas.width,
          this.canvas.height
        );
      }
    }
  }

  /**
   * @function: create_vertical_background
   * @description: 横向地图
   * @param {*} color_1
   * @param {*} color_2
   * @return {*}
   * @author: Banana
   */
  create_vertical_background(color_1, color_2) {
    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 10; y++) {
        this.ctx.fillStyle = y % 2 == 0 ? color_1 : color_2;
        this.ctx.fillRect(
          x * this.square_width,
          y * this.square_height,
          this.canvas.width,
          this.canvas.height
        );
      }
    }
  }

  fill_texture_background(material) {
    // const ptrn = this.ctx.createPattern(window.tank_img, "repeat");
    // this.ctx.fillStyle = ptrn;
    // this.ctx.fillRect(0, 0, this.width, this.height);

    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 10; y++) {
        this.ctx.drawImage(
          window.tank_img,
          map_faction_position[material].x,
          map_faction_position[material].y,
          49,
          46,
          x * this.square_width,
          y * this.square_height,
          this.square_width + 6,
          this.square_height + 4
        );
      }
    }
  }
}

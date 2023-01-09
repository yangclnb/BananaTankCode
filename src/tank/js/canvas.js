import { map_faction_position, map_color_scheme } from "./EnumObject.js";

export class Canvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    const ctx = canvasElement.getContext("2d");

    this.ctx = ctx;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.minimum_x = 25;
    this.minimum_y = 15;
    this.square_width = this.canvas.width / this.minimum_x;
    this.square_height = this.canvas.height / this.minimum_y;
    this.average_length_width = (this.square_width + this.square_height) / 2;

    this.init();
  }

  init() {
    this.create_vertical_background(
      map_color_scheme.a[0],
      map_color_scheme.a[1]
    );
    // this.fill_texture_background("rock_map");
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
    for (let x = 0; x < this.minimum_x; x++) {
      for (let y = 0; y < this.minimum_xy; y++) {
        this.ctx.fillStyle = x % 2 == 0 ? color_1 : color_2;
        this.ctx.fillRect(
          x * this.square_width,
          y * this.square_height,
          this.square_width,
          this.square_height
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
    for (let x = 0; x < this.minimum_x; x++) {
      for (let y = 0; y < this.minimum_y; y++) {
        this.ctx.fillStyle = y % 2 == 0 ? color_1 : color_2;
        this.ctx.fillRect(
          x * this.square_width,
          y * this.square_height,
          this.square_width + 1,
          this.square_height
        );
      }
    }
  }

  /**
   * @function: fill_texture_background
   * @description: 以贴图形式填充背景
   * @param {*} material
   * @return {*}
   * @author: Banana
   */
  fill_texture_background(material) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let x = 0; x < this.minimum_x; x++) {
      for (let y = 0; y < this.minimum_y; y++) {
        this.ctx.drawImage(
          window.tank_img,
          map_faction_position[material].x,
          map_faction_position[material].y,
          49,
          46,
          x * this.square_width,
          y * this.square_height,
          this.square_width + 8,
          this.square_height + 10
        );
      }
    }
  }

  /**
   * @function: translate_stack
   * @description: canvas中的所有translate操作都会影响接下来的图像绘制，用于在translate后还原操作达到不影响后续绘制的目的
   * @return {*}
   * @author: Banana
   */
  translate_stack() {
    let operation_stack = [];

    return (operation, argu_list, func) => {
      if (operation_stack.length && operation === "pop") {
        let current_operation = operation_stack.pop();
        // 反转输入
        current_operation.argu_list.forEach((element, i) => {
          current_operation.argu_list[i] = -element;
        });
        return current_operation.func(...current_operation.argu_list);
      } else if (operation === "push") {
        operation_stack.push({ func, argu_list });
        return func(...argu_list);
      }
    };
  }

  /**
   * @function: vision_origin
   * @description: canvas 调整过程中容易找不到当前的原点位置，用于确定当前的原点位置
   * @author: Banana
   */
  vision_origin() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 15);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /**
   * @function: vision_position
   * @description: canvas 调整过程中确定指定坐标点的位置
   * @author: Banana
   */
  vision_position(x, y, color) {
    let stack = this.translate_stack();
    stack("push", [x, y], (a, b) => {
      this.ctx.translate(a, b);
    });
    this.ctx.beginPath();
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(10, 0);
    this.ctx.stroke();
    this.ctx.closePath();
    stack("pop");
  }
}

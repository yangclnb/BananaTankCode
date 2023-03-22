import { map_faction_position } from "./EnumObject.js";
import { Tank } from "./tank/BasicTank.js";
import { formatString, angle } from "./utils/utils.js";

export class Canvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
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
    this.drawBackground();
    // this.create_vertical_background(map_color_scheme.b);
    // this.fill_texture_background("rock_map");
  }

  drawBackground() {
    const [backgroundType, value1, value2] = window.canvasBackground;
    const bgInfo = [value1, value2];
    if (backgroundType === 0) {
      // 为 0 绘制贴图
      this.fill_texture_background(bgInfo);
    } else if (backgroundType === 1) {
      // 为 1 绘制纯色背景
      this.create_vertical_background(bgInfo);
    }
  }

  /**
   * @function: create_horizontal_background
   * @description: 纵向地图
   * @param {*} color_1
   * @param {*} color_2
   * @return {*}
   * @author: Banana
   */
  create_horizontal_background(colorOptions) {
    const [color_1, color_2] = colorOptions;

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
  create_vertical_background(colorOptions) {
    const [color_1, color_2] = colorOptions;
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
    const [xPosistion, yPosition] = material;

    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let x = 0; x < this.minimum_x; x++) {
      for (let y = 0; y < this.minimum_y; y++) {
        this.ctx.drawImage(
          window.tank_img,
          xPosistion,
          yPosition,
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
        operation_stack.push({
          func,
          argu_list,
        });
        return func(...argu_list);
      }
    };
  }

  // 柯里化绘制控制函数
  actionStack = this.translate_stack();

  // 当前绘制中心移至 x，y 处
  translate = (x, y) =>
    this.actionStack("push", [x, y], (a, b) => {
      this.ctx.translate(a, b);
    });

  // 当前旋转角度调整为 angle
  rotate = (angle) =>
    this.actionStack("push", [angle], (a) => {
      this.ctx.rotate(a);
    });

  // 弹出上一次的绘制信息，避免影响以后的绘制
  popTransformation = () => this.actionStack("pop");

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
    this.translate(x, y);
    this.ctx.beginPath();
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(10, 0);
    this.ctx.stroke();
    this.ctx.closePath();
    this.popTransformation();
  }

  /**
   * @function: settlementPage
   * @description: 绘制结算界面
   * @author: Banana
   */
  settlementPage(userInfo) {
    const date = new Date(userInfo.serviveTime);
    const M = date.getMinutes();
    const S = date.getSeconds();
    const serviveTime = `${M}:${S}`;
    // 填充背景
    this.ctx.fillStyle = "#1D2839";
    this.ctx.fillRect(0, 0, this.width, this.height);
    // 填充展示框
    this.ctx.fillStyle = "#111927";
    this.ctx.fillRect(this.width / 2 - 300, 50, 600, 400);

    // 绘制用户的坦克
    new Tank(250, 350, 90, 90, 90, window.userTank.color, 0);
    // 左右分割线
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#1D2839";
    this.ctx.moveTo(390, 60);
    this.ctx.lineTo(390, 440);
    this.ctx.stroke();
    this.ctx.closePath();

    let originalTextPosition = 150;

    // 右侧数据
    this.ctx.textAlign = "left";
    this.ctx.font = "normal bold 40px serif"; // 设置文案大小和字体
    this.ctx.fillStyle = "#52A652";
    this.ctx.lineCap = "round";
    this.ctx.fillText(userInfo.state, 420, originalTextPosition);

    this.ctx.font = "16px serif"; // 设置文案大小和字体
    this.ctx.fillText(
      formatString("您控制的坦克", userInfo.color, 18, 14),
      420,
      (originalTextPosition += 100)
    );
    this.ctx.fillText(
      formatString("存活时长", serviveTime, 18, 16),
      420,
      (originalTextPosition += 50)
    );

    this.ctx.fillText(
      formatString("击中数量", "" + userInfo.hitNumber, 18, 16),
      420,
      (originalTextPosition += 50)
    );

    this.ctx.fillStyle = "#D8DFEA";
    this.ctx.font = "12px serif"; // 设置文案大小和字体
    this.ctx.fillText(
      formatString("    ", "重新提交代码可再次挑战", 18, 22),
      420,
      (originalTextPosition += 50)
    );
  }

  render = {
    tank: (tankData) => {
      this.ctx.beginPath();

      this.translate(tankData.x, tankData.y);
      this.rotate(-angle(90));
      this.rotate(-tankData.angle);

      this.ctx.drawImage(
        window.tank_img,
        map_faction_position[tankData.color].x,
        map_faction_position[tankData.color].y,
        40,
        40,
        -(this.square_width / 2),
        -(this.square_height / 2),
        this.square_width,
        this.square_height
      );

      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
    },
    // 绘制雷达
    radar: (currentAngle, distance, x, y) => {
      if (!window.displayRadar) return;
      this.translate(x, y);
      this.rotate(-angle(90));
      this.rotate(angle(90) - currentAngle - angle(7.5));

      var gradient = this.ctx.createLinearGradient(0, 0, distance, 10);
      gradient.addColorStop(0, "rgba(17,153,142,0.5)");
      gradient.addColorStop(1, "rgba(53,125,195, 0)");
      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.moveTo(distance, 0);
      this.ctx.lineTo(0, 0);
      this.rotate(angle(15));
      this.ctx.lineTo(distance, 0);
      this.ctx.fill();
      this.ctx.closePath();

      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
    },
    // 绘制炮管
    cannon: (currentAngle, x, y) => {
      this.translate(x, y);
      this.rotate(-angle(90));
      this.rotate(-currentAngle);

      this.ctx.drawImage(
        window.tank_img,
        map_faction_position.cannon.x,
        map_faction_position.cannon.y,
        11,
        40,
        -5.5,
        0,
        11,
        40
      );

      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
    },
    // 绘制子弹
    bullet: (cannonData) => {
      if (cannonData.thread === null) return;

      this.translate(cannonData.launch_x, cannonData.launch_y);
      this.translate(cannonData.x, cannonData.y);
      this.rotate(-cannonData.cannonball_angle);

      this.ctx.beginPath();
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = "yellow";
      this.ctx.moveTo(-2.5, 0);
      this.ctx.lineTo(2.5, 0);
      this.ctx.stroke();
      this.ctx.closePath();

      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
    },
    // 绘制血条
    blood: (currentBlood, x, y) => {
      if (currentBlood === 0) return;

      this.translate(x, y);
      this.rotate(-angle(90));
      this.translate(30, -17);

      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, currentBlood);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "green";
      this.ctx.stroke();

      this.popTransformation();
      this.popTransformation();
      this.popTransformation();
    },
    // 绘制文本
    text: (text, x, y) => {
      if (text === "") return;
      this.translate(x, y);

      this.ctx.direction = "ltr"; // 文本方向从左向右
      this.ctx.font = "15px serif"; // 设置文案大小和字体
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#D8DFEA";
      this.ctx.lineCap = "round";
      this.ctx.fillText(text, 0, -40);

      this.popTransformation();
    },
  };
}

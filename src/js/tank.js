import {
  map_faction_position,
  tank_action,
  tank_state,
  tank_turn,
} from "./EnumObject";
import { angle, classify_radian, radian } from "./utils";

export class Tank {
  /**
   * @param {Number} x 横坐标
   * @param {Number} y 纵坐标
   * @param {Number} tank_angle 坦克角度
   * @param {Number} cannon_angle 炮塔角度
   * @param {String} tank_color 坦克颜色 [red, blue, yellow, green]
   * @param {Number} faction 队伍 [0，1，2，3]
   * @param {Boolean} is_player 是否是玩家控制，默认true
   * @author: Banana
   */
  constructor(
    x,
    y,
    tank_angle,
    cannon_angle,
    tank_color,
    faction,
    is_player = true
  ) {
    this.x = x + 23;
    this.y = y + 20;
    this.tank_angle = tank_angle;
    this.cannon_angle = cannon_angle;
    this.radar_angle = cannon_angle;
    this.faction = faction;
    tank_color += "_tank";
    this.tank_color = map_faction_position[tank_color]
      ? tank_color
      : "red_tank";
    console.log("tank_color :>> ", this.tank_color);

    this.tank_state = tank_state.normal; // 坦克状态
    this.tank_action = tank_action.tank_move; // 坦克行为

    this.tank_move_direction = tank_action.tank_move_direction.front; // 坦克移动方向

    this.adjust_radar_speed = angle(0.5); // 一帧雷达扫描1°
    this.adjust_cannon_speed = angle(0.5); // 一帧旋转炮塔1°
    this.adjust_tank_speed = angle(1); // 一帧调整坦克朝向1°

    this.move_speed = 0.5; // 移动速度
    this.tank_turn_direction = tank_turn.left; // 下次坦克的转向
    this.cannon_move_direction = tank_turn.left; // 下次炮管的转向
    this.radar_move_direction = tank_turn.left; // 下次雷达的转向

    this.largest_cannon_speed = 3; // 最大炮弹打击半径
    this.recent_launch_time = 0; //最近发射炮弹时间
    this.draw();
  }

  /**
   * @function: draw
   * @description: 绘制坦克
   * @author: Banana
   */
  draw() {
    const canvas = window.game_canvas.canvas;
    const translate_stack = window.game_canvas.translate_stack();
    const ctx = window.game_canvas.ctx;
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;

    // console.log("square width and height:>> ", square_width, square_height);
    ctx.beginPath();

    translate_stack("push", [this.x, this.y], (a, b) => {
      ctx.translate(a, b);
    });

    // 初始角度调整为 y=kx 与 x 轴正方向的夹角
    translate_stack("push", [-angle(90)], (a) => {
      ctx.rotate(a);
    });


    // 坦克  ---------------------------

    translate_stack("push", [-this.tank_angle], (a) => {
      ctx.rotate(a);
    });
    ctx.drawImage(
      window.tank_img,
      map_faction_position[this.tank_color].x,
      map_faction_position[this.tank_color].y,
      40,
      40,
      -(square_width / 2),
      -(square_height / 2),
      square_width,
      square_height
    );

    window.game_canvas.vision_origin();

    translate_stack("pop");

    // 雷达 ---------------------------

    translate_stack("push", [angle(75) - this.radar_angle], (a) => {
      ctx.rotate(a);
    });
    var gradient = ctx.createLinearGradient(0, 0, 5 * square_width, 10);
    gradient.addColorStop(0, "rgba(17,153,142,0.5)");
    gradient.addColorStop(1, "rgba(53,125,195, 0)");
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.moveTo(5 * square_width, 0);
    ctx.lineTo(0, 0);
    translate_stack("push", [angle(30)], (a) => {
      ctx.rotate(a);
    });
    ctx.lineTo(5 * square_width, 0);
    ctx.fill();
    translate_stack("pop");

    ctx.closePath();
    translate_stack("pop");


    //炮管 ---------------------------

    translate_stack("push", [-this.cannon_angle], (a) => {
      ctx.rotate(a);
    });

    ctx.drawImage(
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

    translate_stack("pop");

    translate_stack("pop");
    translate_stack("pop");
  }

  /**
   * @function: move
   * @description: 坦克移动
   * @author: Banana
   */
  move() {
    // 当前坦克行为不是移动，直接退出
    if (this.tank_action !== tank_action.tank_move) return;

    const k = Math.tan(this.tank_angle);

    let [x_move, y_move] = this.compute_quadrant(k);

    //TODO 拆分边界检测 为 函数
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;
    const canvas_width = window.game_canvas.canvas.width;
    const canvas_height = window.game_canvas.canvas.height;
    if (
      this.x >= square_width / 2 &&
      this.x <= canvas_width - square_width / 2
    ) {
      this.x += x_move;
    } else {
      this.collision_detection("x");
    }

    if (
      this.y >= square_height / 2 &&
      this.y <= canvas_height - square_height / 2
    ) {
      this.y += y_move;
    } else {
      this.collision_detection("y");
    }

    this.draw();
  }

  /**
   * @function: adjust_tank_direction
   * @description: 根据类中的 turn 参数，调整自身的方向
   * @return {*}
   * @author: Banana
   */
  adjust_tank_direction() {
    if (this.tank_action !== tank_action.adjust_tank_direction) return;

    this.tank_angle = classify_radian(this.tank_angle);

    // 判断顺逆时针旋转
    this.tank_angle =
      this.tank_turn_direction === 0
        ? this.tank_angle - this.adjust_tank_speed
        : this.tank_angle + this.adjust_tank_speed;

    this.draw();
  }

  /**
   * @function: adjust_cannon_direction
   * @description: 调整炮口角度
   * @return {*}
   * @author: Banana
   */
  adjust_cannon_direction() {
    this.cannon_angle = classify_radian(this.cannon_angle);

    // 判断顺逆时针旋转
    this.cannon_angle =
      this.tank_turn_direction === 0
        ? this.cannon_angle - this.adjust_cannon_speed
        : this.cannon_angle + this.adjust_cannon_speed;

    this.draw();
  }

  /**
   * @function: compute_quadrant
   * @description: tank初始位置作为原点，计算tank下一步移动的x和y值得改变
   * @param {*} k 斜率
   * @return {Array} [x,y]
   * @author: Banana
   */
  compute_quadrant(k) {
    let x = this.move_speed / k;
    let y = this.move_speed * k;

    // 在tan 0时 可以把函数看作是y=0。则x趋近于∞，直接返回x轴的速率即可
    if (x == Infinity) [x, y] = [this.move_speed, 0];
    else {
      // 将移动速度限制在规定的速率之内
      while (Math.abs(x) >= this.move_speed || Math.abs(y) >= this.move_speed) {
        x = x / 2;
        y = y / 2;
      }

      if (this.tank_angle <= angle(90)) {
        y *= -1;
      } else if (this.tank_angle <= angle(180)) {
        // x *= -1;
        // y *= -1;
      } else if (this.tank_angle <= angle(270)) {
        x *= -1;
      } else if (this.tank_angle <= angle(360)) {
        x *= -1;
        y *= -1;
      }
    }

    // console.log("this.tank_turn_direction :>> ", this.tank_move_direction);
    if (this.tank_move_direction === tank_action.tank_move_direction.front) {
      return [x, y];
    } else if (
      this.tank_move_direction === tank_action.tank_move_direction.back
    ) {
      return [-x, -y];
    }
  }

  /**
   * @function: after_collision
   * @description: 碰撞后执行
   * @param {*} second 持续时间
   * @return {*}
   * @author: Banana
   */
  after_collision(second) {
    // 受到撞击猛地后退一下 -> 旋转方向 -> 再次向前
    // const k = Math.tan(this.tank_angle);
    // this.tank_move_direction = tank_action.tank_move_direction.back;
    // let [x_move, y_move] = this.compute_quadrant(k);
    // this.x += x_move * 5;
    // this.y += y_move * 5;
    // this.tank_action = tank_action.adjust_tank_direction;
    // setTimeout(() => {
    //   this.tank_action = tank_action.tank_move;
    //   this.tank_move_direction = tank_action.tank_move_direction.front;
    // }, second);

    // 受到撞击倒退0.05s -> 旋转方向 -> 再次向前
    const k = Math.tan(this.tank_angle);
    this.tank_move_direction = tank_action.tank_move_direction.back;
    let [x_move, y_move] = this.compute_quadrant(k);
    console.log("x_move,y_move :>> ", x_move, y_move);
    this.x += x_move;
    this.y += y_move;
    setTimeout(() => {
      this.tank_action = tank_action.adjust_tank_direction;
      setTimeout(() => {
        this.tank_action = tank_action.tank_move;
        this.tank_move_direction = tank_action.tank_move_direction.front;
      }, second);
    }, 50);
  }

  /**
   * @function: collision_detection
   * @description: 碰撞检测
   * @param {*} direction 碰撞的轴向
   * @author: Banana
   */
  collision_detection(direction) {
    // if (direction === "x") {
    //   // x碰撞左转
    //   this.tank_turn_direction = tank_turn.left;
    // } else if (direction === "y") {
    //   // y碰撞右转
    //   this.tank_turn_direction = tank_turn.right;
    // }
    this.after_collision(500);
  }

  /**
   * @function: search_enemy
   * @description: 雷达开始搜索敌人
   * @param {*} func 发现敌人时的回调函数
   * @author: Banana
   */
  search_enemy(func) {
    let angle = 0;
    let distance = 10;
    // ...
    return func(angle, distance);
  }
}

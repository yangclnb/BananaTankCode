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
    radar_angle,
    tank_color,
    faction,
    is_player = true
  ) {
    this.faction = faction;

    console.log("Init " + tank_color);

    this.tank = {
      x: x + 23,
      y: y + 20,
      color: map_faction_position[tank_color] ? tank_color : "red_tank",
      angle: angle(tank_angle),
      current_state: tank_state.normal, // 坦克状态
      action: tank_action.tank_move, // 坦克行为
      speed: 0.5, // 移动速度
      rotate_speed: angle(1), // 一帧调整坦克朝向1°
      turn_direction: tank_turn.left, // 下次坦克的转向
      move_direction: tank_action.tank_move_direction.front, // 坦克移动方向
    };

    this.cannon = {
      angle: angle(cannon_angle),
      rotate_state: true, // 是否允许炮口旋转
      launch_speed: 3, // 最大炮弹速
      rotate_speed: angle(0.5), // 一帧旋转炮塔1°
      turn_direction: tank_turn.left, // 下次炮管的转向
      launch_time: 0,
    };

    this.radar = {
      angle: angle(radar_angle),
      rotate_state: true, // 是否允许雷达旋转
      rotate_speed: angle(0.5), // 一帧雷达扫描1°
      turn_direction: tank_turn.left, // 下次雷达的转向
      largest_distance: window.game_canvas.square_width * 8, // 最远扫描距离
    };

    // 存储最初位置
    window.tank_position.set(this.tank.color, this.get_current_position());
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

    translate_stack("push", [this.tank.x, this.tank.y], (a, b) => {
      ctx.translate(a, b);
    });

    // 初始角度调整为 y=kx 与 x 轴正方向的夹角
    translate_stack("push", [-angle(90)], (a) => {
      ctx.rotate(a);
    });

    // 坦克  ---------------------------

    translate_stack("push", [-this.tank.angle], (a) => {
      ctx.rotate(a);
    });
    ctx.drawImage(
      window.tank_img,
      map_faction_position[this.tank.color].x,
      map_faction_position[this.tank.color].y,
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

    translate_stack(
      "push",
      [angle(90) - this.radar.angle - angle(7.5)],
      (a) => {
        ctx.rotate(a);
      }
    );
    var gradient = ctx.createLinearGradient(
      0,
      0,
      this.radar.largest_distance,
      10
    );
    gradient.addColorStop(0, "rgba(17,153,142,0.5)");
    gradient.addColorStop(1, "rgba(53,125,195, 0)");
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.moveTo(this.radar.largest_distance, 0);
    ctx.lineTo(0, 0);
    translate_stack("push", [angle(15)], (a) => {
      ctx.rotate(a);
    });
    ctx.lineTo(this.radar.largest_distance, 0);
    ctx.fill();
    translate_stack("pop");

    ctx.closePath();
    translate_stack("pop");

    //炮管 ---------------------------

    translate_stack("push", [-this.cannon.angle], (a) => {
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
    if (this.tank.action !== tank_action.tank_move) return;

    const k = Math.tan(this.tank.angle);

    let [x_move, y_move] = this.compute_quadrant(k);

    //TODO 拆分边界检测 为 函数
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;
    const canvas_width = window.game_canvas.canvas.width;
    const canvas_height = window.game_canvas.canvas.height;
    if (
      this.tank.x >= square_width / 2 &&
      this.tank.x <= canvas_width - square_width / 2
    ) {
      this.tank.x += x_move;
    } else {
      this.collision_detection("x");
    }

    if (
      this.tank.y >= square_height / 2 &&
      this.tank.y <= canvas_height - square_height / 2
    ) {
      this.tank.y += y_move;
    } else {
      this.collision_detection("y");
    }

    window.tank_position.set(this.tank.color, this.get_current_position());

    this.draw();
  }

  /**
   * @function: adjust_tank_direction
   * @description: 根据类中的 turn 参数，调整自身的方向
   * @author: Banana
   */
  adjust_tank_direction() {
    if (this.tank.action !== tank_action.adjust_tank_direction) return;

    this.tank.angle = classify_radian(this.tank.angle);

    // 判断顺逆时针旋转
    this.tank.angle =
      this.tank.turn_direction === 0
        ? this.tank.angle - this.tank.rotate_speed
        : this.tank.angle + this.tank.rotate_speed;

    this.draw();
  }

  /**
   * @function: adjust_cannon_direction
   * @description: 调整炮口角度
   * @author: Banana
   */
  adjust_cannon_direction() {
    if (this.cannon.rotate_state === false) return;

    this.cannon.angle = classify_radian(this.cannon.angle);

    // 判断顺逆时针旋转
    this.cannon.angle =
      this.cannon.turn_direction === 0
        ? this.cannon.angle - this.cannon.rotate_speed
        : this.cannon.angle + this.cannon.rotate_speed;

    this.draw();
  }

  /**
   * @function: adjust_radar_direction
   * @description: 调整雷达角度
   * @return {*}
   * @author: Banana
   */
  adjust_radar_direction() {
    if (this.radar.rotate_state === false) return;

    // console.log('this.tank.color,this.radar.angle :>> ', this.tank.color,this.radar.angle);
    this.radar.angle = classify_radian(this.radar.angle);

    // 判断顺逆时针旋转
    this.radar.angle =
      this.radar.turn_direction === 0
        ? this.radar.angle - this.radar.rotate_speed
        : this.radar.angle + this.radar.rotate_speed;

    this.search_enemy(this.radar.angle);
    this.draw();
  }

  /**
   * @function: get_current_position
   * @description: 返回xy轴的位置
   * @return {Array} [x轴位置, y轴位置]
   * @author: Banana
   */
  get_current_position() {
    return [this.tank.x, this.tank.y];
  }

  /**
   * @function: compute_quadrant
   * @description: tank初始位置作为原点，计算tank下一步移动的x和y值得改变
   * @param {*} k 斜率
   * @return {Array} [x,y]
   * @author: Banana
   */
  compute_quadrant(k) {
    let x = this.tank.speed / k;
    let y = this.tank.speed * k;

    // 在tan 0时 可以把函数看作是y=0。则x趋近于∞，直接返回x轴的速率即可
    if (x == Infinity) [x, y] = [this.tank.speed, 0];
    else {
      // 将移动速度限制在规定的速率之内
      while (Math.abs(x) >= this.tank.speed || Math.abs(y) >= this.tank.speed) {
        x = x / 2;
        y = y / 2;
      }

      if (this.tank.angle <= angle(90)) {
        y *= -1;
      } else if (this.tank.angle <= angle(180)) {
        // x *= -1;
        // y *= -1;
      } else if (this.tank.angle <= angle(270)) {
        x *= -1;
      } else if (this.tank.angle <= angle(360)) {
        x *= -1;
        y *= -1;
      }
    }

    // console.log("this.tank.turn_direction :>> ", this.tank.move_direction);
    if (this.tank.move_direction === tank_action.tank_move_direction.front) {
      return [x, y];
    } else if (
      this.tank.move_direction === tank_action.tank_move_direction.back
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
    // const k = Math.tan(this.tank.angle);
    // this.tank.move_direction = tank_action.tank_move_direction.back;
    // let [x_move, y_move] = this.compute_quadrant(k);
    // this.tank.x += x_move * 5;
    // this.tank.y += y_move * 5;
    // this.tank.action = tank_action.adjust_tank_direction;
    // setTimeout(() => {
    //   this.tank.action = tank_action.tank_move;
    //   this.tank.move_direction = tank_action.tank_move_direction.front;
    // }, second);

    // 受到撞击倒退0.05s -> 旋转方向 -> 再次向前
    const k = Math.tan(this.tank.angle);
    this.tank.move_direction = tank_action.tank_move_direction.back;
    let [x_move, y_move] = this.compute_quadrant(k);
    console.log("x_move,y_move :>> ", x_move, y_move);
    this.tank.x += x_move;
    this.tank.y += y_move;
    setTimeout(() => {
      this.tank.action = tank_action.adjust_tank_direction;
      setTimeout(() => {
        this.tank.action = tank_action.tank_move;
        this.tank.move_direction = tank_action.tank_move_direction.front;
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
    //   this.tank.turn_direction = tank_turn.left;
    // } else if (direction === "y") {
    //   // y碰撞右转
    //   this.tank.turn_direction = tank_turn.right;
    // }
    this.after_collision(500);
  }

  /**
   * @function: search_enemy
   * @description: 雷达开始搜索敌人
   * @param {*} radian
   * @return {Boolean}
   * @author: Banana
   */
  search_enemy(radian) {
    //! 仍有特定角度无法触发，可以进一步加大判断k的精度
    window.tank_position.forEach((value, key) => {
      // 排除自己的位置
      if (key === this.tank.color) return;

      //TODO 敌友判断

      //* 将自身位置设置为原点，其他的坦克转化成基于自身为原点的位置，O(xo,yo) ,a(xa,ya) new_xa = xa-xo,new_ya=yo-ya
      const x = value[0] - this.tank.x,
        y = this.tank.y - value[1];
      // console.log("x,y :>> ", x, y);

      // 超越雷达范围直接退出
      const distance = Math.sqrt(x * x + y * y);
      if (distance > this.radar.largest_distance) return;

      const k = Math.tan(radian).toFixed(2);
      const current_k = (y / x).toFixed(2); // 根据敌方坦克坐标和自身的坐标计算斜率

      // 判断雷达指向是否为敌方坦克所在的象限
      const current_radar_quadrant = this.determine_quadrant_by_radian(
        this.radar.angle
      );
      // 判断敌方坦克所在的象限
      const current_enemy_quadrant = this.determine_quadrant_by_position(x, y);

      // console.log("current_radar_quadrant :>> ", current_radar_quadrant);

      // 水平情况
      if (y === 0 && (x > 0 ? "+x" : "-x") === current_radar_quadrant) {
        console.log(`${this.tank.color} : find you! => ${key}`);
        // return radian(this.radar.angle);
      } else if (
        current_radar_quadrant === current_enemy_quadrant &&
        parseFloat(k) + 0.29 >= current_k &&
        parseFloat(k) - 0.29 <= current_k
      ) {
        // alert(k + " " + current_k + "" + this.radar.angle);

        console.log(`${this.tank.color} : find you! => ${key}`);
        // return radian(this.radar.angle);
      }
    });
  }

  /**
   * @function: determine_quadrant_by_radian
   * @description: 根据当前坦克雷达的弧度, 计算当前所在的象限,若处在坐标轴上返回 +x | -x | +y | -y
   * @param {*} current_radian 当前的弧度
   * @return {*} 所在的象限 或 坐标轴的正负 +x | -x | +y | -y
   * @author: Banana
   */
  determine_quadrant_by_radian(current_radian) {
    let angle = radian(classify_radian(current_radian)).toFixed(2);
    // console.log("angle :>> ", angle);
    if (angle == 0 || angle == 360) return "+x";
    else if (angle == 90) return "+y";
    else if (angle == 180) return "-x";
    else if (angle == 270) return "-y";
    else if (angle < 90) return 1;
    else if (angle < 180) return 2;
    else if (angle < 270) return 3;
    else if (angle < 360) return 4;
  }

  /**
   * @function: determine_quadrant_by_position
   * @description: 根据弧度计算敌方坦克相对于自身所在的象限
   * @param {Number} x 坦克的x位置
   * @param {Number} y 坦克的y位置
   * @return {Number} 所在的象限
   * @author: Banana
   */
  determine_quadrant_by_position(x, y) {
    if (x > 0) {
      if (y > 0) return 1;
      else if (y < 0) return 4;
    } else if (x < 0) {
      if (y > 0) return 2;
      else if (y < 0) return 3;
    }
  }
}

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
      x: 0,
      y: 0,
      reload_time: 3000, // 装填所需时间 (毫秒)
      distance: 0, // 初始化炮弹移动的距离
      cannonball_angle: 0, // 炮弹发射时的斜率
      angle: angle(cannon_angle), //炮管的指向角度
      rotate_state: true, // 是否允许炮口旋转
      launch_speed: 15, // 最大炮弹速
      rotate_speed: angle(0.5), // 一帧旋转炮塔1°
      turn_direction: tank_turn.left, // 下次炮管的转向
      launch_time: 0, // 上次发射时间
      thread: null, // 炮弹移动线程
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

  injured() {
    //TODO 挨炮后 血条移动
    //TODO 血条清零 坦克消失
  }

  /**
   * @function: draw
   * @description: 绘制坦克
   * @author: Banana
   */
  draw() {
    //TODO 拆分成部分组件
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
    ctx.closePath();

    translate_stack("pop");
    translate_stack("pop");

    // 炮弹 ---------------------
    translate_stack("push", [angle(90)], (a) => {
      ctx.rotate(a);
    });
    translate_stack("push", [this.cannon.x, this.cannon.y], (a, b) => {
      ctx.translate(a, b);
    });
    translate_stack("push", [-this.cannon.cannonball_angle], (a) => {
      ctx.rotate(a);
    });

    if (this.cannon.thread !== null) {
      ctx.beginPath();
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.strokeStyle = this.tank.color;
      ctx.moveTo(-2.5, 0);
      ctx.lineTo(2.5, 0);
      ctx.stroke();
      ctx.closePath();
    }
    translate_stack("pop");
    translate_stack("pop");
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

  run() {
    this.move();
    this.adjust_tank_direction();
    this.adjust_cannon_direction();
    this.adjust_radar_direction();
  }

  /**
   * @function: move
   * @description: 坦克移动
   * @author: Banana
   */
  move() {
    // 当前坦克行为不是移动，直接退出
    if (this.tank.action !== tank_action.tank_move) return;

    let [x_move, y_move] = this.compute_quadrant(
      this.tank.speed,
      this.tank.angle,
      this.tank.move_direction
    );

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
   * @description: tank初始位置作为原点，计算该 斜率和角度的 下一步移动的x和y值得改变
   * @param {*} speed 移动的速度
   * @param {*} angle 移动的角度
   * @param {*} direction 移动的方向 [front|back]
   * @return {Array} [x,y]
   * @author: Banana
   */
  compute_quadrant(speed, currentAngle, direction) {
    const k = Math.tan(currentAngle);

    let x = speed / k;
    let y = speed * k;

    // alert(`${k} | ${x} | ${y} | ${radian(currentAngle)}`);

    // 在tan 0时 可以把函数看作是y=0。则x趋近于∞，直接返回x轴的速率即可
    if (x == Infinity) [x, y] = [speed, 0];
    else {
      // 将移动速度限制在规定的速率之内
      while (Math.abs(x) >= speed || Math.abs(y) >= speed) {
        x = x / 2;
        y = y / 2;
      }

      if (currentAngle <= angle(90)) {
        y *= -1;
      } else if (currentAngle <= angle(180)) {
        // x *= -1;
        // y *= -1;
      } else if (currentAngle <= angle(270)) {
        x *= -1;
      } else if (currentAngle <= angle(360)) {
        x *= -1;
        y *= -1;
      }
    }

    // alert(`${x} | ${y}`);

    // console.log("this.tank.turn_direction :>> ", this.tank.move_direction);
    if (direction === tank_action.tank_move_direction.front) {
      return [x, y];
    } else if (direction === tank_action.tank_move_direction.back) {
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
    this.tank.move_direction = tank_action.tank_move_direction.back;
    let [x_move, y_move] = this.compute_quadrant(
      this.tank.speed,
      this.tank.angle,
      this.tank.move_direction
    );
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
    //! 命名与实际含义不符合
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
   * @function: get_tank_collision_volume
   * @description: 获取坦克碰撞体积, 获取目标坦克位置垂直函数，计算该函数的两个端点(需 format_position 后)
   * @param {*} x 目标坦克的x位置
   * @param {*} y 目标坦克的y位置
   * @param {*} collision_value 冲突值
   * @author: Banana
   */
  get_tank_collision_volume(x, y, collision_value) {
    // 计算两点之间的斜率
    const current_k = y / x;
    // 偏移量
    const offset_distance = window.game_canvas.average_length_width / 2;

    // 向原点移动一段距离
    // x = x > 0 ? x - offset_distance : x + offset_distance;
    // y = current_k * x;

    // 计算过该点而且垂直于当前斜率的函数的斜率 点(a,ak)  f(x)=-x/k + a(k+1/k)
    const left_y =
      x * (current_k + 1 / current_k) - (x - offset_distance) / current_k;
    const left_x = x * (Math.pow(current_k, 2) + 1) - current_k * left_y;

    const right_y =
      x * (current_k + 1 / current_k) - (x + offset_distance) / current_k;
    const right_x = x * (Math.pow(current_k, 2) + 1) - current_k * right_y;
    // alert(
    //   `x ${x}, y ${y}, left_x ${left_x}, left_y ${left_y}, right_x ${right_x}, right_y ${right_y}`
    // );
    return [left_x, left_y, right_x, right_y];
  }

  /**
   * @function: search_enemy
   * @description: 雷达开始搜索敌人
   * @param {*} radian
   * @return {Boolean}
   * @author: Banana
   */
  search_enemy(radian) {
    for (let [key, value] of window.tank_position) {
      // 排除自己的位置
      if (key === this.tank.color) continue;
      //TODO 敌友判断 | 跳过已经被摧毁的坦克

      const [x, y] = this.format_position(
        value[0],
        value[1],
        this.tank.x,
        this.tank.y
      );
      // 超越雷达范围直接退出
      const distance = Math.sqrt(x * x + y * y);
      if (distance > this.radar.largest_distance) continue;

      const k = Math.tan(radian).toFixed(2);
      const current_k = (y / x).toFixed(2); // 根据敌方坦克坐标和自身的坐标计算斜率

      // 判断雷达指向是否为敌方坦克所在的象限
      const current_radar_quadrant = this.determine_quadrant_by_radian(
        this.radar.angle
      );
      // 判断敌方坦克所在的象限
      const current_enemy_quadrant = this.determine_quadrant_by_position(x, y);

      console.log("current_radar_quadrant :>> ", current_radar_quadrant);

      //TODO 垂直情况未检测

      console.log(
        "radian(k) :>> ",
        current_radar_quadrant,
        current_enemy_quadrant,
        this.tank.color,
        (180 * Math.atan(k)) / Math.PI
      );
      // 水平情况
      if (
        this.check_quadrant_situation(
          current_radar_quadrant,
          current_enemy_quadrant
        ) &&
        parseFloat(k) + 0.29 >= current_k &&
        parseFloat(k) - 0.29 <= current_k
      ) {
        console.log(
          "radian(k) :>> ",
          current_radar_quadrant,
          current_enemy_quadrant,
          this.tank.color,
          (180 * Math.atan(k)) / Math.PI
        );
        this.launch_cannon();
        console.log(`${this.tank.color} : find you! => ${key}`);
        // return radian(this.radar.angle);
      }
    }
  }

  /**
   * @function: format_position
   * @description: 格式化目标位置的坐标，将自身位置设置为原点，其他的坦克转化成基于自身为原点的位置，O(xo,yo) ,a(xa,ya) new_xa = xa-xo,new_ya=yo-ya
   * @param {*} x 目标坦克的x位置
   * @param {*} y 目标坦克的y位置
   * @param {*} origin_x 作为原点x位置
   * @param {*} origin_y 作为原点y位置
   * @return {*} [x,y] 格式化后的坐标
   * @author: Banana
   */
  format_position(x, y, origin_x, origin_y) {
    return [x - origin_x, origin_y - y];
  }

  /**
   * @function: launch_cannon
   * @description: 发射炮弹
   * @return {*}
   * @author: Banana
   */
  launch_cannon() {
    // console.log('object :>> ', Date.now() - this.cannon.launch_time);

    if (Date.now() - this.cannon.launch_time >= this.cannon.reload_time) {
      clearInterval(this.cannon.thread);
      this.cannon.launch_time = Date.now();
      this.cannon.cannonball_angle = this.cannon.angle;
      this.cannon.distance = 0;
      this.cannon.x = 0;
      this.cannon.y = 0;
      this.cannon.thread = setInterval(() => {
        return this.cannon_move();
      }, 25);
    } // 两秒 炮弹冷却时间
  }

  /**
   * @function: cannon_move
   * @description: 炮弹移动
   * @return {*}
   * @author: Banana
   */
  cannon_move() {
    // console.log("object :>> ", this.cannon.x, this.cannon.y);
    let [x_move, y_move] = this.compute_quadrant(
      this.cannon.launch_speed,
      this.cannon.cannonball_angle,
      tank_action.tank_move_direction.front
    );
    this.cannon.x += x_move;
    this.cannon.y += y_move;
    // console.log("x_move,y_move :>> ", x_move, y_move);

    //TODO 碰撞检测

    for (let [key, value] of window.tank_position) {
      // 排除自己的位置
      if (key === this.tank.color) continue;

      // 炮弹坐标

      const real_cannon_x = this.cannon.x + this.tank.x;
      const real_cannon_y = this.cannon.y + this.tank.y;

      let [x, y] = this.format_position(
        value[0],
        value[1],
        real_cannon_x,
        real_cannon_y
      );

      if (x > 100 || y > 100) continue; // 若炮弹距离太远就之间跳过

      const [left_x, left_y, right_x, right_y] = this.get_tank_collision_volume(
        x,
        y
      );

      const real_left_x = left_x + real_cannon_x;
      const real_left_y = real_cannon_y - left_y;
      const real_right_x = right_x + real_cannon_x;
      const real_right_y = real_cannon_y - right_y;

      window.game_canvas.vision_position(real_left_x, real_left_y, "red");
      window.game_canvas.vision_position(real_right_x, real_right_y, "gold");
      window.game_canvas.vision_position(real_cannon_x, real_cannon_y, "black");

      // console.log(
      //   `炮弹(${real_cannon_x},${real_cannon_y}) \n
      //   左侧(${real_left_x},${real_left_y})
      //   \n右侧(${real_right_x},${real_right_y})`
      // );

      if (
        this.check_area_point(
          real_cannon_x,
          real_cannon_y,
          real_left_x,
          real_left_y,
          real_right_x,
          real_right_y
        )
      ) {
        //TODO 集中目标触发爆炸动画 & 取消绘制线程
        alert(this.tank.color + " 击中！=> " + key);
      }
      // alert(left_x, left_y, right_x, right_y);
    }
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
      else if (y == 0) return "+x";
    } else if (x < 0) {
      if (y > 0) return 2;
      else if (y < 0) return 3;
      else if (y == 0) return "-x";
    } else if (x == 0) {
      if (y > 0) return "+y";
      else if (y < 0) return "-y";
    }
  }

  /**
   * @function: check_quadrant_situation
   * @description: 检查雷达象限 与 敌方坦克的象限是否重合
   * @param {Number} radar_quadrant 雷达象限
   * @param {Number} enemy_quadrant 敌方坦克象限
   * @return {Boolean} 是否匹配
   * @author: Banana
   */
  check_quadrant_situation(radar_quadrant, enemy_quadrant) {
    if (radar_quadrant === enemy_quadrant) return true;
    else if (
      radar_quadrant === 1 &&
      (enemy_quadrant === "+x" || enemy_quadrant === "+y")
    )
      return true;
    else if (
      radar_quadrant === 2 &&
      (enemy_quadrant === "-x" || enemy_quadrant === "+y")
    )
      return true;
    else if (
      radar_quadrant === 3 &&
      (enemy_quadrant === "-x" || enemy_quadrant === "-y")
    )
      return true;
    else if (
      radar_quadrant === 4 &&
      (enemy_quadrant === "+x" || enemy_quadrant === "-y")
    )
      return true;

    return false;
  }

  /**
   * @function: determine_quadrant_by_position
   * @description: 检查坐标是否在范围内
   * @param {Number} check_x 检测点的x位置
   * @param {Number} check_y 检测点的y位置
   * @param {Number} area_left_x 区域左边端点的x位置
   * @param {Number} area_left_y 区域左边端点的y位置
   * @param {Number} area_right_x 区域右边端点的x位置
   * @param {Number} area_right_y 区域右边端点的y位置
   * @return {Boolean} 是否在范围内
   * @author: Banana
   */
  check_area_point(
    check_x,
    check_y,
    area_left_x,
    area_left_y,
    area_right_x,
    area_right_y
  ) {
    if (area_left_x > check_x || check_x > area_right_x) return false;

    const max_y = Math.max(area_left_y, area_right_y);
    const min_y = Math.min(area_left_y, area_right_y);
    if (min_y <= check_y && check_y <= max_y) return true;
    else return false;
  }
}
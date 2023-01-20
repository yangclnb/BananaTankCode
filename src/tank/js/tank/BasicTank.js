import { playBoom } from "../utils/ControlGIF.js";
import {
  map_faction_position,
  tank_action,
  tank_turn,
  action_mode,
  event_priority,
  tankState,
} from "../EnumObject.js";
import { angle, classify_radian, radian } from "../utils/utils.js";

window.tank_list = [];

export class Tank {
  action_queue = new Array(); // 行为队列
  execution_mode = action_mode.synchronous; // 默认动作从上到下顺序执行

  /**
   * @param {Number} x 横坐标
   * @param {Number} y 纵坐标
   * @param {Number} tank_angle 坦克角度
   * @param {Number} cannon_angle 炮塔角度
   * @param {String} tank_color 坦克颜色 [red, blue, yellow, green]
   * @param {Number} faction 队伍 [0，1，2，3]
   * @author: Banana
   */
  constructor(
    x,
    y,
    tank_angle,
    cannon_angle,
    radar_angle,
    tank_color,
    faction
  ) {
    this.faction = faction;

    console.log("Init " + tank_color);
    this.tank = {
      x: x + 23,
      y: y + 20,
      all_blood: 3,
      current_blood: 3,
      color: map_faction_position[tank_color] ? tank_color : "red_tank",
      angle: angle(tank_angle),
      action: tank_action.tank_move, // 坦克行为
      speed: 0.5, // 移动速度
      rotate_speed: angle(0.25), // 一帧调整坦克朝向0.25°
      turn_direction: tank_turn.left, // 下次坦克的转向
      move_direction: tank_action.tank_move_direction.front, // 坦克移动方向
    };

    this.cannon = {
      x: 0,
      y: 0,
      launch_x: 0,
      launch_y: 0,
      reload_time: 3000, // 装填所需时间 (毫秒)
      distance: 0, // 初始化炮弹移动的距离
      cannonball_angle: 0, // 炮弹发射时的斜率
      angle: angle(cannon_angle), //炮管的指向角度
      rotate_state: true, // 是否允许炮口旋转
      launch_speed: 15, // 最大炮弹速
      rotate_speed: angle(0.5), // 一帧旋转炮塔0.5°
      turn_direction: tank_turn.left, // 下次炮管的转向
      launch_time: 0, // 上次发射时间
      thread: null, // 炮弹移动线程
    };

    this.radar = {
      angle: angle(radar_angle),
      rotate_state: true, // 是否允许雷达旋转
      rotate_speed: angle(1), // 一帧雷达扫描1°
      turn_direction: tank_turn.left, // 下次雷达的转向
      largest_distance: window.game_canvas.square_width * 9, // 最远扫描距离 九个单位
      darw_radar: true,
    };

    this.current_show_text = "";

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
    //TODO 拆分成部分组件
    const canvas = window.game_canvas.canvas;
    const translate_stack = window.game_canvas.translate_stack();
    const ctx = window.game_canvas.ctx;
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;

    // 炮弹 ---------------------
    //! 不能依靠坦克本身的坐标作为绘制依据
    translate_stack(
      "push",
      [this.cannon.launch_x, this.cannon.launch_y],
      (a, b) => {
        ctx.translate(a, b);
      }
    );
    // 初始角度调整为 y=kx 与 x 轴正方向的夹角
    translate_stack("push", [-angle(90)], (a) => {
      ctx.rotate(a);
    });
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
      ctx.lineWidth = 5;
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
    translate_stack("pop");
    translate_stack("pop");
    translate_stack("pop");

    // console.log("square width and height:>> ", square_width, square_height);
    ctx.beginPath();

    translate_stack("push", [this.tank.x, this.tank.y], (a, b) => {
      ctx.translate(a, b);
    });

    // 初始角度调整为 y=kx 与 x 轴正方向的夹角
    translate_stack("push", [-angle(90)], (a) => {
      ctx.rotate(a);
    });

    // 显示文字 ------------------------

    translate_stack("push", [angle(90)], (a) => {
      ctx.rotate(a);
    });
    ctx.direction = "ltr"; // 文本方向从左向右
    ctx.font = "15px serif"; // 设置文案大小和字体
    ctx.textAlign = "center";
    ctx.fillStyle = "#D8DFEA";
    ctx.lineCap = "round";
    ctx.fillText(this.current_show_text, 0, -40);
    translate_stack("pop");

    // 绘制血条 -------------------------
    const blood =
      (this.tank.current_blood / this.tank.all_blood) * square_width;
    if (blood !== 0) {
      translate_stack("push", [30, -17], (a, b) => {
        ctx.translate(a, b);
      });
      ctx.moveTo(0, 0);
      ctx.lineTo(0, blood);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "green";
      ctx.stroke();
      translate_stack("pop");
    }

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

    if (this.radar.darw_radar) {
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
    }

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
   * @return {Number} 当前移动的速度
   * @author: Banana
   */
  move() {
    // console.log("angle :>> ",this.tank, classify_radian(radian(this.tank.angle)));
    let [x_move, y_move] = this.check_hit_wall();
    this.tank.x += x_move;
    this.tank.y += y_move;
    // 全局更新坦克坐标
    window.tank_position.set(this.tank.color, this.get_current_position());

    return this.tank.speed;
  }

  /**
   * @function: check_hit_wall
   * @description: 撞墙检测，未碰撞到墙体 x,y 位置改变，否则返回触发撞墙回调函数
   * @return {List} [x_move,y_move] x移动的距离，y移动的距离
   * @author: Banana
   */
  check_hit_wall() {
    let [x_move, y_move] = this.compute_quadrant(
      this.tank.speed,
      this.tank.angle,
      this.tank.move_direction
    );
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;
    const canvas_width = window.game_canvas.canvas.width;
    const canvas_height = window.game_canvas.canvas.height;
    if (
      this.tank.x >= square_width / 2 &&
      this.tank.x <= canvas_width - square_width / 2
    ) {
      // this.tank.x += x_move;
    } else {
      this.tank.x -= x_move; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.on_hit_wall.operation("x");
      return [0, 0];
    }

    if (
      this.tank.y >= square_height / 2 &&
      this.tank.y <= canvas_height - square_height / 2
    ) {
      // this.tank.y += y_move;
    } else {
      this.tank.y -= y_move; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.on_hit_wall.operation("y");
      return [0, 0];
    }
    return [x_move, y_move];
  }

  /**
   * @function: show_text
   * @description: 说垃圾话，在坦克正上方顶绘制，垃圾话显示时间默认两秒
   * @author: Banana
   */
  show_text(text, delay = 2000) {
    this.current_show_text = text;
    setTimeout(() => {
      this.current_show_text = "";
    }, delay);
  }

  /**
   * @function: adjust_tank_direction
   * @description: 根据类中的 turn 参数，调整自身的方向
   * @author: Banana
   */
  adjust_tank_direction() {
    // 判断顺逆时针旋转
    this.tank.angle =
      this.tank.turn_direction === 0
        ? this.tank.angle + this.tank.rotate_speed
        : this.tank.angle - this.tank.rotate_speed;

    this.tank.angle = classify_radian(this.tank.angle);
    return this.tank.rotate_speed;
  }

  /**
   * @function: adjust_cannon_direction
   * @description: 调整炮口角度
   * @author: Banana
   */
  adjust_cannon_direction() {
    // 判断顺逆时针旋转
    this.cannon.angle =
      this.cannon.turn_direction === 0
        ? this.cannon.angle + this.cannon.rotate_speed
        : this.cannon.angle - this.cannon.rotate_speed;

    this.cannon.angle = classify_radian(this.cannon.angle);
    return this.cannon.rotate_speed;
  }

  /**
   * @function: adjust_radar_direction
   * @description: 调整雷达角度
   * @return {*}
   * @author: Banana
   */
  adjust_radar_direction() {
    // 判断顺逆时针旋转
    this.radar.angle =
      this.radar.turn_direction === 0
        ? this.radar.angle + this.radar.rotate_speed
        : this.radar.angle - this.radar.rotate_speed;

    this.radar.angle = classify_radian(this.radar.angle);

    this.search_enemy(this.radar.angle);
    return this.radar.rotate_speed;
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

    let y = speed * k;
    let x = y / k;

    // console.log(`${k} | ${x} | ${y} | ${radian(currentAngle)}`);

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
        x *= -1;
        // y *= -1;
      } else if (currentAngle <= angle(270)) {
        x *= -1;
      } else if (currentAngle <= angle(360)) {
        // x *= -1;
        y *= -1;
      }
    }

    // console.log(`${x} | ${y}`);

    // console.log("this.tank.turn_direction :>> ", this.tank.move_direction);
    if (direction === tank_action.tank_move_direction.front) {
      return [x, y];
    } else if (direction === tank_action.tank_move_direction.back) {
      return [-x, -y];
    }
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
    let left_y, left_x, right_x, right_y;
    // 偏移量
    const offset_distance = window.game_canvas.average_length_width / 2;

    // y = 0 情况下单独计算
    if (y === 0) {
      return [
        x - offset_distance,
        offset_distance,
        x + offset_distance,
        -offset_distance,
      ];
    }

    const current_k = y / x;

    if (Math.abs(current_k) >= 1) {
      // 计算两点之间的斜率，当 斜率绝对值>=1 时，其垂线函数两端取值范围取 x+-offset_distance
      left_y =
        x * (current_k + 1 / current_k) - (x - offset_distance) / current_k;
      left_x = x * (Math.pow(current_k, 2) + 1) - current_k * left_y;

      right_y =
        x * (current_k + 1 / current_k) - (x + offset_distance) / current_k;
      right_x = x * (Math.pow(current_k, 2) + 1) - current_k * right_y;
    } else {
      // 反之 y+-offset_distance
      left_x =
        x * (Math.pow(current_k, 2) + 1) - current_k * (y + offset_distance);
      left_y = x * (current_k + 1 / current_k) - left_x / current_k;

      right_x =
        x * (Math.pow(current_k, 2) + 1) - current_k * (y - offset_distance);
      right_y = x * (current_k + 1 / current_k) - right_x / current_k;
    }

    // 计算过该点而且垂直于当前斜率的函数的斜率 点(a,ak)  f(x)=-x/k + a(k+1/k)
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

      // console.log("current_radar_quadrant :>> ", current_radar_quadrant);

      //TODO 垂直情况未检测

      // console.log(
      //   "radian(k) :>> ",
      //   current_radar_quadrant,
      //   current_enemy_quadrant,
      //   this.tank.color,
      //   (180 * Math.atan(k)) / Math.PI
      // );
      if (
        this.check_quadrant_situation(
          current_radar_quadrant,
          current_enemy_quadrant
        ) &&
        parseFloat(k) + 0.29 >= current_k &&
        parseFloat(k) - 0.29 <= current_k
      ) {
        console.log(`${this.tank.color} : find you! => ${key}`);

        const enemy_angle = this.get_angle_slope_position(current_k, x, y);

        // 只有队列中不存在，发现敌人后尚未执行完毕的行为时，才再次添加该行为
        const current_behaviour = this.current_behavior_execution(
          event_priority.scannedRobot
        );
        if (current_behaviour === undefined) {
          this.on_scanned_robot.operation(enemy_angle);
          this.stop_scan();
        }
      }
    }
  }

  get_angle_slope_position(k, x, y) {
    console.log("k,x,y :>> ", k, x, y);
    // 根据斜率计算敌方角度
    const enemy_angle1 = parseFloat(
      ((180 * classify_radian(Math.atan(k))) / Math.PI).toFixed(2)
    );
    console.log("enemy_angle1 :>> ", enemy_angle1);
    let enemy_angle2;

    if (enemy_angle1 >= 180) enemy_angle2 = enemy_angle1 - 180;
    else enemy_angle2 = 180 + enemy_angle1;
    console.log("enemy_angle1,enemy_angle2 :>> ", enemy_angle1, enemy_angle2);

    const quadrant = this.determine_quadrant_by_position(x, y);
    // console.log(`角度有 ${enemy_angle1} , ${enemy_angle2} 两种可能，由于敌方坦克处于${quadrant}象限`);
    if (quadrant === 1 || quadrant === 2)
      return Math.min(enemy_angle1, enemy_angle2);
    else if (quadrant === 3 || quadrant === 4)
      return Math.max(enemy_angle1, enemy_angle2);
    else if (quadrant === "+x") return 0;
    else if (quadrant === "+y") return 90;
    else if (quadrant === "-x") return 180;
    else if (quadrant === "-y") return 270;
  }

  // 停止雷达扫描
  stop_scan() {
    // console.log(this.action_queue)
    const action_index = this.action_queue.findIndex(
      (item) =>
        item.function === "adjust_radar_direction" &&
        item.execute_state === true
    );
    this.action_queue[action_index].execute_state = false;
    // console.log("this.action_queues :>> ", JSON.stringify(this.action_queue));
    // this.action_queue.splice(action_index, 1);
  }

  // 继续线程中未完成的雷达扫描
  continual_scan() {
    const action = this.action_queue.find(
      (item) =>
        item.function === "adjust_radar_direction" &&
        item.execute_state === false
    );
    action.execute_state = true;
    // console.log("action :>> ", action);
  }

  // 初始化运行
  run = {
    // 正常运行时操作
    operation() {},

    // 重复循环执行函数
    loop: function () {
      // 重复执行的动作
    },
    // 说垃圾话
    say: (text) => {
      this.organize_queue({
        already_implemented: 0,
        function: "show_text",
        argu: 1,
        text,
        priority: event_priority.run,
        callback: null,
      });
    },

    // 坦克前进（前进位置）
    ahead: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: move_distance,
        priority: event_priority.run,
        callback,
      });
    },

    // 坦克后退
    back: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: -move_distance,
        priority: event_priority.run,
        callback,
      });
    },

    // 坦克旋转 正值👈 | 负值👉
    tank_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_tank_direction",
        argu: turn_angle,
        priority: event_priority.run,
        callback,
      });
    },

    // 炮口旋转
    cannon_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_cannon_direction",
        argu: turn_angle,
        priority: event_priority.run,
        callback,
      });
    },

    // 雷达旋转
    radar_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_radar_direction",
        argu: turn_angle,
        priority: event_priority.run,
        callback,
      });
    },

    // 开火
    fire: (callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "launch_cannon",
        argu: 1,
        priority: event_priority.run,
        callback,
      });
    },
    // 调整为同步模式
    synchronous_mode: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "synchronous",
        argu: 1,
        priority: event_priority.run,
        callback: null,
      });
    },
    // 调整为异步模式
    asynchronous_mode: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "asynchronous",
        argu: 1,
        priority: event_priority.run,
        callback: null,
      });
    },
  };

  // 发现敌人时调用
  on_scanned_robot = {
    //! 水平方向发现敌人 炮弹射反了
    // enemy_angle 敌人的角度
    operation(enemy_angle) {
      // console.log(
      //   "炮弹装填所需时间，当前还需装填时间 :>> ",
      //   this.get_cannnon_reload_time(),
      //   Date.now() - this.get_last_launch_time()
      // );
      if (
        this.get_cannnon_reload_time() <=
        Date.now() - this.get_last_launch_time()
      ) {
        this.say("我发现你了~");
        const cannon_angle = this.get_current_cannon_angle();
        console.log("enemy_angle,cannon_angle :>> ", enemy_angle, cannon_angle);
        // this.cannon_turn(70);
        this.cannon_turn(enemy_angle - cannon_angle);
        this.fire();
        console.log(
          "this.action_queues :>> ",
          JSON.stringify(this.action_queue)
        );
      }
      this.continual_scan();
    },
    // 返回当前炮管的角度
    get_current_cannon_angle: () => {
      return radian(this.cannon.angle);
    },

    // 返回当前雷达的角度
    get_current_radar_angle: () => {
      return radian(this.radar.angle);
    },

    // 获取最近一次 炮弹 发射的事件
    get_last_launch_time: () => {
      return this.cannon.launch_time;
    },

    // 获取炮弹装填事件
    get_cannnon_reload_time: () => {
      return this.cannon.reload_time;
    },

    // 说垃圾话
    say: (text) => {
      this.organize_queue({
        already_implemented: 0,
        function: "show_text",
        argu: 1,
        text,
        priority: event_priority.scannedRobot,
        callback: null,
      });
    },

    // 坦克前进（前进位置）
    ahead: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: move_distance,
        priority: event_priority.scannedRobot,
        callback,
      });
    },

    // 坦克后退
    back: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: -move_distance,
        priority: event_priority.scannedRobot,
        callback,
      });
    },

    // 坦克旋转 正值👈 | 负值👉
    tank_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_tank_direction",
        argu: turn_angle,
        priority: event_priority.scannedRobot,
        callback,
      });
    },

    // 炮口旋转
    cannon_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_cannon_direction",
        argu: turn_angle,
        priority: event_priority.scannedRobot,
        callback,
      });
    },

    // 雷达旋转
    radar_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_radar_direction",
        argu: turn_angle,
        priority: event_priority.scannedRobot,
        callback,
      });
    },

    // 开火
    fire: (callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "launch_cannon",
        argu: 1,
        priority: event_priority.scannedRobot,
        callback,
      });
    },
    // 停止雷达扫描
    stop_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "stop_scan",
        argu: 1,
        priority: event_priority.scannedRobot,
        callback: null,
      });
      // this.action_queue.splice(action_index, 1);
    },

    // 继续线程中的雷达扫描
    continual_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "continual_scan",
        argu: 1,
        priority: event_priority.scannedRobot,
        callback: null,
      });
      // this.action_queue[action_index].execute_state = true;
    },
  };

  // 撞墙触发
  on_hit_wall = {
    operation(hit_axis) {
      this.say("怎么撞墙了!");
      this.back(5);
      this.tank_turn(45);
      this.ahead(30);
    },
    get_current_cannon_angle: () => {
      return radian(this.cannon.angle);
    },

    // 返回当前雷达的角度
    get_current_radar_angle: () => {
      return radian(this.radar.angle);
    },

    // 获取最近一次 炮弹 发射的事件
    get_last_launch_time: () => {
      return this.cannon.launch_time;
    },

    // 获取炮弹装填事件
    get_cannnon_reload_time: () => {
      return this.cannon.reload_time;
    },

    // 说垃圾话
    say: (text) => {
      this.organize_queue({
        already_implemented: 0,
        function: "show_text",
        argu: 1,
        text,
        priority: event_priority.hitWall,
        callback: null,
      });
    },

    // 坦克前进（前进位置）
    ahead: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: move_distance,
        priority: event_priority.hitWall,
        callback,
      });
    },

    // 坦克后退
    back: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: -move_distance,
        priority: event_priority.hitWall,
        callback,
      });
    },

    // 坦克旋转 正值👈 | 负值👉
    tank_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_tank_direction",
        argu: turn_angle,
        priority: event_priority.hitWall,
        callback,
      });
    },

    // 炮口旋转
    cannon_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_cannon_direction",
        argu: turn_angle,
        priority: event_priority.hitWall,
        callback,
      });
    },

    // 雷达旋转
    radar_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_radar_direction",
        argu: turn_angle,
        priority: event_priority.hitWall,
        callback,
      });
    },

    // 开火
    fire: (callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "launch_cannon",
        argu: 1,
        priority: event_priority.hitWall,
        callback,
      });
    },
    // 停止雷达扫描
    stop_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "stop_scan",
        argu: 1,
        priority: event_priority.hitWall,
        callback: null,
      });
      // this.action_queue.splice(action_index, 1);
    },

    // 继续线程中的雷达扫描
    continual_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "continual_scan",
        argu: 1,
        priority: event_priority.hitWall,
        callback: null,
      });
      // this.action_queue[action_index].execute_state = true;
    },
  };

  // 被击中触发
  on_hit_by_bullet = {
    operation() {
      this.say("捏麻麻滴!");
    },
    get_current_cannon_angle: () => {
      return radian(this.cannon.angle);
    },

    // 返回当前雷达的角度
    get_current_radar_angle: () => {
      return radian(this.radar.angle);
    },

    // 获取最近一次 炮弹 发射的事件
    get_last_launch_time: () => {
      return this.cannon.launch_time;
    },

    // 获取炮弹装填事件
    get_cannnon_reload_time: () => {
      return this.cannon.reload_time;
    },

    // 说垃圾话
    say: (text) => {
      this.organize_queue({
        already_implemented: 0,
        function: "show_text",
        argu: 1,
        text,
        priority: event_priority.hitByBullet,
        callback: null,
      });
    },

    // 坦克前进（前进位置）
    ahead: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: move_distance,
        priority: event_priority.hitByBullet,
        callback,
      });
    },

    // 坦克后退
    back: (move_distance, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "move",
        argu: -move_distance,
        priority: event_priority.hitByBullet,
        callback,
      });
    },

    // 坦克旋转 正值👈 | 负值👉
    tank_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_tank_direction",
        argu: turn_angle,
        priority: event_priority.hitByBullet,
        callback,
      });
    },

    // 炮口旋转
    cannon_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_cannon_direction",
        argu: turn_angle,
        priority: event_priority.hitByBullet,
        callback,
      });
    },

    // 雷达旋转
    radar_turn: (turn_angle, callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "adjust_radar_direction",
        argu: turn_angle,
        priority: event_priority.hitByBullet,
        callback,
      });
    },

    // 开火
    fire: (callback) => {
      this.organize_queue({
        already_implemented: 0,
        function: "launch_cannon",
        argu: 1,
        priority: event_priority.hitByBullet,
        callback,
      });
    },
    // 停止雷达扫描
    stop_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "stop_scan",
        argu: 1,
        priority: event_priority.hitByBullet,
        callback: null,
      });
      // this.action_queue.splice(action_index, 1);
    },

    // 继续线程中的雷达扫描
    continual_scan: () => {
      this.organize_queue({
        already_implemented: 0,
        function: "continual_scan",
        argu: 1,
        priority: event_priority.hitByBullet,
        callback: null,
      });
      // this.action_queue[action_index].execute_state = true;
    },
  };

  // 检测当前行为执行的情况 (从行为队列中检测该优先级的行为是否还存在)
  current_behavior_execution(priority) {
    return this.action_queue.find((item) => item.priority === priority);
  }

  // 根据当前行为的优先级，插入动作队列的不同位置
  organize_queue(action) {
    // 执行状态 true:正常执行 false:暂时不执行
    action.execute_state = true;
    if (this.action_queue.length === 0) {
      this.action_queue.push(action);
      return;
    }

    let current_index = 0;
    for (const action_item of this.action_queue) {
      if (action_item.priority >= action.priority) {
        ++current_index;
      }
    }

    // 若当前索引指向队尾元素，需要在队尾+1处插入
    current_index =
      this.action_queue.length === current_index
        ? current_index + 1
        : current_index;

    this.action_queue.splice(current_index, 0, action);
    // console.log(`插入位置${current_index}`);
    // console.log(JSON.stringify(this.action_queue));
  }

  // 执行当前队列的操作
  implement_current_operation() {
    if (this.execution_mode === action_mode.synchronous)
      this.synchronous_operation();
    else if (this.execution_mode === action_mode.asynchronous)
      this.asynchronous_operation();
  }

  // 执行同步操作
  synchronous_operation() {
    if (this.action_queue.length === 0) return;
    let operation = this.action_queue[0];
    let current_index = 0;
    // console.log("this.action_queues :>> ", JSON.stringify(this.action_queue));

    // 检测当前行为的执行状态，若为false跳转到下一个
    while (
      current_index < this.action_queue.length &&
      operation.execute_state === false
    ) {
      operation = this.action_queue[++current_index];
    }

    this.operation_action(operation, current_index);
  }

  // 执行异步操作
  // 行走 旋转 可以同时进行
  asynchronous_operation() {
    let current_index = 0;
    // 可以同步进行的操作
    let record_operation = {
      move: false,
      adjust_tank_direction: false,
      adjust_cannon_direction: false,
      adjust_radar_direction: false,
    };
    // 只执行和当前队首优先级相同的动作
    let execute_priority = 1;

    // console.log("this.action_queues :>> ", JSON.stringify(this.action_queue));

    for (const operation of this.action_queue) {
      // 确定队首优先级
      if (current_index === 0) execute_priority = operation.priority;

      // 检测当前行为的执行状态，若为false跳转到下一个
      if (operation.execute_state === false) {
        current_index++;
        continue;
      }

      // 若队首为不可同步执行的动作，执行该动作并且退出函数
      if (
        current_index === 0 &&
        record_operation[operation.function] === undefined
      ) {
        this.operation_action(operation, current_index);
        return;
      } else if (
        record_operation[operation.function] === false &&
        execute_priority === operation.priority
      ) {
        this.operation_action(operation, current_index);
        record_operation[operation.function] = true;
      } else if (record_operation[operation.function] === undefined) {
        return;
      }

      current_index++;
    }
  }

  // 执行当前的操作
  operation_action(operation, current_index) {
    // 若当前队列除 执行状态false 的行为外不存在其他行为，直接退出
    if (operation === undefined) return;

    // 若 当前队首的 (已经操作数量) 大于 (预计执行的数量) 将队首出队并且重新执行该函数
    if (Math.abs(operation.already_implemented) >= Math.abs(operation.argu)) {
      // console.log("当前行为的索引 :>> ", current_index);
      this.action_queue.splice(current_index, 1);

      // 仅当当作为空 或 仅存才execute_state 为 false 的动作时才添加循环动作
      if (this.action_queue.length === 0) {
        this.run.loop();
        return this.implement_current_operation();
      }

      // this.action_queue.shift();
      // TODO 将回调函数的内容置于队首
      return this.implement_current_operation();
    }

    // console.log("当前执行的动作 :>> ", operation);

    if (operation.function === "move") {
      this.check_move_direction(operation.argu);
      operation.already_implemented += this.move();
    } else if (operation.function === "adjust_tank_direction") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjust_tank_direction());
    } else if (operation.function === "adjust_cannon_direction") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjust_cannon_direction());
    } else if (operation.function === "adjust_radar_direction") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjust_radar_direction());
    } else if (operation.function === "launch_cannon") {
      this.launch_cannon();
      operation.already_implemented += 1;
    } else if (operation.function === "continual_scan") {
      this.continual_scan();
      operation.already_implemented += 1;
    } else if (operation.function === "show_text") {
      this.show_text(operation.text);
      operation.already_implemented += 1;
    } else if (operation.function === "synchronous") {
      this.synchronous_mode();
      operation.already_implemented += 1;
    } else if (operation.function === "asynchronous") {
      this.asynchronous_mode();
      operation.already_implemented += 1;
    }
  }

  // 检测移动的方向
  check_move_direction(number) {
    if (number >= 0)
      this.tank.move_direction = tank_action.tank_move_direction.front;
    else this.tank.move_direction = tank_action.tank_move_direction.back;
  }

  // 检测当前操作的移动方向
  check_turn_direction(operation) {
    // 匹配需要操作的对象
    const operation_obejct = operation.function.split("_")[1];
    if (operation.argu >= 0)
      eval("this." + operation_obejct).turn_direction = tank_turn.left;
    else eval("this." + operation_obejct).turn_direction = tank_turn.right;
  }

  // 切换为同步执行模式
  synchronous_mode() {
    this.execution_mode = action_mode.synchronous;
  }
  // 切换为异步执行模式
  asynchronous_mode() {
    this.execution_mode = action_mode.asynchronous;
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
      this.cannon.launch_x = this.tank.x;
      this.cannon.launch_y = this.tank.y;
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

    // 超过屏幕范围清空线程
    if (
      this.cannon.x > window.game_canvas.width ||
      this.cannon.y > window.game_canvas.height
    ) {
      clearInterval(this.cannon.thread);
      this.cannon.thread = null;
    }

    for (let [key, value] of window.tank_position) {
      // 排除自己的位置
      if (key === this.tank.color) continue;

      // 炮弹坐标

      const origin_cannon_x = this.cannon.launch_x;
      const origin_cannon_y = this.cannon.launch_y;
      const current_cannon_x = this.cannon.x + this.tank.x;
      const current_cannon_y = this.cannon.y + this.tank.y;

      // console.log("object :>> ", origin_cannon_x, origin_cannon_y);
      // console.log("object :>> ", current_cannon_x, current_cannon_y);

      let [x, y] = this.format_position(
        value[0],
        value[1],
        origin_cannon_x,
        origin_cannon_y
      );

      // 若炮弹距离太远就之间跳过
      // if (Math.abs(x) > 50 || Math.abs(y) > 50) continue;

      // console.log("敌方坦克位置 :>> ", x, y);

      const [left_x, left_y, right_x, right_y] = this.get_tank_collision_volume(
        x,
        y
      );

      const real_left_x = left_x + origin_cannon_x;
      const real_left_y = origin_cannon_y - left_y;
      const real_right_x = right_x + origin_cannon_x;
      const real_right_y = origin_cannon_y - right_y;

      // window.game_canvas.vision_position(real_left_x, real_left_y, "red");
      // window.game_canvas.vision_position(real_right_x, real_right_y, "gold");
      // window.game_canvas.vision_position(
      //   origin_cannon_x,
      //   origin_cannon_y,
      //   "black"
      // );

      // console.log(
      //   `炮弹(${origin_cannon_x},${origin_cannon_y}) \n
      //   左侧(${real_left_x},${real_left_y})
      //   \n右侧(${real_right_x},${real_right_y})`
      // );

      if (
        this.check_area_point(
          current_cannon_x,
          current_cannon_y,
          real_left_x,
          real_left_y,
          real_right_x,
          real_right_y
        )
      ) {
        console.log(this.tank.color + " 击中！=> " + key);
        // 若是用户的坦克反馈战绩
        if (window.userTank && window.userTank.color === this.tank.color)
          window.userTank.hitNumber++;

        this.hit_tank(key);
        clearInterval(this.cannon.thread);
        this.cannon.thread = null;
      }
      // alert(left_x, left_y, right_x, right_y);
    }
  }

  /**
   * @function: hit_tank
   * @description: 击中坦克
   * @return {*}
   * @author: Banana
   */
  hit_tank(tank_color) {
    for (const tank_item of window.tank_list) {
      if (tank_item.tank.color == tank_color) {
        // 触发爆炸动画
        playBoom(tank_item.tank.x, tank_item.tank.y);
        tank_item.get_hit();
        return;
      }
    }
  }

  /**
   * @function: get_hit
   * @description: 坦克被击中
   * @return {*}
   * @author: Banana
   */
  get_hit() {
    // TODO 无敌时间
    this.on_hit_by_bullet.operation();
    if (this.tank.current_blood > 1) this.tank.current_blood--;
    else this.death();
  }

  /**
   * @function: death
   * @description: 坦克被摧毁
   * @return {*}
   * @author: Banana
   */
  death() {
    this.tank.current_blood--;

    // 从坦克队列中去除
    let index = 0;
    for (const tank_item of window.tank_list) {
      if (tank_item.tank.color == this.tank.color) {
        window.tank_list.splice(index, 1);
        break;
      }
      index++;
    }

    // 若被摧毁的是用户的坦克，直接结束游戏
    if (window.userTank && this.tank.color === window.userTank.color) {
      window.userTank.state = tankState.fail;
      window.userTank.serviveTime = Date.now() - window.userTank.serviveTime;
    } else if (
      window.tank_list.length === 1 &&
      window.tank_list[0].tank.color === window.userTank.color
    ) {
      window.userTank.state = tankState.victory;
      window.userTank.serviveTime = Date.now() - window.userTank.serviveTime;
    }

    // console.log("window.tank_list :>> ", window.tank_list);
    // 从位置信息中去除
    window.tank_position.delete(this.tank.color);
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
    // if (area_left_x > check_x || check_x > area_right_x) return false;

    // const max_y = Math.max(area_left_y, area_right_y);
    // const min_y = Math.min(area_left_y, area_right_y);
    // if (min_y <= check_y && check_y <= max_y) return true;
    // else return false;
    const offset_distance = window.game_canvas.average_length_width / 2;

    // 检查左右区间的位置情况，判断击中检测是以x还是y + offset_distance
    if (
      Math.abs(area_left_x - area_right_x) >
      Math.abs(area_left_y - area_right_y)
    ) {
      if (
        Math.min(area_left_x, area_right_x) <= check_x &&
        check_x <= Math.max(area_left_x, area_right_x) &&
        Math.min(area_left_y, area_right_y) <= check_y &&
        check_y <= Math.min(area_left_y, area_right_y) + offset_distance
      ) {
        return true;
      }
    } else {
      if (
        Math.min(area_left_y, area_right_y) <= check_y &&
        check_y <= Math.max(area_left_y, area_right_y) &&
        Math.min(area_left_x, area_right_x) <= check_x &&
        check_x <= Math.min(area_left_x, area_right_x) + offset_distance
      ) {
        return true;
      }
    }
    return false;
  }
}

// 添加坦克
export function addTank(newTank) {
  window.tank_list.push(newTank);
}

// 初始化坦克列表
export function initTankList() {
  window.tank_list = [];
}

// window.userTank = {
//   color: "red",
//   hitNumber: 0,
//   serviveTime: 35283,
//   state: "FAIL",
// };

// 判断是否胜利
export function checkResult() {
  if (!window.userTank) return;

  // console.log("window.tank_list :>> ", window.tank_list);

  // 判断用户的坦克是否为 胜利或失败 的状态
  if (
    window.userTank.state === tankState.fail ||
    window.userTank.state === tankState.victory
  ) {
    initTankList();
    window.game_canvas.settlementPage(window.userTank);
    console.log("object :>> ", window.userTank);
    window.userTank = undefined;
  }
}

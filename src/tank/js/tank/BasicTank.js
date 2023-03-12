import { GIF } from "../utils/ControlGIF.js";
import {
  map_faction_position,
  tank_action,
  tank_turn,
  action_mode,
  event_priority,
  tankState,
} from "../EnumObject.js";
import { angle, classify_radian, radian } from "../utils/utils.js";
import { tankList, canvas, initTankList } from "../../main.js";
import { threadPool } from "@/tank/js/tank/ThreadPool.js";

export class Tank {
  action_queue = new Array(); // 行为队列
  execution_mode = action_mode.synchronous; // 默认动作从上到下顺序执行

  /**
   * @param {Number} x 横坐标
   * @param {Number} y 纵坐标
   * @param {Number} tank_angle 坦克角度
   * @param {Number} cannon_angle 炮塔角度
   * @param {String} tank_color 坦克颜色 [red, blue, yellow, green]
   * @param {Number} id 队伍 [0，1，2，3]
   * @author: Banana
   */
  constructor(x, y, tank_angle, cannon_angle, radar_angle, tank_color, id) {
    this.id = id;

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
      largest_distance: canvas.square_width * 8.5, // 最远扫描距离 九个单位
      enemyPosition: null,
      darw_radar: true,
    };

    this.loopAction = false;
    this.current_showText = "";

    this.draw();
  }

  /**
   * @function: draw
   * @description: 绘制坦克
   * @author: Banana
   */
  draw() {
    const square_width = canvas.square_width;

    canvas.render.bullet(this.cannon);

    canvas.render.tank(this.tank);

    canvas.render.text(this.current_showText, this.tank.x, this.tank.y);

    const blood =
      (this.tank.current_blood / this.tank.all_blood) * square_width;
    canvas.render.blood(blood, this.tank.x, this.tank.y);

    canvas.render.radar(
      this.radar.angle,
      this.radar.largest_distance,
      this.tank.x,
      this.tank.y,
      this.radar.darw_radar
    );

    canvas.render.cannon(this.cannon.angle, this.tank.x, this.tank.y);
  }

  /**
   * @function: move
   * @description: 坦克移动
   * @return {Number} 当前移动的速度
   * @author: Banana
   */
  move() {
    let [x_move, y_move] = this.check_hit_wall();
    this.tank.x += x_move;
    this.tank.y += y_move;
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
    const square_width = canvas.square_width;
    const square_height = canvas.square_height;
    const canvas_width = canvas.canvas.width;
    const canvas_height = canvas.canvas.height;

    // 触碰左侧边界
    if (this.tank.x <= square_width / 2) {
      this.tank.x += this.tank.speed; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.actionPackaging(this.onHitWall, event_priority.hitWall);
      // this.on_hit_wall.operation("x");
      return [0, 0];
    }

    // 触碰右侧边界
    if (this.tank.x >= canvas_width - square_width / 2) {
      this.tank.x -= this.tank.speed; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.actionPackaging(this.onHitWall, event_priority.hitWall);
      // this.on_hit_wall.operation("x");
      return [0, 0];
    }

    // 触碰顶部边界
    if (this.tank.y <= square_height / 2) {
      this.tank.y += this.tank.speed; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.actionPackaging(this.onHitWall, event_priority.hitWall);
      // this.on_hit_wall.operation("y");
      return [0, 0];
    }

    // 触碰底部边界

    if (this.tank.y >= canvas_height - square_height / 2) {
      this.tank.y -= this.tank.speed; //撞击后反方向倒退
      this.current_behavior_execution(event_priority.hitWall) === undefined &&
        this.actionPackaging(this.onHitWall, event_priority.hitWall);
      // this.on_hit_wall.operation("y");
      return [0, 0];
    }

    return [x_move, y_move];
  }

  /**
   * @function: showText
   * @description: 说垃圾话，在坦克正上方顶绘制，垃圾话显示时间默认两秒
   * @author: Banana
   */
  showText(text, delay = 2000) {
    this.current_showText = text;
    setTimeout(() => {
      this.current_showText = "";
    }, delay);
  }

  /**
   * @function: adjustTankDirection
   * @description: 根据类中的 turn 参数，调整自身的方向
   * @author: Banana
   */
  adjustTankDirection() {
    // 判断顺逆时针旋转
    this.tank.angle =
      this.tank.turn_direction === 0
        ? this.tank.angle + this.tank.rotate_speed
        : this.tank.angle - this.tank.rotate_speed;

    this.tank.angle = classify_radian(this.tank.angle);
    return this.tank.rotate_speed;
  }

  /**
   * @function: adjustCannonDirection
   * @description: 调整炮口角度
   * @author: Banana
   */
  adjustCannonDirection() {
    // 判断顺逆时针旋转
    this.cannon.angle =
      this.cannon.turn_direction === 0
        ? this.cannon.angle + this.cannon.rotate_speed
        : this.cannon.angle - this.cannon.rotate_speed;

    this.cannon.angle = classify_radian(this.cannon.angle);
    return this.cannon.rotate_speed;
  }

  /**
   * @function: adjustRadarDirection
   * @description: 调整雷达角度
   * @return {*}
   * @author: Banana
   */
  adjustRadarDirection() {
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
    const offset_distance = canvas.average_length_width / 2;

    // 弹道为 y=0 x=0 情况下单独计算
    if (y === 0) {
      return [
        x - offset_distance,
        offset_distance,
        x + offset_distance,
        -offset_distance,
      ];
    } else if (x === 0) {
      return [
        offset_distance,
        y - offset_distance,
        -offset_distance,
        y + offset_distance,
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
    for (let currentTank of tankList) {
      const color = currentTank.tank.color;
      const [x, y] = this.format_position(
        currentTank.tank.x,
        currentTank.tank.y,
        this.tank.x,
        this.tank.y
      );

      // 排除自己的位置
      if (color === this.tank.color) continue;
      //TODO 敌友判断 | 跳过已经被摧毁的坦克
      // 超越雷达范围直接退出
      const distance = Math.sqrt(x * x + y * y);
      if (distance > this.radar.largest_distance) continue;

      let k = Math.tan(radian).toFixed(2);
      // 根据敌方坦克坐标和自身的坐标计算斜率
      let current_k = (y / x).toFixed(2);
      // 判断雷达指向是否为敌方坦克所在的象限
      let current_radar_quadrant = this.determine_quadrant_by_radian(
        this.radar.angle
      );
      // 判断敌方坦克所在的象限
      let current_enemy_quadrant = this.determine_quadrant_by_position(x, y);

      // console.log("current_radar_quadrant :>> ", current_radar_quadrant);

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
        console.log(`${this.tank.color} : find you! => ${color}`);

        const enemy_angle = this.get_angle_slope_position(current_k, x, y);

        // 只有队列中不存在，发现敌人后尚未执行完毕的行为时，才再次添加该行为
        const current_behaviour = this.current_behavior_execution(
          event_priority.scannedRobot
        );
        if (current_behaviour === undefined) {
          this.stop_scan();
          this.actionPackaging(
            this.onScannedRobot,
            event_priority.scannedRobot,
            enemy_angle
          );
          // this.on_scanned_robot.operation(enemy_angle);
        }
        return;
      }

      // 由于垂直情况下斜率趋近于无穷，需要将其旋转90再判断
      // 旋转90度后敌方的坐标
      const [newx, newy] = [-y, x];
      // 斜率加90度
      k = Math.tan(radian + angle(90)).toFixed(2);
      // 根据敌方坦克坐标和自身的坐标计算斜率
      current_k = (newy / newx).toFixed(2);
      // 判断雷达指向是否为敌方坦克所在的象限
      current_radar_quadrant = this.determine_quadrant_by_radian(
        this.radar.angle + angle(90)
      );
      // 判断敌方坦克所在的象限
      current_enemy_quadrant = this.determine_quadrant_by_position(newx, newy);

      // console.log(
      //   `x,y ${newx},${newy}\n 传入斜率 ${k}\n 坦克之间斜率 ${current_k}\n`
      // );

      if (
        this.check_quadrant_situation(
          current_radar_quadrant,
          current_enemy_quadrant
        ) &&
        parseFloat(k) + 0.29 >= current_k &&
        parseFloat(k) - 0.29 <= current_k
      ) {
        console.log(`${this.tank.color} : find you! => ${color}`);

        // 因为计算时反转了90°，得到的结果要减去90°
        const enemy_angle =
          this.get_angle_slope_position(current_k, newx, newy) - 90;

        // 只有队列中不存在，发现敌人后尚未执行完毕的行为时，才再次添加该行为
        const current_behaviour = this.current_behavior_execution(
          event_priority.scannedRobot
        );
        if (current_behaviour === undefined) {
          this.stop_scan();
          this.actionPackaging(
            this.onScannedRobot,
            event_priority.scannedRobot,
            enemy_angle
          );
          // this.on_scanned_robot.operation(enemy_angle);
        }
        return;
      }
    }
  }

  get_angle_slope_position(k, x, y) {
    // console.log("k,x,y :>> ", k, x, y);
    // 根据斜率计算敌方角度
    const enemy_angle1 = parseFloat(
      ((180 * classify_radian(Math.atan(k))) / Math.PI).toFixed(2)
    );
    // console.log("enemy_angle1 :>> ", enemy_angle1);
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

  //? 停止和开始雷达扫描似乎可有可无...
  // 停止雷达扫描
  stop_scan() {
    // console.log(this.action_queue)
    const action_index = this.action_queue.findIndex(
      (item) =>
        item.function === "adjustRadarDirection" && item.execute_state === true
    );
    this.action_queue[action_index].execute_state = false;
    // console.log("this.action_queues :>> ", JSON.stringify(this.action_queue));
    // this.action_queue.splice(action_index, 1);
  }

  // 继续线程中未完成的雷达扫描
  continualScan() {
    const action = this.action_queue.find(
      (item) =>
        item.function === "adjustRadarDirection" && item.execute_state === false
    );
    action.execute_state = true;
    console.log("action :>> ", action);
  }

  /**
   * @function: webworker隔离用户代码
   * @description: actionPackaging
   * @param {*} func 执行的函数
   * @param {*} priority 当前行为优先级
   * @param {*} arug 函数携带的参数
   * @author: Banana
   */
  actionPackaging(func, priority, enemyAngle) {
    const object = {
      func,
      priority,
      selfInfo: {
        cannon: this.cannon,
        radar: this.radar,
        enemyAngle,
      },
      actionQueue: this.action_queue,
    };

    // webWoker 无法直接传递带有函数的对象，需要替换内部对象为字符串
    const temp = Object.assign(object, {
      func: object.func.toString(),
    });

    threadPool.execute({
      id: this.id,
      option: temp,
      onmessage: (ev) => {
        console.log("ev.data :>> ", ev.data);
        this.action_queue = ev.data;
      },
    });
  }

  run = () => {};

  onScannedRobot = () => {};

  onHitWall = () => {};

  onHitByBullet = () => {};

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
      this.synchronousOperation();
    else if (this.execution_mode === action_mode.asynchronous)
      this.asynchronousOperation();
  }

  // 执行同步操作
  synchronousOperation() {
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
  asynchronousOperation() {
    let current_index = 0;
    // 可以同步进行的操作
    let record_operation = {
      move: false,
      adjustTankDirection: false,
      adjustCannonDirection: false,
      adjustRadarDirection: false,
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
        this.loopAction && this.actionPackaging(this.run, event_priority.run);
        return this.implement_current_operation();
      }

      // this.action_queue.shift();
      // TODO 将回调函数的内容置于队首
      return this.implement_current_operation();
    }

    if (operation.function === "move") {
      this.check_move_direction(operation.argu);
      operation.already_implemented += this.move();
    } else if (operation.function === "adjustTankDirection") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjustTankDirection());
    } else if (operation.function === "adjustCannonDirection") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjustCannonDirection());
    } else if (operation.function === "adjustRadarDirection") {
      this.check_turn_direction(operation);
      operation.already_implemented += radian(this.adjustRadarDirection());
    } else if (operation.function === "launchCannon") {
      this.launchCannon();
      operation.already_implemented += 1;
    } else if (operation.function === "continualScan") {
      this.continualScan();
      operation.already_implemented += 1;
    } else if (operation.function === "showText") {
      this.showText(operation.text);
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
    const currentAction = operation.function.toLowerCase();
    const currentDirection =
      operation.argu > 0 ? tank_turn.left : tank_turn.right;

    if (currentAction.includes("tank")) {
      this.tank.turn_direction = currentDirection;
    } else if (currentAction.includes("radar")) {
      this.radar.turn_direction = currentDirection;
    } else if (currentAction.includes("cannon")) {
      this.cannon.turn_direction = currentDirection;
    }
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
   * @function: launchCannon
   * @description: 发射炮弹
   * @return {*}
   * @author: Banana
   */
  launchCannon() {
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
    // 超过屏幕范围清空线程
    if (this.cannon.x > canvas.width || this.cannon.y > canvas.height) {
      clearInterval(this.cannon.thread);
      this.cannon.thread = null;
      return;
    }

    // console.log("object :>> ", this.cannon.x, this.cannon.y);
    let [x_move, y_move] = this.compute_quadrant(
      this.cannon.launch_speed,
      this.cannon.cannonball_angle,
      tank_action.tank_move_direction.front
    );
    this.cannon.x += x_move;
    this.cannon.y += y_move;
    // console.log("x_move,y_move :>> ", x_move, y_move);

    for (let currentTank of tankList) {
      const color = currentTank.tank.color;
      // 排除自己的位置
      if (color === this.tank.color) continue;

      // 炮弹坐标
      const origin_cannon_x = this.cannon.launch_x;
      const origin_cannon_y = this.cannon.launch_y;
      const current_cannon_x = this.cannon.x + origin_cannon_x;
      const current_cannon_y = this.cannon.y + origin_cannon_y;
      const [x, y] = this.format_position(
        currentTank.tank.x,
        currentTank.tank.y,
        origin_cannon_x,
        origin_cannon_y
      );

      // console.log("x,y :>> ", x, y);

      // console.log("object :>> ", origin_cannon_x, origin_cannon_y);
      // console.log("object :>> ", current_cannon_x, current_cannon_y);

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

      // canvas.vision_position(real_left_x, real_left_y, "red");
      // canvas.vision_position(real_right_x, real_right_y, "gold");
      // canvas.vision_position(origin_cannon_x, origin_cannon_y, "black");

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
        console.log(this.tank.color + " 击中！=> " + color);
        // 若是用户的坦克反馈战绩
        if (window.userTank && window.userTank.color === this.tank.color)
          window.userTank.hitNumber++;

        this.hit_tank(color);
        clearInterval(this.cannon.thread);
        this.cannon.thread = null;
      }
    }
  }

  /**
   * @function: hit_tank
   * @description: 击中坦克
   * @return {*}
   * @author: Banana
   */
  hit_tank(tank_color) {
    for (const tank_item of tankList) {
      if (tank_item.tank.color == tank_color) {
        // 触发爆炸动画
        GIF.addEvent(tank_item.tank.x, tank_item.tank.y);
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
    this.actionPackaging(this.onHitByBullet, event_priority.hitByBullet);
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
    delTank(this.tank.color);

    // 若被摧毁的是用户的坦克，直接结束游戏
    if (window.userTank && this.tank.color === window.userTank.color) {
      window.userTank.state = tankState.fail;
      window.userTank.serviveTime = Date.now() - window.userTank.serviveTime;
    } else if (
      window.userTank &&
      tankList.length === 1 &&
      tankList[0].tank.color === window.userTank.color
    ) {
      window.userTank.state = tankState.victory;
      window.userTank.serviveTime = Date.now() - window.userTank.serviveTime;
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
    // if (area_left_x > check_x || check_x > area_right_x) return false;

    // const max_y = Math.max(area_left_y, area_right_y);
    // const min_y = Math.min(area_left_y, area_right_y);
    // if (min_y <= check_y && check_y <= max_y) return true;
    // else return false;
    const offset_distance = canvas.average_length_width / 2;

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
  tankList.push(newTank);
}

// 从坦克列表中释放对象
export function delTank(color) {
  let index = 0;
  for (const tank_item of tankList) {
    if (tank_item.tank.color == color) {
      tankList.splice(index, 1);
      break;
    }
    index++;
  }
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

  // console.log("tankList :>> ", tankList);

  // 判断用户的坦克是否为 胜利或失败 的状态
  if (
    window.userTank.state === tankState.fail ||
    window.userTank.state === tankState.victory
  ) {
    initTankList();
    canvas.settlementPage(window.userTank);
    console.log("object :>> ", window.userTank);
    window.userTank = undefined;
  }
}

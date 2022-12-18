import { Tank } from "./BasicTank";
import { action_mode, tank_action } from "./EnumObject";

export class UserTank extends Tank {
  action_queue = new Array(); // 行为队列
  execution_mode = action_mode.synchronous; // 默认动作从上到下顺序执行
  // 初始化运行
  run() {}
  // 坦克前进（前进位置）
  ahead(move_distance, callback) {
    this.action_queue.push({
      already_implemented: 0,
      function: "move",
      argu: move_distance,
      callback,
    });
  }
  // 坦克后退
  back(move_distance, callback) {
    this.action_queue.push({
      already_implemented: 0,
      function: "move",
      argu: -move_distance,
      callback,
    });
  }
  // 坦克旋转
  tank_turn(turn_angle, callback) {
    this.action_queue.push({
      already_implemented: 0,
      function: "adjust_tank_direction",
      argu: turn_angle,
      callback,
    });
  }
  // 炮口旋转
  cannon_trun() {}
  // 雷达旋转
  radar_turn() {}
  // 开火
  fire() {}
  // 说垃圾话
  say() {}
  // 重复循环执行函数
  loop() {}
  // 执行当前队列的操作
  implement_current_operation() {
    if (this.action_queue.length === 0) return;

    const operation = this.action_queue[0];
    // 若 当前队首的 (已经操作数量) 大于 (预计执行的数量) 将队首出队并且重新执行该函数
    if (Math.abs(operation.already_implemented) >= Math.abs(operation.argu)) {
      this.action_queue.shift();
      return this.implement_current_operation();
    }

    if (operation.function === "move") {
      this.check_move_direction(operation.argu);
      operation.already_implemented += this.move();
    }else if(operation.function === "move"){

    }
  }
  // 检测移动的方向
  check_move_direction(number) {
    if (number >= 0)
      this.tank.move_direction = tank_action.tank_move_direction.front;
    else this.tank.move_direction = tank_action.tank_move_direction.back;
  }
  // 切换为同步执行模式
  synchronous_mode() {
    this.execution_mode = action_mode.synchronous;
  }
  // 切换为异步执行模式
  asynchronous_mode() {
    this.execution_mode = action_mode.asynchronous;
  }
}

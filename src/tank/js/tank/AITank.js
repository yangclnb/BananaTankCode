import {
  getQuadrantCorner,
  getSparePosition,
  getSpareColor,
} from "../utils/utils.js";
import { Tank, addTank, initTankList } from "./BasicTank.js";

export class AITank {
  /**
   * @function: creat
   * @description: 初始化 AI坦克
   * @return {*}
   * @author: Banana
   */
  static create() {
    //TODO 遍历坦克list 获取还未被占据的出生点象限和坦克颜色
    const position = getSparePosition();
    // console.log("空闲的位置 :>> ", position);
    const color = getSpareColor();
    // console.log("空闲的颜色 :>> ", color);

    // 初始化位置
    const [x, y] = getQuadrantCorner(position);
    const tank = new Tank(x, y, 180, 180, 180, color, 1);

    tank.run.operation = function () {
      this.loop = function () {
        this.tank_turn(30);
        this.ahead(200);
        this.radar_turn(360);
      };
      this.loop();
    };
    tank.on_scanned_robot.operation = function (enemy_angle) {
      if (
        this.get_cannnon_reload_time() <=
        Date.now() - this.get_last_launch_time()
      ) {
        this.say("我发现你了~");
        const cannon_angle = this.get_current_cannon_angle();
        // this.cannon_turn(70);
        this.cannon_turn(enemy_angle - cannon_angle);
        this.fire();
      }
      this.continual_scan();
    };
    tank.on_hit_wall.operation = function () {
      this.back(10);
      this.tank_turn(45);
    };
    tank.on_hit_by_bullet.operation = function () {
      this.say("润润润");
      this.ahead(50);
    };

    addTank(tank);

    tank.run.operation();
  }
}

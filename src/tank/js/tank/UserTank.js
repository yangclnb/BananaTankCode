import { getQuadrantCorner } from "../utils/utils.js";
import { Tank, addTank, initTankList } from "./BasicTank.js";

export class UserTank {
  /**
   * @function: creat
   * @description: 初始化 用户坦克
   * @param {*} options 用户坦克配置
   * @param {*} onRun 运行时调用
   * @param {*} onScannedRobot 发现敌人时调用
   * @param {*} onHitWall 撞墙时调用
   * @param {*} onHitByBullet 被击中时调用
   * @return {*}
   * @author: Banana
   */
  static create(options, onRun, onScannedRobot, onHitWall, onHitByBullet) {
    // 初始化位置
    const [x, y] = getQuadrantCorner(options.initPosition);
    console.log("x,y :>> ", x, y);
    const tank = new Tank(
      x,
      y,
      options.initDirection,
      options.initDirection,
      options.initDirection,
      options.color,
      1
    );

    tank.run.operation = onRun ? onRun : function () {};
    tank.on_scanned_robot.operation = onScannedRobot
      ? onScannedRobot
      : function () {};
    tank.on_hit_wall.operation = onHitWall ? onHitWall : function () {};
    tank.on_hit_by_bullet.operation = onHitByBullet
      ? onHitByBullet
      : function () {};

    addTank(tank);

    // 全局存放用户坦克的颜色，作为判断胜利的条件
    window.userTank = {
      color: options.color,
      hitNumber: 0,
      serviveTime: Date.now(),
      state: "live", // 存活，死亡，胜利
    };

    tank.run.operation();
  }

  static executeUserCode(code) {
    initTankList();
    eval(code);
  }
}

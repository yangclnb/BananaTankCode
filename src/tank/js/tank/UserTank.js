/* eslint-disable no-undef */
import { tankState } from "../EnumObject.js";
import {
  getQuadrantCorner,
  getSparePosition,
  getSpareColor,
} from "../utils/utils.js";
import { getCode } from "../../../api/api";
import { Tank, addTank } from "./BasicTank.js";
import { initTankList, tankList } from "../../main.js";

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
      options.initPosition
    );
    tank.run = onRun ? onRun : () => {};
    tank.onScannedRobot = onScannedRobot ? onScannedRobot : () => {};
    tank.onHitWall = onHitWall ? onHitWall : () => {};
    tank.onHitByBullet = onHitByBullet ? onHitByBullet : () => {};

    // 关闭循环执行
    tank.loopAction = options.loopRun;

    addTank(tank);

    // 全局存放用户坦克的颜色，作为判断胜利的条件
    window.userTank = {
      color: options.color,
      hitNumber: 0,
      serviveTime: Date.now(),
      state: tankState.normal, // 存活，死亡，胜利
    };

    tank.actionPackaging(tank.run, 1);
    // tank.run.operation();
  }

  // 根据对手的代码创建坦克
  static createEnemyUserTankByID(
    options,
    onRun,
    onScannedRobot,
    onHitWall,
    onHitByBullet
  ) {
    const position = getSparePosition(tankList);
    const color = getSpareColor(tankList);

    // 初始化位置
    const [x, y] = getQuadrantCorner(position);
    if (x == undefined) return;

    const tank = new Tank(
      x,
      y,
      options.initDirection,
      options.initDirection,
      options.initDirection,
      color,
      position
    );
    tank.run = onRun ? onRun : () => {};
    tank.onScannedRobot = onScannedRobot ? onScannedRobot : () => {};
    tank.onHitWall = onHitWall ? onHitWall : () => {};
    tank.onHitByBullet = onHitByBullet ? onHitByBullet : () => {};

    tank.loopAction = options.loopRun;

    addTank(tank);

    tank.actionPackaging(tank.run, 1);
    // tank.run.operation();
  }

  static createAITank() {
    const position = getSparePosition(tankList);
    // console.log("空闲的位置 :>> ", position);
    const color = getSpareColor(tankList);
    // console.log("空闲的颜色 :>> ", color);

    // 初始化位置
    const [x, y] = getQuadrantCorner(position);
    if (x == undefined) return;

    const tank = new Tank(x, y, 180, 180, 180, color, position);

    tank.run = () => {
      tankTurn(30);
      ahead(200);
      radarTurn(360);
    };
    tank.onScannedRobot = () => {
      if (getCannnonReloadTime() <= Date.now() - getLastLaunchTime()) {
        say("我发现你了~");
        cannonTurn(enemyAngle() - getCurrentCannonAngle());
        fire();
      }
      continualScan();
    };
    tank.onHitWall = () => {
      back(10);
      tankTurn(45);
    };
    tank.onHitByBullet = () => {
      say("润润润");
      ahead(50);
    };
    tank.loopAction = true;

    addTank(tank);

    tank.actionPackaging(tank.run, 1);
  }

  static executeUserCode(code) {
    initTankList();
    eval(code);
    // this.createEnemyUserTank(13);
  }

  static async createEnemyUserTank(userID) {
    let { code } = await getCode(userID);
    code = code.replace(/UserTank.create/g, "UserTank.createEnemyUserTankByID");

    eval(code);
  }
}

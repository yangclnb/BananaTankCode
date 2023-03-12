import {
  getQuadrantCorner,
  getSparePosition,
  getSpareColor,
} from "../utils/utils.js";
import { tankList } from "../../main.js";
import { Tank, addTank } from "./BasicTank.js";

export class AITank {
  /**
   * @function: creat
   * @description: 初始化 AI坦克
   * @return {*}
   * @author: Banana
   */
  static create() {
    //TODO 遍历坦克list 获取还未被占据的出生点象限和坦克颜色
    const position = getSparePosition(tankList);
    // console.log("空闲的位置 :>> ", position);
    const color = getSpareColor(tankList);
    // console.log("空闲的颜色 :>> ", color);

    // 初始化位置
    const [x, y] = getQuadrantCorner(position);
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
}

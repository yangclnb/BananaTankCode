export const simplyVal = `// tank的运动方法
const run = () => {
  this.ahead(200);
  this.back(10);
};

/* 发现敌人时触发
 enemyAngle() 获取敌人的角度
*/
const scannedRobot = () => {};

// 撞墙时触发
const hitWall = () => {};

// 被击中时触发
const hitByBullet = () => {};

// 初始化配置
const options = {
  color: "red", // 坦克颜色 red | green | blue | yellow
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, // 初始位置，按照象限划分
  loopRun: true, // 是否循环执行run函数
};

UserTank.create(options, run, scannedRobot, hitWall, hitByBullet);

`;

export const devVal = `// tank的运动方法
const run = function () {
  // 调整为异步执行模式
  // this.asynchronous_mode()
  // this.say("我是异步运动的~")

  // 检测敌人 -----------------
  // this.radar_turn(-300)
  // this.back(400)

  // 检测行动 -----------------
  // this.say("我先开一炮")
  // this.fire()
  // this.say("向前移动 200")
  this.ahead(400)
  this.tank_turn(-45)
  this.ahead(400)
  // this.say("向左转 45°")

  // this.say("向前移动 200")
  // this.ahead(200)
  // this.say("向右转 45°")
  // this.tank_turn(-45)
  // this.say("向后移动 100")
  // this.back(100)
  // this.say("向左转 90°")
  // this.tank_turn(90)
  // this.say("向前移动 20")
  // this.ahead(20)
  // this.say("向右转 180°")
  // this.tank_turn(-180)
  // this.say("向前移动 200")
  // this.ahead(200)
  // this.say("炮口向右转 90°")
  // this.cannon_turn(-90)
  // this.say("雷达向右转 180°")
  // this.radar_turn(-180)
  // this.say("再来一炮")
  // this.fire()

  // 方向测试 ----------------
  // this.ahead(300)

  // 调试弹道 ----------------
  // this.cannon_turn(330)
  // this.fire()

  // 测试异步执行 -------------
  // this.fire()
  // this.tank_turn(360)
  // this.radar_turn(360)
  // this.ahead(500)
  // this.say("到达终点")

  // 动作循环 ----------------
  this.loop = function () {
    this.radar_turn(360)
  };
  // 还是需要执行的
  this.loop()
}

// 发现敌人时触发
// enemy_angle 敌人的角度
const scannedRobot = function(enemy_angle){
    if (
        this.get_cannnon_reload_time() <=
        Date.now() - this.get_last_launch_time()
      ) {
        this.say("我发现你了~")
        const cannon_angle = this.get_current_cannon_angle()
        console.log("enemy_angle,cannon_angle :>> ", enemy_angle, cannon_angle)
        this.cannon_turn(enemy_angle - cannon_angle)
        this.fire()
      }
      this.continualScan()
}

// 撞墙时触发
const hitWall = function(){
  // this.say("怎么撞墙了")
  // this.back(30)
  // this.tank_turn(45)
}

// 被击中时触发
const hitByBullet = function(){
  // this.say("捏麻麻滴")
}

// 初始化配置
const options = {
  color: "red", //坦克颜色
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, //初始位置，按照象限划分
};

UserTank.create(
    options,
    run,
    scannedRobot,
    hitWall,
    hitByBullet
  )`;

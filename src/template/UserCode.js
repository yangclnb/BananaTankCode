export const simplyVal = `// tank的运动方法
const run = () => {
  ahead(200);
  back(10);
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


// UserTank.createEnemyUserTank 添加敌方用户坦克 参数可以从排行榜中获取
// UserTank.createEnemyUserTank(14);

// UserTank.createAITank 添加AI坦克
// UserTank.createAITank();
`;

export const devVal = `
// tank的运动方法
const run = () => {
  say("banana");
  ahead(400);
  tankTurn(-45);
  // radarTurn(360)
};

/* 发现敌人时触发
 enemyAngle() 获取敌人的角度
*/
const scannedRobot = () => {
  if (getCannnonReloadTime() <= Date.now() - getLastLaunchTime()) {
    say("我发现你了~");
    cannonTurn(enemyAngle() - getCurrentCannonAngle());
    fire();
  }
  continualScan();
};

// 撞墙时触发
const hitWall = () => {
  back(20);
  tankTurn(45);
};

// 被击中时触发
const hitByBullet = () => { };

// 初始化配置
const options = {
  color: "red", // 坦克颜色 red | green | blue | yellow
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, // 初始位置，按照象限划分
  loopRun: false, // 是否循环执行run函数
};

UserTank.create(options, run, scannedRobot, hitWall, hitByBullet);

// UserTank.createEnemyUserTank(14);
// UserTank.createEnemyUserTank(14);
// UserTank.createEnemyUserTank(14);


UserTank.createAITank();
// UserTank.createAITank();
// UserTank.createAITank();
`;

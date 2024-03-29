// 在素材图中贴图的位置
export const map_faction_position = {
  red: { x: 4, y: 4 },
  blue: { x: 4, y: 56 },
  green: { x: 4, y: 108 },
  yellow: { x: 4, y: 160 },
  cannon: { x: 19, y: 212 },
  metal_map: { x: 107, y: 160 },
  brick_map: { x: 159, y: 160 },
  rock_map: { x: 214, y: 160 },
};

// 条形背景贴图预设的颜色
export const map_color_scheme = {
  a: ["#83af9b", "#f9cdad"],
  b: ["#111927", "#1D2839"],
  c: ["#a73737", "#7a2828"],
};

// tank 的状态
export const tankState = {
  fail: "FAIL",
  victory: "VICTORY",
  normal: "NORMAL",
};

// tank 的转向
export const tank_turn = { left: 0, right: 1 };

// tank 的行为
export const tank_action = {
  none: 0,
  tank_move: 1,
  tank_move_direction: {
    front: "front",
    back: "back",
  },
  adjustTankDirection: 2,
};

// 动作执行逻辑 同步（顺序执行，从上到下动作依次执行） | 异步（允许动作同时执行）
export const action_mode = {
  synchronous: "synchronous",
  asynchronous: "asynchronous",
};

// 事件及其优先级
export const event_priority = {
  run: 1,
  run_callback: 5,
  scannedRobot: 10,
  // 撞到别的坦克
  hitTank: 20,
  // 撞墙
  hitWall: 30,
  // 被击中
  hitByBullet: 40,
};

// 事件的优先级一览：
// scannedRobot:10
// bulletMissed:60
// bulletHit:50
// hitWall:30
// bulletHitBullet:50
// hitByBullet:40
// hitRobot:20
// death:100
// win:100
// robotDeath:70

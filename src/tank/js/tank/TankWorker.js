let eventPriority, actionQueue, selfInfo;

const radian = (input_radian) => (180 * input_radian) / Math.PI;

// 说垃圾话
const say = (text) => {
  organizeQueue({
    already_implemented: 0,
    function: "showText",
    argu: 1,
    text,
    priority: eventPriority,
    callback: null,
  });
};

// 坦克前进（前进位置）
const ahead = (move_distance, callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "move",
    argu: move_distance,
    priority: eventPriority,
    callback,
  });
};

// 坦克后退
const back = (move_distance, callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "move",
    argu: -move_distance,
    priority: eventPriority,
    callback,
  });
};

// 坦克旋转 正值👈 | 负值👉
const tankTurn = (turn_angle, callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "adjustTankDirection",
    argu: turn_angle,
    priority: eventPriority,
    callback,
  });
};

// 炮口旋转
const cannonTurn = (turn_angle, callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "adjustCannonDirection",
    argu: turn_angle,
    priority: eventPriority,
    callback,
  });
};

// 雷达旋转
const radarTurn = (turn_angle, callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "adjustRadarDirection",
    argu: turn_angle,
    priority: eventPriority,
    callback,
  });
};

// 开火
const fire = (callback) => {
  organizeQueue({
    already_implemented: 0,
    function: "launchCannon",
    argu: 1,
    priority: eventPriority,
    callback,
  });
};

// 调整为同步模式
const synchronousMode = () => {
  organizeQueue({
    already_implemented: 0,
    function: "synchronous",
    argu: 1,
    priority: eventPriority,
    callback: null,
  });
};

// 调整为异步模式
const asynchronousMode = () => {
  organizeQueue({
    already_implemented: 0,
    function: "asynchronous",
    argu: 1,
    priority: eventPriority,
    callback: null,
  });
};

// 停止雷达扫描
const stopScan = () => {
  organizeQueue({
    already_implemented: 0,
    function: "stop_scan",
    argu: 1,
    priority: eventPriority,
    callback: null,
  });
};

// 继续线程中的雷达扫描
const continualScan = () => {
  organizeQueue({
    already_implemented: 0,
    function: "continualScan",
    argu: 1,
    priority: eventPriority,
    callback: null,
  });
};

// 返回寻找到的敌人角度
const enemyAngle = () => {
  return selfInfo.enemyAngle;
};

// 返回当前炮管的角度
const getCurrentCannonAngle = () => {
  return radian(selfInfo.cannon.angle);
};

// 返回当前雷达的角度
const getCurrentRadarAngle = () => {
  return radian(selfInfo.radar.angle);
};

// 获取最近一次 炮弹 发射的事件
const getLastLaunchTime = () => {
  return selfInfo.cannon.launch_time;
};

// 获取炮弹装填事件
const getCannnonReloadTime = () => {
  return selfInfo.cannon.reload_time;
};

// 根据当前行为的优先级，插入动作队列的不同位置
function organizeQueue(action) {
  // 执行状态 true:正常执行 false:暂时不执行
  action.execute_state = true;
  if (actionQueue.length === 0) {
    actionQueue.push(action);
    return;
  }

  let currentIndex = 0;
  for (const action_item of actionQueue) {
    if (action_item.priority >= action.priority) {
      ++currentIndex;
    }
  }

  // 若当前索引指向队尾元素，需要在队尾+1处插入
  currentIndex =
    actionQueue.length === currentIndex ? currentIndex + 1 : currentIndex;

  actionQueue.splice(currentIndex, 0, action);
}

// 包裹器函数 转变eval的this指向
function wrapper(codeString) {
  return eval(codeString)();
}

/**  传入对象
func 执行的函数
priority 当先的优先级
actionList 当前行为队列
selfInfo 坦克的当前参数
*/
onmessage = (ev) => {
  // console.log("ev: ", ev);
  // 设置当前行为优先级
  eventPriority = ev.data.priority;
  // 设置读取当前行为队列
  actionQueue = ev.data.actionQueue;
  // 设置当前坦克信息
  selfInfo = ev.data.selfInfo;
  // 执行用户的行为逻辑
  wrapper.bind(self)(ev.data.func);
  // 返回用户行为列表
  postMessage(actionQueue);
  // 关闭线程
  close();
};

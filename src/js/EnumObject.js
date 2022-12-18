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
  b: ["#FC354C", "#0ABFBC"],
  c: ["#a73737", "#7a2828"],
};

// tank 的状态
export const tank_state = { destroy: 0, normal: 1 };

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
  adjust_tank_direction: 2,
};

// 动作执行逻辑 同步（顺序执行，从上到下动作依次执行） | 异步（允许动作同时执行）
export const action_mode = {
  synchronous: "synchronous",
  asynchronous: "asynchronous",
};

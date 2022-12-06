/**
 * @description: 在素材图中贴图的位置
 * @author: Banana
 */
export const map_faction_position = {
  red_tank: { x: 4, y: 4 },
  blue_tank: { x: 4, y: 56 },
  green_tank: { x: 4, y: 108 },
  yellow_tank: { x: 4, y: 160 },
  cannon: { x: 19, y: 212 },
  metal_map: { x: 107, y: 160 },
  brick_map: { x: 159, y: 160 },
  rock_map: { x: 214, y: 160 },
};

/**
 * @description: 条形背景贴图预设的颜色
 * @author: Banana
 */
export const map_color_scheme = {
  a: ["#707eaf", "#307eaf"],
  b: ["#FC354C", "#0ABFBC"],
  c: ["#a73737", "#7a2828"],
};

/**
 * @description: tank 的状态
 * @author: Banana
 */
export const tank_state = { destroy: 0, normal: 1 };

/**
 * @description: tank 的转向
 * @author: Banana
 */
export const tank_turn = { left: 0, right: 1 };

/**
 * @description: tank 的行为
 * @author: Banana
 */
export const tank_action = {
  none: 0,
  tank_move: 1,
  tank_move_direction: {
    front: "front",
    back: "back",
  },
  adjust_tank_direction: 2,
};

/**
 * @function: angle
 * @description: 根据输入的角度转化为弧度
 * @param {Number} input_angle
 * @return {Number} 转化后得弧度
 * @author: Banana
 */
export const angle = (input_angle) => (Math.PI / 180) * input_angle;

/**
 * @function: radian
 * @description: 根据输入的弧度返回角度
 * @param {Number} input_radian
 * @return {Number} 转化后得角度
 * @author: Banana
 */
export const radian = (input_radian) => (180 * input_radian) / Math.PI;

/**
 * @function: classify_radian
 * @description: 规范弧度值，将负弧度转化为正弧度值，将绝对值超过 2Π 弧度转化为 0 ~ 2Π 的形式
 * @param {Number} input_radian
 * @return {Number} 格式化后的弧度
 * @author: Banana
 */
export const classify_radian = (input_radian) => {
  // 超出360度的范围转化为超出的部分 Eg. 370 => 10
  input_radian =
    Math.abs(input_radian) >= angle(360)
      ? Math.abs(input_radian) - angle(360)
      : input_radian;

  // 将负角度转化为正角度计算
  if (input_radian <= 0) input_radian = angle(360) - input_radian;

  return input_radian;
};

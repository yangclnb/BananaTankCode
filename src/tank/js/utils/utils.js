/**
 * @function: angle
 * @description: 根据输入的角度转化为弧度
 * @param {Number} input_angle
 * @return {Number} 转化后得弧度
 * @author: Banana
 */
export const angle = (input_angle) => {
  input_angle = input_angle === 0 ? 360 : input_angle;
  return (Math.PI / 180) * input_angle;
};

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
      ? input_radian >= 0
        ? numMinus(input_radian, angle(360))
        : numAdd(input_radian, angle(360))
      : input_radian;

  // 将负角度转化为正角度计算
  if (input_radian < 0) input_radian = numAdd(input_radian, angle(360));

  return input_radian;
};

export function numAdd(num1, num2) {
  let baseNum, baseNum1, baseNum2;
  try {
    baseNum1 = String(num1).split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = String(num2).split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}

export function numMinus(num1, num2) {
  let baseNum, baseNum1, baseNum2;
  try {
    baseNum1 = String(num1).split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = String(num2).split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  return (num1 * baseNum - num2 * baseNum) / baseNum;
}

/**
 * @function: getQuadrantCorner
 * @description: 输入象限，根据canvas大小输出该象限的顶点位置
 * @param {*} quadrant
 * @return {*}
 * @author: Banana
 */
export function getQuadrantCorner(quadrant) {
  const canvas = window.game_canvas;

  switch (quadrant) {
    case 1:
      return [canvas.width - canvas.square_width - 10, 5];
    case 2:
      return [5, 5];
    case 3:
      return [5, canvas.height - canvas.square_height - 10];
    case 4:
      return [
        canvas.width - canvas.square_width - 10,
        canvas.height - canvas.square_height - 10,
      ];
  }
}

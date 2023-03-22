import { canvas } from "../../main.js";

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
    default:
      return [null, null];
  }
}

/**
 * @function:
 * @description: 通过初始位置判断出生点的象限
 * @param {*} x
 * @param {*} y
 * @return {*}
 * @author: Banana
 */
export function getQuadrantByPosition(x, y) {
  if (x > canvas.width / 2) {
    if (y > canvas.height / 2) return 4;
    else return 1;
  } else {
    if (y > canvas.height / 2) return 3;
    else return 2;
  }
}

/**
 * @function: getSparePosition
 * @description: 从坦克队列中获取尚未被占据的位置，全部被占据时返回 undefined
 * @return {*}
 * @author: Banana
 */
export function getSparePosition(tankList) {
  let position = [false, false, false, false];
  tankList.map((item) => {
    position[getQuadrantByPosition(item.tank.x, item.tank.y) - 1] = true;
  });
  const spareVal = position.findIndex((val) => val === false);
  return spareVal === -1 ? undefined : spareVal + 1;
}

/**
 * @function: getSpareColor
 * @description: 从坦克队列中获取尚未被占据的颜色，全部被占据时返回 undefined
 * @return {*}
 * @author: Banana
 */
export function getSpareColor(tankList) {
  const currentColor = { red: 0, blue: 1, green: 2, yellow: 3 };
  const currentIndexColor = { 0: "red", 1: "blue", 2: "green", 3: "yellow" };
  let temp = [false, false, false, false];
  tankList.map((item) => {
    temp[currentColor[item.tank.color]] = true;
  });
  return currentIndexColor[temp.findIndex((val) => val === false)];
}

/**
 * @function:
 * @description: 格式化字符串，a:b => a(num1的数量)(num2的数量)b 以空格填充
 * @param {*} str1 字符串1
 * @param {*} str2 字符串1
 * @param {*} num1 格式字符串1的最大填充数量
 * @param {*} num2 格式字符串2的最大填充数量
 * @return {*}
 * @author: Banana
 */
export function formatString(str1, str2, num1, num2) {
  return str1.padEnd(num1, " ") + str2.padStart(num2, " ");
}

export function formatTime(date, text) {
  const accurateTime = new Date(date);
  const second = accurateTime / 1000;
  const min = second / 60;
  const hour = min / 60;
  const day = hour / 24;

  // X分钟前 < 60分钟 ， X小时前 < 24小时 ， X天前  < 7天，20xx-x-x >= 7天

  if (second < 60) return `${Math.floor(second)}秒${text}`;
  else if (min < 60) return `${Math.floor(min)}分钟${text}`;
  else if (hour < 24) return `${Math.floor(hour)}小时${text}`;
  else if (day < 7) return `${Math.floor(day)}天${text}`;
  else {
    return `${accurateTime.getFullYear()}-${
      accurateTime.getMonth() + 1
    }-${accurateTime.getDate()}`;
  }
}

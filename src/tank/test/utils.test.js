import { angle, radian, classify_radian } from "../js/utils";

test("get 45 angle dequal 0.7853981633974483 radian", () => {
  expect(angle(45)).toBe(radian(0.7853981633974483));
});

test("classify radian 361 => 1, -90 => 270", () => {
  expect(radian(classify_radian(angle(0)))).toBe(0);
  expect(radian(classify_radian(angle(10)))).toBe(10);
  expect(radian(classify_radian(angle(360)))).toBe(0);
  expect(classify_radian(angle(361))).toBe(angle(1));
  expect(radian(classify_radian(angle(-90)))).toBe(270);
  expect(radian(classify_radian(angle(-370)))).toBe(350);
});

const fs = require("fs");
const fp = require("lodash/fp");

// 转义md文件
const escapeString = fp.replace(/`/g, "\\`");

// 获取要生成的JS文件内容
const getFileContent = fp.flowRight(
  (data) => `export const mdFile = \`${data}\``,
  escapeString,
  fs.readFileSync
);

// 获取要生成的JS文件名
const getJSFileName = fp.replace(/.md/, ".js");

// 创建JS文件
const createJSFile = fp.flowRight(
  fp.map((fileName) => {
    fs.writeFileSync(getJSFileName(fileName), getFileContent(fileName));
  }),
  fp.map((fileName) => "./src/docs/" + fileName),
  fp.filter((fileName) => fileName.endsWith(".md")),
  fs.readdirSync
);

createJSFile("./src/docs");

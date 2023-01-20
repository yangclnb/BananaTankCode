const fs = require("fs");
const fp = require("lodash/fp");

// 转义md文件的`
const escapeString = fp.replace(/`/g, "\\`");

// 拼接新的JS文件内容
const getFileContent = fp.flowRight(
  (data) => `export const mdFile = \`${data}\``,
  escapeString,
  fs.readFileSync
);

// 为拆分为数组的文件路径添加新的文件夹
const addDir = (dir) => {
  return (arr) => {
    const fileName = fp.last(arr);
    arr[arr.length - 1] = dir;
    arr.push(fileName);
    return arr;
  };
};

// 替换.md 为 .js
const getJSFileName = fp.flowRight(
  fp.join("/"),
  addDir("jsDocs"),
  fp.split("/"),
  fp.replace(/.md/, ".js")
);

// 创建JS文件
const createJSFile = fp.flowRight(
  fp.map((fileName) => {
    fs.writeFileSync(getJSFileName(fileName), getFileContent(fileName));
  }),
  fp.map((fileName) => "./src/docs/" + fileName),
  fp.filter((fileName) => fileName.endsWith(".md")),
  (fileName) => {
    // 若不存在 jsDocs 文件夹则添加此文件夹
    if (!fileName.includes("jsDocs")) fs.mkdirSync(`./src/docs/jsDocs`);
    return fileName;
  },
  fs.readdirSync
);

createJSFile("./src/docs");

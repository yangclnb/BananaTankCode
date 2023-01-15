<script setup>
import HeadPart from "../components/HeadPart.vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

import "github-markdown-css";
import "highlight.js/styles/github.css";

const val = `
# BananaCodeTank

🪖一款基于 **ES6 + canvas** 的坦克对战平台，其区别于传统的坦克大战的主要因素在于并非通过玩家的键鼠控制坦克的各种行为，而是通过代码执行各种函数从而实现控制坦克在特定的事件触发时按照玩家的代码让坦克执行特定的操作。在这个过程中玩家可以更好的了解 **ES6** 中的语法以及新特性，从而达到学习的目的。


## 初始化坦克

## 坐标系

在正式开始之前，让我们先了解一下 **BananaCodeTank** 中的坐标系吧...

![坦克坐标](https://pic.imgdb.cn/item/63c3f7f2be43e0d30ee8d6b2.png)

如图所示：原点o作为坦克的中心点，坦克向左（逆时针）旋转 *当前坦克角度 + X°* 时得到当前的状态，同理可知向右（顺时针）旋转 *当前坦克角度 - X°*。

这里可以使用 **BananaCodeTank** 内置的\`angle()\`函数将角度转化为弧度

## 移动
+ 前进
\`\`\` javascript
// 前进100个单位
this.ahead(100)

// 后退100个单位
this.ahead(-100)
\`\`\`
+ 后退
\`\`\` javascript
// 后退100个单位
this.back(100)

// 前进100个单位
this.back(-100)
\`\`\`

## 旋转
+ 坦克旋转
+ 炮口旋转
+ 雷达旋转

## 开炮

## 讲垃圾话

## 敌我判断

## 行为重复

## 事件
+ 常规运动
+ 撞墙
+ 撞到坦克
+ 被击中
+ 击中敌方坦克
+ 扫描到敌人



`;
const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (e) {
        console.error(e);
      }
    }

    return ""; // 使用额外的默认转义
  },
});
const result = md.render(val);
</script>

<template>
  <div id="about">
    <HeadPart />
    <div class="markdown-body" v-html="result"></div>
  </div>
</template>

<style lang="less" scoped>
#about {
  width: 100%;
  display: flex;
  flex-direction: column;

  .markdown-body {
    color: var(--theme-main-font);
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
    background-color: var(--theme-second-background);
    --color-canvas-subtle: #111927;
  }
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>

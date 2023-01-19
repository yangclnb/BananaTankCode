<script setup>
import { mdFile } from "../docs/DevDocument.js";
import HeadPart from "../components/HeadPart.vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

import "github-markdown-css";
import "highlight.js/styles/atom-one-dark-reasonable.css";

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
const result = md.render(mdFile);
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

<script setup>
import { mdFile } from "../docs/jsDocs/about.js";
import HeadPart from "../components/HeadPart.vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

import "github-markdown-css";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import { onMounted } from "vue";

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

onMounted(() => (document.title = "TankCode | 关于项目"));
</script>

<template>
  <div id="about">
    <HeadPart />
    <div class="markdown-body" v-html="result"></div>
  </div>
</template>

<style lang="less" scoped>
@import "../assets/docs.css";
#about {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>

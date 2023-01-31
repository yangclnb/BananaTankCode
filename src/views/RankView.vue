<script setup>
import HeadPart from "../components/HeadPart.vue";
import { ElTable, ElTableColumn, ElButton } from "element-plus";
import { onMounted, reactive } from "vue";

let tableData = reactive([
  {
    date: "2023年1月14日",
    name: "bananaKing",
    killsNumber: 114514,
    challenged: 96,
  },
]);

function toChallenge() {}

onMounted(() => (document.title = "TankCode | 排行榜"));
</script>

<template>
  <div id="rank">
    <HeadPart />
    <div id="rankBox">
      <el-table :data="tableData" style="width: 75%">
        <el-table-column prop="date" label="提交时间" />
        <el-table-column prop="name" label="玩家昵称" />
        <el-table-column prop="killsNumber" label="击杀数" />
        <el-table-column prop="challenged" label="被挑战数" />
        <el-table-column label="操作">
          <template #default>
            <el-button link type="primary" size="small" @click="toChallenge"
              >前往挑战</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="less" scoped>
#rank {
  width: 100%;
  display: flex;
  flex-direction: column;

  #rankBox {
    display: flex;
    justify-content: center;
  }
}
</style>

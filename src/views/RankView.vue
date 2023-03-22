<script setup>
import HeadPart from "../components/HeadPart.vue";
import { formatTime } from "../tank/js/utils/utils";
import { ElTable, ElTableColumn, ElButton } from "element-plus";
import { onMounted, ref } from "vue";
import { getAllGrade } from "../api/api";

// userID, userName, hitCount, survivalTime, pubtime
let tableData = ref([]);
let clickUserID = ref(0);
const centerDialogVisible = ref(false);

onMounted(async () => {
  const result = await getAllGrade();

  result.map((item) => {
    item.pubtime = formatTime(Date.now() - new Date(item.pubtime), "前");
    item.survivalTime = formatTime(new Date(parseInt(item.survivalTime)), "");
  });
  console.log("result: ", result);
  // tableData
  console.log("tableData: ", tableData.value);
  tableData.value = result;
  document.title = "TankCode | 排行榜";
});

function toChallenge(rowData) {
  console.log("rowData.row :>> ");
  clickUserID.value = rowData.row.userID;
  centerDialogVisible.value = true;
  // return function () {
  //   alert(id);
  // };
}
</script>

<template>
  <div id="rank">
    <HeadPart />
    <div id="rankBox">
      <el-table :data="tableData" stripe style="width: 75%" height="400">
        <el-table-column prop="pubtime" label="提交时间" />
        <el-table-column prop="userName" label="玩家昵称" />
        <el-table-column prop="hitCount" label="击中数" />
        <el-table-column prop="survivalTime" label="存活时间" />
        <el-table-column prop="userID" label="操作">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="toChallenge(scope)"
              >前往挑战</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      v-model="centerDialogVisible"
      title="挑战该用户"
      width="30%"
      align-center
    >
      <p>想要挑战该用户，你只需要将下面的代码复制到你的代码底部即可</p>
      <br />
      <code> UserTank.createEnemyUserTank({{ clickUserID }}); </code>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
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

code {
  padding: 10px;
  background: rgb(78, 78, 78);
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>

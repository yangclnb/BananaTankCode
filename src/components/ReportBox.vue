<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import _ from "lodash";
import { reportGrade } from "../api/api";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElMessage,
  ElTable,
  ElTableColumn,
} from "element-plus";

const form = reactive({
  userName: "",
});

let userState = ref({});
const submitBox = ref();
let lodaing = ref(false);

function showSubmitBox(e) {
  console.log("gameover 事件触发", e);
  userState.value = Object.assign(e.detail.userTankState);
  submitBox.value.style.display = "flex";
}

// 接收到 gameover 事件弹出该提示框
onMounted(() => {
  addEventListener("gameover", showSubmitBox);
});

onUnmounted(() => {
  removeEventListener("gameover", showSubmitBox);
});

async function submitData() {
  if (form.userName === "") {
    ElMessage.error("请确保您的输入昵称不为空");
    return;
  }

  lodaing.value = true;

  // TODO 过滤用户代码中用于创建敌方单位的代码
  const userCode = localStorage
    .getItem("userCode")
    .replace(
      /UserTank\.[createEnemyUserTank|createAITank]{1,}\(['|"]{0,1}\d*['|"]{0,1}\);{0,1}/g,
      ""
    );

  const options = {
    userName: form.userName,
    hitCount: userState.value.hitNumber,
    survivalTime: userState.value.serviveTime,
    challengeID: null,
    code: userCode,
  };

  const result = await reportGrade(options);
  console.warn("result: ", result);

  if (result.msg === "success") ElMessage.success("上传成功!");
  else ElMessage.success("上传失败，请稍后重试!");

  cancelBox();
}

// 点击提交
const onSubmit = _.throttle(submitData, 2000);

// 关闭窗口
const cancelBox = () => {
  submitBox.value.style.display = "none";
};
</script>

<template>
  <div id="containerBox" ref="submitBox">
    <el-form id="commentBox" :model="form">
      <h3 class="reportItem">
        你已经完成了本次游戏，你希望将你的战绩上传至服务器以供其他玩家挑战吗？
      </h3>
      <!-- { "color": "red", "hitNumber": 0, "serviveTime": 50773, "state": "FAIL" } -->
      <el-table
        class="reportItem"
        :data="[userState]"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="color" label="颜色" />
        <el-table-column prop="hitNumber" label="击中数" />
        <el-table-column prop="serviveTime" label="存活时长" />
        <el-table-column prop="state" label="状态" />
      </el-table>
      <el-form-item class="reportItem">
        <el-input v-model="form.userName" placeholder="您的昵称" />
      </el-form-item>
      <el-form-item>
        <el-button
          color="var(--themeColor)"
          type="primary"
          @click="onSubmit"
          :loading="lodaing"
          >提交战绩</el-button
        >
        <el-button @click="cancelBox">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="less" scoped>
#containerBox {
  // 默认隐藏发布评论框

  position: fixed;
  width: 100vw;
  height: 100vh;

  display: none;
  justify-content: center;
  align-items: center;

  z-index: 99;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(2, 2, 2, 0.5);
    backdrop-filter: blur(15px);
    z-index: -1;
  }

  #commentBox {
    width: 400px;
    padding: 20px;
    min-height: 200px;
    border-radius: 10px;
    background-color: var(--theme-main-background);

    animation: showBox 0.5s;

    @media screen and (max-width: 576px) {
      width: 85vw;
    }

    .reportItem {
      margin-bottom: 20px;
    }
  }
}

@keyframes showBox {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

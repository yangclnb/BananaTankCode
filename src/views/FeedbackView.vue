<script setup>
import HeadPart from "../components/HeadPart.vue";
import { ElForm, ElFormItem, ElButton, ElSelect, ElOption } from "element-plus";
</script>

<template>
  <div id="feedback">
    <HeadPart />
    <div id="feedbackBox">
      <el-form
        ref="ruleFormRef"
        class="demo-ruleForm"
        status-icon
        style="
          width: 60%;
          padding: 20px;
          background-color: var(--theme-second-background);
          border-radius: 5px;
        "
      >
        <el-form-item label="您的昵称" prop="name">
          <el-input />
        </el-form-item>
        <el-form-item label="反馈类型" prop="region">
          <el-select placeholder="bug反馈">
            <el-option label="bug反馈" value="0" />
            <el-option label="更改建议" value="1" />
            <el-option label="希望添加功能" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容" prop="desc">
          <el-input type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">提交反馈</el-button>
          <el-button>清空输入框</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="less" scoped>
#feedback {
  width: 100%;
  display: flex;
  flex-direction: column;

  #feedbackBox {
    display: flex;
    justify-content: center;
  }
}
</style>

<script setup>
import {
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
</script>

<template>
  <nav>
    <div id="top_part">
      <img src="@/assets/icon.png" width="25" alt="" />
      <div>
        <!-- 主页 -->
        <el-icon :size="25" color="currentColor"><HomeFilled /></el-icon>
      </div>
      <div>
        <!-- 排行 -->
        <el-icon :size="25" color="currentColor"><UploadFilled /></el-icon>
      </div>
      <div>
        <!-- 文档 -->
        <el-icon :size="25" color="currentColor"><Promotion /></el-icon>
      </div>
      <div>
        <!-- 帮助 -->
        <el-icon :size="25" color="currentColor"><HelpFilled /></el-icon>
      </div>
      <div>
        <!-- 反馈 -->
        <el-icon :size="25" color="currentColor"><Promotion /></el-icon>
      </div>
      <div>
        <!-- 关于 -->
        <el-icon :size="25" color="currentColor"><MoreFilled /></el-icon>
      </div>
    </div>

    <div id="botton_bar">
      <el-dropdown trigger="click" popper-class="dropdownBox">
        <span class="el-dropdown-link">
          CN<el-icon class="el-icon--right"><arrow-up /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu id="dropdownMenu">
            <el-dropdown-item>CN</el-dropdown-item>
            <el-dropdown-item>EN</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<style lang="less" scoped>
nav {
  width: 70px;
  height: 100vh;
  background-color: #1d2839;

  display: flex;
  flex-direction: column;

  #top_part {
    /* border: 1px solid red; */
    height: 80vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    div {
      box-sizing: border-box;
      cursor: pointer;
      width: 100%;
      padding: 10px 0;
      text-align: center;
      color: #34465b;
      transition: all 0.5s;
      border-right: 2px solid var(--theme-second-background);
    }

    div:hover {
      color: var(--theme-red-color);
      border-right: 2px solid currentColor;
    }
  }

  #botton_bar {
    cursor: pointer;
    height: 15vh;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  #dropdownMenu {
    background-color: red;
  }
}
</style>

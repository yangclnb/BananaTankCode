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
      <router-link to="/">
        <!-- 主页 -->
        <el-icon :size="25" color="currentColor"><HomeFilled /></el-icon>
      </router-link>
      <router-link to="/rank">
        <!-- 排行 -->
        <el-icon :size="25" color="currentColor"><UploadFilled /></el-icon>
      </router-link>
      <router-link to="/help">
        <!-- 帮助 -->
        <el-icon :size="25" color="currentColor"><HelpFilled /></el-icon>
      </router-link>
      <router-link to="/feedback">
        <!-- 反馈 -->
        <el-icon :size="25" color="currentColor"><Promotion /></el-icon>
      </router-link>
      <router-link to="/about">
        <!-- 关于 -->
        <el-icon :size="25" color="currentColor"><MoreFilled /></el-icon>
      </router-link>
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

    a {
      display: block;
      box-sizing: border-box;
      width: 100%;
      padding: 13px 0;
      text-align: center;
      color: #34465b;
      transition: all 0.5s;
      border-right: 2px solid var(--theme-second-background);

      &::before {
        content: "";
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: var(--theme-second-background);
        position: relative;
        top: 5px;
        left: 20px;
        filter: blur(8px);
      }

      i {
        position: relative;
        left: -10px;
      }

      &:hover {
        color: var(--theme-red-color);
      }
    }

    .router-link-exact-active {
      color: var(--theme-red-color);
      border-right: 2px solid currentColor;

      &::before {
        content: "";
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: var(--theme-red-color);
        position: relative;
        top: 5px;
        left: 14px;
        filter: blur(8px);
      }
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

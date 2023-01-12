import { ref } from "vue";
import { defineStore } from "pinia";

export const useTankStatusStore = defineStore("gameMode", () => {
  const mode = ref("console");

  // 切换模式为 控制台模式
  function consoleBattleMode() {
    mode.value = "console";
  }

  // 切换模式为 PVE
  function PVEBattleMode() {
    mode.value = "pve";
  }

  // 切换模式为 PVP
  function PVPBattleMode() {
    mode.value = "pvp";
  }

  // 获取当前模式的名称
  function getCurrentModeName() {
    switch (mode.value) {
      case "console":
        return "开发者模式";
      case "pve":
        return "pve模式";
      case "pvp":
        return "pvp模式";
    }
  }

  return {
    mode,
    consoleBattleMode,
    PVEBattleMode,
    PVPBattleMode,
    getCurrentModeName,
  };
});

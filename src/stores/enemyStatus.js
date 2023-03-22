import { ref } from "vue";
import { defineStore } from "pinia";

// 敌方单位玩家的状态
export const useConsoleDisplayStore = defineStore("enemyUserList", () => {
  const enemyUserList = ref([]);

  function addUser(userInfo) {
    if (enemyUserList.value.length >= 3) return;

    // userInfo = {userID :"",code:""}

    enemyUserList.value.push(userInfo);
  }

  return { enemyUserList, addUser };
});

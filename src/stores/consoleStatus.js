import { ref } from "vue";
import { defineStore } from "pinia";

export const useConsoleDisplayStore = defineStore("display", () => {
  const state = ref(false);

  function show() {
    state.value = true;
  }

  function hidde() {
    state.value = false;
  }

  return { state, show, hidde };
});

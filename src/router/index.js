import { createRouter, createWebHistory } from "vue-router";
import InformationView from "../views/InformationView.vue";
import { ElMessage } from "element-plus";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "information",
      component: InformationView,
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      beforeEnter: () => {
        if (window.innerWidth <= 500) {
          ElMessage.warning("为了更好的访问效果, 请切换PC设备访问");
          return false;
        }
        return true;
      },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/feedback",
      name: "feedback",
      component: () => import("../views/FeedbackView.vue"),
    },
    {
      path: "/help",
      name: "help",
      component: () => import("../views/HelpView.vue"),
    },
    {
      path: "/rank",
      name: "rank",
      component: () => import("../views/RankView.vue"),
    },
    {
      path: "/devDoc",
      name: "devDoc",
      component: () => import("../views/DevelopView.vue"),
    },
  ],
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
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

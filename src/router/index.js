import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import aboutView from "../views/AboutView.vue";
import FeedbackView from "../views/FeedbackView.vue";
import HelpView from "../views/HelpView.vue";
import RankView from "../views/RankView.vue";
import DevelopView from "../views/DevelopView.vue";

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
      component: aboutView,
    },
    {
      path: "/feedback",
      name: "feedback",
      component: FeedbackView,
    },
    {
      path: "/help",
      name: "help",
      component: HelpView,
    },
    {
      path: "/rank",
      name: "rank",
      component: RankView,
    },
    {
      path: "/devDoc",
      name: "devDoc",
      component: DevelopView,
    },
  ],
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import aboutView from "../views/AboutView.vue";
import FeedbackView from "../Views/FeedbackView.vue";
import HelpView from "../views/HelpView.vue";
import RankView from "../views/RankView.vue";

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
  ],
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
// import HomeView from "../views/HomeView.vue";
import FeedView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes: [
  //   {
  //     path: '/',
  //     name: 'home',
  //     component: HomeView,
  //   },
  //   {
  //     path: '/about',
  //     name: 'about',
  //     // route level code-splitting
  //     // this generates a separate chunk (About.[hash].js) for this route
  //     // which is lazy-loaded when the route is visited.
  //     component: () => import('../views/AboutView.vue'),
  //   },
  // ],
  routes: [
    {
      path: "/:type?", // 可选路径参数配置:ml-citation{ref="4,5" data="citationList"}
      name: "feed",
      component: FeedView,
      props: (route) => ({
        type: route.params.type || "all", // 路径参数默认值
        sort: route.query.sort || "default", // 查询参数默认值
      }),
    },
  ],
});

export default router;

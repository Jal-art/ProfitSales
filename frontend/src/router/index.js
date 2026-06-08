import { createRouter, createWebHistory } from "vue-router";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import AccountView from "../views/AccountView.vue";
import SaleView from "../views/SaleView.vue";
import ExpenseView from "../views/ExpenseView.vue";
import ReportView from "../views/ReportView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: "/dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/accounts",
    component: AccountView,
    meta: { requiresAuth: true },
  },
  {
    path: "/sales",
    component: SaleView,
    meta: { requiresAuth: true },
  },
  {
    path: "/expenses",
    component: ExpenseView,
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    component: ReportView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.meta.guestOnly && token) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
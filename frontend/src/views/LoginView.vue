<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2">ProfitSales</h1>
      <p class="text-center text-slate-500 mb-6">Login Admin</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full border rounded-lg px-3 py-2"
            placeholder="admin"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded-lg px-3 py-2"
            placeholder="admin123"
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const handleLogin = async () => {
  try {
    errorMessage.value = "";

    const response = await api.post("/auth/login", {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    router.push("/dashboard");
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Login gagal";
  }
};
</script>
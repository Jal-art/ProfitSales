<template>
  <div class="min-h-screen bg-slate-100 flex">
    <aside class="w-64 bg-slate-950 text-white min-h-screen p-5">
      <h1 class="text-2xl font-bold mb-8">ProfitSales</h1>

      <nav class="space-y-2">
        <RouterLink class="block px-4 py-2 rounded-lg hover:bg-slate-800" to="/dashboard">
          Dashboard
        </RouterLink>

        <RouterLink class="block px-4 py-2 rounded-lg hover:bg-slate-800" to="/accounts">
          Akun Game
        </RouterLink>

        <RouterLink class="block px-4 py-2 rounded-lg hover:bg-slate-800" to="/sales">
          Penjualan
        </RouterLink>

        <RouterLink class="block px-4 py-2 rounded-lg hover:bg-slate-800" to="/expenses">
          Pengeluaran
        </RouterLink>

        <RouterLink class="block px-4 py-2 rounded-lg hover:bg-slate-800" to="/reports">
          Laporan
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1">
      <header class="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="font-semibold text-slate-800">Admin Dashboard</h2>
          <p class="text-sm text-slate-500">Kelola pencatatan penjualan akun game</p>
        </div>

        <div class="relative" ref="menuRef">
          <button
            type="button"
            @click="isOpen = !isOpen"
            class="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
          >
            <div class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
              A
            </div>

            <div class="text-left">
              <p class="text-sm font-semibold text-slate-800">Admin</p>
              <p class="text-xs text-slate-500">Owner</p>
            </div>

            <span class="text-slate-500">▼</span>
          </button>

          <div
            v-if="isOpen"
            class="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border p-2 z-50"
          >
            <div class="px-3 py-2 border-b">
              <p class="text-sm font-semibold">Admin</p>
              <p class="text-xs text-slate-500">Logged in</p>
            </div>

            <button
              type="button"
              @click="handleLogout"
              class="w-full text-left px-3 py-2 mt-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section class="p-6">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const isOpen = ref(false);
const menuRef = ref(null);
const router = useRouter();

const onClickOutside = (e) => {
  if (!isOpen.value) return;
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isOpen.value = false;

  router.replace("/login");
};
</script>
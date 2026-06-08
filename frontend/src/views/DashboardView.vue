<template>
  <AdminLayout>
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-slate-500">Total Akun</p>
        <h2 class="text-2xl font-bold">0</h2>
      </div>

      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-slate-500">Akun Terjual</p>
        <h2 class="text-2xl font-bold">0</h2>
      </div>

      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-slate-500">Total Penjualan</p>
        <h2 class="text-2xl font-bold">0</h2>
      </div>

      <div class="bg-white p-5 rounded-xl shadow">
        <p class="text-slate-500">Laba Bersih</p>
        <h2 class="text-2xl font-bold">0</h2>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "../layouts/AdminLayout.vue";
</script>
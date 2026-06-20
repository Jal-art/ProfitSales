<template>
  <div class="login-page">
    <div class="accent-strip"></div>
    <div class="accent-strip strip-2"></div>

    <transition name="page-exit" mode="out-in">
      <div v-if="!isExiting" class="login-card">
      <div class="card-header">
        <span class="eyebrow">Admin panel</span>
        <h1 class="title">ProfitSales</h1>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <div class="field">
          <label>Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="admin"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <transition name="fade-shake">
          <p v-if="errorMessage" class="error-msg">
            {{ errorMessage }}
          </p>
        </transition>

        <div class="demo-cred">
          <button type="button" @click="useDemoCreds" class="demo-btn">Gunakan kredensial demo</button>
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="!loading">Masuk</span>
          <span v-else class="spinner"></span>
        </button>
      </form>

      <div class="card-footer">
        <span class="line"></span>
        <p class="credit">
          Built with <span class="heart">❤️</span> by
          <strong>ProfitSales</strong>
        </p>
      </div>
    </div>
    </transition>
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
const loading = ref(false);
function useDemoCreds() {
  username.value = "admin";
  password.value = "admin123";
}
const isExiting = ref(false);

const handleLogin = async () => {
  try {
    errorMessage.value = "";
    loading.value = true;

    const response = await api.post("/auth/login", {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    isExiting.value = true;
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Login gagal";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0d1321;
}

/* Diagonal geometric accents instead of generic blurred blobs */
.accent-strip {
  position: absolute;
  width: 220%;
  height: 140px;
  background: #16213e;
  transform: rotate(-8deg);
  z-index: 0;
}
.accent-strip:not(.strip-2) {
  top: 8%;
  left: -40%;
}
.strip-2 {
  bottom: 5%;
  left: -60%;
  background: #1b2a4a;
  height: 90px;
  transform: rotate(-8deg);
}

/* Card */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 1rem;
  padding: 2.25rem 2rem 1.5rem;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.45);
  animation: cardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  margin-bottom: 1.75rem;
  border-left: 3px solid #1d9e75;
  padding-left: 0.85rem;
}
.eyebrow {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}
.title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.field {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.field:nth-child(1) {
  animation-delay: 0.15s;
}
.field:nth-child(2) {
  animation-delay: 0.3s;
}
.field label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
  font-size: 0.82rem;
  color: #334155;
}
.field input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.6rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 0.95rem;
  background: #f8fafc;
}
.field input:focus {
  border-color: #1d9e75;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.15);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-msg {
  color: #993c1d;
  font-size: 0.85rem;
  background: #faece7;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #f0997b;
}
.fade-shake-enter-active { animation: shakeIn 0.35s; }
@keyframes shakeIn {
  0% { opacity: 0; transform: translateX(-8px); }
  50% { transform: translateX(6px); }
  100% { opacity: 1; transform: translateX(0); }
}

.login-btn {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.7rem;
  border-radius: 0.6rem;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  background: #0f172a;
  transition: background 0.2s, opacity 0.2s;
}
.login-btn:hover {
  background: #1d9e75;
}
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Credit di dalam card putih, slide in dari kanan ke kiri */
.card-footer {
  margin-top: 1.5rem;
  overflow: hidden;
}
.line {
  display: block;
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 0.75rem;
}
.credit {
  text-align: center;
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  animation: slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}
.credit strong {
  color: #1d9e75;
  font-weight: 700;
}
.heart {
  display: inline-block;
  animation: heartbeat 1.3s cubic-bezier(0.33, 0.66, 0.66, 1) infinite;
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.2); }
  30% { transform: scale(1); }
}
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Page exit transition */
.page-exit-enter-active {
  animation: cardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-exit-leave-active {
  animation: cardOut 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
}

.demo-cred {
  display: flex;
  justify-content: center;
  margin-bottom: 0.6rem;
}
.demo-btn {
  background: transparent;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  padding: 0.45rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
}
.demo-btn:hover {
  background: rgba(203, 213, 225, 0.06);
}
</style>
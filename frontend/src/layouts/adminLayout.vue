<template>
  <div class="layout-page">
    <header class="app-header">
      <div class="header-card">
        <div class="header-glow header-glow-primary"></div>
        <div class="header-glow header-glow-accent"></div>

        <div class="header-top">
          <div class="brand-block">
            <p class="eyebrow">Welcome back</p>
            <div class="brand-row">
              <span class="brand-dot"></span>
              <h1 class="brand-title">ProfitSales</h1>
            </div>
          </div>

          <button
            @click="togglePanel"
            :aria-expanded="panelOpen"
            class="avatar-chip"
            :class="{ 'avatar-chip-active': panelOpen }"
          >
            <span class="chip-av">A</span>
            <span class="chip-name">Admin</span>
            <svg class="chip-arr" :class="{ 'chip-arr-open': panelOpen }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              width="11" height="11">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <Transition name="panel-slide">
        <div v-if="panelOpen" class="account-panel">
          <div class="ap-user-row">
            <div class="ap-avatar">A</div>
            <div>
              <div class="ap-name">Admin</div>
              <div class="ap-email">admin@example.com</div>
            </div>
          </div>

          <div class="ap-logout-row">
            <button class="ap-logout-btn" @click="showSwipe = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <path d="M16 17l5-5-5-5"/>
                <path d="M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </Transition>

      <!-- Swipe to logout — muncul menggantikan modal konfirmasi -->
      <Transition name="swipe-modal-fade">
        <div v-if="showSwipe" class="swipe-modal-backdrop" @click.self="cancelSwipe">
          <div class="swipe-modal">
            <div class="swipe-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <path d="M16 17l5-5-5-5"/>
                <path d="M21 12H9"/>
              </svg>
            </div>
            <h3 class="swipe-modal-title">Logout akun?</h3>
            <p class="swipe-modal-sub">Geser untuk konfirmasi logout dari ProfitSales.</p>

            <div class="ap-swipe-track" ref="swipeTrackRef">
              <div class="ap-swipe-fill" :style="{ width: swipePct + '%' }"></div>
              <div
                class="ap-swipe-thumb"
                :style="{ left: swipeLeft + 'px' }"
                @pointerdown="onSwipeDown"
                @pointermove="onSwipeMove"
                @pointerup="onSwipeUp"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
                </svg>
              </div>
              <span class="ap-swipe-label">Logout</span>
              <Transition name="done-fade">
                <div v-if="swipeDone" class="ap-swipe-done">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Logging out...
                </div>
              </Transition>
            </div>

            <button class="swipe-modal-cancel" @click="cancelSwipe">Batal</button>
          </div>
        </div>
      </Transition>
    </header>

    <div v-if="panelOpen" class="ap-backdrop" @click="closePanel"></div>

    <main class="page-content animate-fade-in">
      <slot />
    </main>

    <Transition name="nav-slide">
      <nav v-show="navVisible" class="floating-nav-wrap">
        <div class="bottom-dock">
          <div class="dock-pill" :style="pillStyle"></div>

          <RouterLink
            v-for="(item, index) in menus"
            :key="item.path"
            :to="item.path"
            class="dock-item"
            :class="{ 'dock-item-active': activeIndex === index }"
            @click="onDockClick(index)"
            @pointerdown="pressIndex = index"
            @pointerup="pressIndex = null"
            @pointerleave="pressIndex = null"
          >
            <span
              class="dock-icon"
              :class="{ 'dock-icon-pop': bounceIndex === index, 'dock-icon-press': pressIndex === index }"
              v-html="item.icon"
            ></span>
            <span class="dock-label">{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>
    </Transition>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import api from "../services/api";

const router = useRouter();
const route = useRoute();

// ============ PANEL ============
const panelOpen = ref(false);
const showSwipe = ref(false);

function togglePanel() {
  panelOpen.value = !panelOpen.value;
  if (!panelOpen.value) {
    showSwipe.value = false;
    resetSwipe();
  }
}

function closePanel() {
  panelOpen.value = false;
  showSwipe.value = false;
  resetSwipe();
}

function cancelSwipe() {
  showSwipe.value = false;
  resetSwipe();
}

// ============ SWIPE LOGOUT ============
const swipeTrackRef = ref(null);
const swipeLeft = ref(4);
const swipePct = ref(0);
const swipeDone = ref(false);

let swipeDragging = false;
let swipeStartX = 0;
let swipeStartLeft = 0;

function resetSwipe() {
  swipeLeft.value = 4;
  swipePct.value = 0;
  swipeDone.value = false;
  swipeDragging = false;
}

function onSwipeDown(e) {
  swipeDragging = true;
  swipeStartX = e.clientX;
  swipeStartLeft = swipeLeft.value;
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onSwipeMove(e) {
  if (!swipeDragging) return;
  const trackW = swipeTrackRef.value?.offsetWidth || 220;
  const maxL = trackW - 44;
  const newLeft = Math.max(4, Math.min(swipeStartLeft + (e.clientX - swipeStartX), maxL));
  swipeLeft.value = newLeft;
  swipePct.value = ((newLeft - 4) / (maxL - 4)) * 100;
}

function onSwipeUp() {
  if (!swipeDragging) return;
  swipeDragging = false;
  if (swipePct.value > 82) {
    swipeDone.value = true;
    setTimeout(() => {
      logout();
    }, 900);
  } else {
    swipeLeft.value = 4;
    swipePct.value = 0;
  }
}

function logout() {
  resetSwipe();
  showSwipe.value = false;
  panelOpen.value = false;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (api?.defaults?.headers?.common?.Authorization) {
    delete api.defaults.headers.common.Authorization;
  }
  router.replace("/login");
}

// ============ BOTTOM NAV SCROLL HIDE ============
const navVisible = ref(true);
let lastScrollY = 0;
let scrollTimeout = null;

function handleNavScroll() {
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;
  if (currentY < 30) {
    navVisible.value = true;
  } else if (delta > 8) {
    navVisible.value = false;
  } else if (delta < -8) {
    navVisible.value = true;
  }
  lastScrollY = currentY;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    navVisible.value = true;
  }, 900);
}

onMounted(() => {
  lastScrollY = window.scrollY;
  window.addEventListener("scroll", handleNavScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleNavScroll);
  clearTimeout(scrollTimeout);
  clearTimeout(bounceTimeout);
});

// ============ BOTTOM NAV MENUS ============
const menus = [
  {
    path: "/dashboard",
    label: "Home",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>`,
  },
  {
    path: "/accounts",
    label: "Akun",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>`,
  },
  {
    path: "/sales",
    label: "Jual",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l5-5 4 4 8-8" /><path d="M14 8h6v6" /></svg>`,
  },
  {
    path: "/expenses",
    label: "Biaya",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l5 5-5 5" /><path d="M21 17l-5-5 5-5" /></svg>`,
  },
  {
    path: "/reports",
    label: "Report",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="3" height="9" /><rect x="10.5" y="6" width="3" height="14" /><rect x="17" y="2" width="3" height="18" /></svg>`,
  },
];

const activeIndex = computed(() => {
  const idx = menus.findIndex((m) => route.path.startsWith(m.path));
  return idx === -1 ? 0 : idx;
});

const pillStyle = ref({});
const pressIndex = ref(null);
const bounceIndex = ref(null);
let bounceTimeout = null;

function onDockClick(index) {
  bounceIndex.value = index;
  clearTimeout(bounceTimeout);
  bounceTimeout = setTimeout(() => {
    bounceIndex.value = null;
  }, 320);
}

function updatePillPosition() {
  const n = menus.length;
  const pct = 100 / n;
  pillStyle.value = {
    width: `calc(${pct}% - 4px)`,
    transform: `translateX(${activeIndex.value * 100}%)`,
  };
}

watch(activeIndex, () => {
  updatePillPosition();
});

onMounted(() => {
  updatePillPosition();
});
</script>

<style scoped>
.layout-page {
  min-height: 100vh;
  padding-bottom: 6rem;
  background:
    radial-gradient(circle at top left, rgba(29, 158, 117, 0.12), transparent 30%),
    linear-gradient(180deg, #f1f5f9 0%, #f8fafc 45%, #e2e8f0 100%);
}

/* ============ HEADER ============ */
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 0.85rem 0.85rem 0;
}

.header-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  padding: 1.1rem 1.2rem;
  color: white;
  background: linear-gradient(160deg, #0d1321 0%, #131c2e 55%, #0f1726 100%);
  box-shadow:
    0 20px 45px -22px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.header-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.header-glow-primary {
  right: -55px;
  top: -65px;
  width: 190px;
  height: 190px;
  background: radial-gradient(circle, rgba(29, 158, 117, 0.4), transparent 65%);
}
.header-glow-accent {
  left: -35px;
  bottom: -55px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.16), transparent 70%);
}

.header-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-block { min-width: 0; }

.eyebrow {
  margin: 0 0 4px;
  font-size: 0.68rem;
  color: #7c8696;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 600;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #22c58f;
  box-shadow: 0 0 0 3px rgba(34, 197, 143, 0.18);
}

.brand-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

/* ---- Avatar Chip ---- */
.avatar-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 99px;
  padding: 4px 9px 4px 4px;
  cursor: pointer;
  color: white;
  transition: background 0.18s, border-color 0.18s;
}
.avatar-chip:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.22);
}
.avatar-chip-active {
  background: rgba(29, 158, 117, 0.25);
  border-color: rgba(29, 158, 117, 0.5);
}

.chip-av {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1d9e75;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-name {
  font-size: 0.72rem;
  font-weight: 700;
}

.chip-arr {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.5);
}
.chip-arr-open {
  transform: rotate(180deg);
}

/* ---- Account Panel ---- */
.account-panel {
  position: absolute;
  left: 0.85rem;
  right: 0.85rem;
  top: calc(100% + 6px);
  background: white;
  border-radius: 1.15rem;
  border: 0.5px solid #e2e8f0;
  box-shadow:
    0 20px 50px -18px rgba(0, 0, 0, 0.22),
    0 4px 12px -4px rgba(0, 0, 0, 0.08);
  padding: 0.9rem 1rem 1rem;
  z-index: 60;
}

.ap-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 0.75rem;
  border-bottom: 0.5px solid #f1f5f9;
  margin-bottom: 0.75rem;
}

.ap-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d1321, #1d9e75);
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ap-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}
.ap-email {
  font-size: 0.67rem;
  color: #94a3b8;
}

/* ---- Logout Button (kecil, rata kanan) ---- */
.ap-logout-row {
  display: flex;
  justify-content: flex-end;
}

.ap-logout-btn {
  width: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.65rem;
  border-radius: 8px;
  background: #fff7f7;
  border: 0.5px solid #fde8e2;
  color: #b44420;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.ap-logout-btn:hover {
  background: #fee2e2;
}

/* ---- Swipe Modal (ganti modal konfirmasi lama) ---- */
.swipe-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0.85rem 1.5rem;
}

.swipe-modal {
  width: 100%;
  max-width: 26rem;
  background: white;
  border-radius: 1.4rem;
  padding: 1.4rem 1.25rem 1.15rem;
  text-align: center;
}

.swipe-modal-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 0.85rem;
  border-radius: 1rem;
  background: #fff1ec;
  color: #c2410c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swipe-modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.swipe-modal-sub {
  margin: 0.35rem 0 1.1rem;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
}

.swipe-modal-cancel {
  width: 100%;
  height: 40px;
  margin-top: 0.65rem;
  border: none;
  border-radius: 0.9rem;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.swipe-modal-cancel:hover {
  background: #e2e8f0;
}

.swipe-modal-fade-enter-active,
.swipe-modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.swipe-modal-fade-enter-active .swipe-modal,
.swipe-modal-fade-leave-active .swipe-modal {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}
.swipe-modal-fade-enter-from,
.swipe-modal-fade-leave-to {
  opacity: 0;
}
.swipe-modal-fade-enter-from .swipe-modal,
.swipe-modal-fade-leave-to .swipe-modal {
  transform: translateY(20px);
  opacity: 0;
}

/* ---- Swipe Logout ---- */
.ap-swipe-hint {
  font-size: 0.67rem;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.ap-swipe-track {
  position: relative;
  height: 46px;
  background: #fee2e2;
  border-radius: 13px;
  overflow: hidden;
  user-select: none;
}

.ap-swipe-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #fca5a5;
  border-radius: 13px;
  pointer-events: none;
  transition: width 0.04s linear;
}

.ap-swipe-thumb {
  position: absolute;
  top: 5px;
  bottom: 5px;
  width: 36px;
  background: white;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  transition: left 0.04s linear;
  z-index: 2;
}
.ap-swipe-thumb:active {
  cursor: grabbing;
}

.ap-swipe-label {
  position: absolute;
  right: 14px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  font-size: 0.74rem;
  font-weight: 700;
  color: #b91c1c;
  pointer-events: none;
}

.ap-swipe-done {
  position: absolute;
  inset: 0;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #b91c1c;
}

.done-fade-enter-active,
.done-fade-leave-active {
  transition: opacity 0.18s ease;
}
.done-fade-enter-from,
.done-fade-leave-to {
  opacity: 0;
}

/* Panel transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

/* Backdrop */
.ap-backdrop {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: transparent;
}

@media (min-width: 640px) {
  .app-header { padding: 1.1rem 1.5rem 0; }
  .header-card { padding: 1.3rem 1.6rem; border-radius: 1.75rem; }
  .brand-title { font-size: 1.55rem; }
  .account-panel { left: 1.5rem; right: 1.5rem; }
}

/* ============ PAGE CONTENT ============ */
.page-content {
  padding: 1rem;
}

/* ============ FLOATING DOCK ============ */
.floating-nav-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0.85rem;
  z-index: 50;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  pointer-events: none;
}

.bottom-dock {
  pointer-events: auto;
  position: relative;
  width: 100%;
  max-width: 25rem;
  min-height: 64px;
  padding: 0.45rem;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.35rem;
  border-radius: 1.6rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.93), rgba(13, 19, 33, 0.89));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 18px 40px -18px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.dock-pill {
  position: absolute;
  top: 0.45rem;
  left: 0.45rem;
  height: calc(100% - 0.9rem);
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #1d9e75, #22c58f);
  box-shadow:
    0 12px 22px -12px rgba(29, 158, 117, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition: transform 0.42s cubic-bezier(0.34, 1.4, 0.4, 1);
  will-change: transform;
}

.dock-item {
  position: relative;
  z-index: 1;
  height: 52px;
  border-radius: 1.2rem;
  color: #94a3b8;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  flex-direction: column;
  transition: color 0.22s ease, transform 0.15s ease;
}

.dock-item-active {
  color: #ffffff;
}

.dock-item:active {
  transform: scale(0.93);
}

.dock-icon {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  transition: transform 0.22s ease;
}

.dock-icon svg {
  width: 100%;
  height: 100%;
  transition: transform 0.22s ease;
}

.dock-item-active .dock-icon svg {
  transform: scale(1.18);
}

.dock-icon-press svg {
  transform: scale(0.85);
}

.dock-icon-pop svg {
  animation: icon-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes icon-pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.4); }
  100% { transform: scale(1.18); }
}

.dock-label {
  position: relative;
  z-index: 1;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.dock-item:not(.dock-item-active):hover {
  color: #e2e8f0;
}

.nav-slide-enter-active,
.nav-slide-leave-active {
  transition:
    transform 0.35s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.25s ease;
}

.nav-slide-enter-from,
.nav-slide-leave-to {
  transform: translateY(130%) scale(0.95);
  opacity: 0;
}

.nav-slide-enter-to,
.nav-slide-leave-from {
  transform: translateY(0) scale(1);
  opacity: 1;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.35s ease-out;
}

@media (max-width: 380px) {
  .floating-nav-wrap { bottom: 0.65rem; padding: 0 0.75rem; }
  .bottom-dock { min-height: 60px; border-radius: 1.35rem; }
  .dock-item { height: 49px; border-radius: 1rem; }
  .dock-icon { width: 18px; height: 18px; }
  .dock-label { font-size: 9px; }
}

@media (prefers-reduced-motion: reduce) {
  .dock-pill { transition: none; }
  .dock-icon-pop svg { animation: none; }
  .dock-item,
  .dock-icon,
  .dock-icon svg,
  .avatar-chip,
  .chip-arr { transition: none; }
}
</style>
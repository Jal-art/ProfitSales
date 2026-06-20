<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="page-heading">
        <span class="eyebrow">Overview</span>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-subtitle">Ringkasan bisnis akun game kamu</p>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="space-y-3">
        <div class="skeleton-card skeleton-hero"></div>
        <div class="skeleton-card skeleton-tall"></div>
        <div class="skeleton-card skeleton-tall"></div>
      </div>

      <template v-else>
        <!-- 1. Yang paling penting: laba bersih, besar dan jelas -->
        <div class="hero-card">
          <div class="hero-glow"></div>
          <div class="relative z-10">
            <div class="hero-top">
              <p class="hero-label">Laba bersih bulan ini</p>
              <span class="hero-badge" :class="{ 'hero-badge-warn': dashboard.netProfit < 0 }">
                <svg v-if="dashboard.netProfit >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M5 13l4 4L19 7"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 9v4M12 17h.01M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                {{ dashboard.netProfit >= 0 ? 'Sehat' : 'Rugi' }}
              </span>
            </div>
            <h3 class="hero-value">{{ formatRupiah(dashboard.netProfit) }}</h3>

            <div class="hero-breakdown">
              <div>
                <p class="hero-breakdown-label">Penjualan</p>
                <p class="hero-breakdown-value">{{ formatRupiah(dashboard.totalSales) }}</p>
              </div>
              <div class="hero-divider"></div>
              <div>
                <p class="hero-breakdown-label">Pengeluaran</p>
                <p class="hero-breakdown-value">{{ formatRupiah(dashboard.totalExpense) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Status akun: satu strip ringkas, bukan 4 kotak terpisah -->
        <div class="status-strip">
          <div class="status-item">
            <p class="status-value">{{ dashboard.totalAccounts }}</p>
            <p class="status-label">Total akun</p>
          </div>
          <div class="status-sep"></div>
          <div class="status-item">
            <p class="status-value">{{ dashboard.availableAccounts }}</p>
            <p class="status-label">Tersedia</p>
          </div>
          <div class="status-sep"></div>
          <div class="status-item">
            <p class="status-value">{{ dashboard.soldAccounts }}</p>
            <p class="status-label">Terjual</p>
          </div>
          <div class="status-sep"></div>
          <div class="status-item">
            <p class="status-value" :class="{ 'status-warn': dashboard.problemAccounts > 0 }">
              {{ dashboard.problemAccounts }}
            </p>
            <p class="status-label">Problem</p>
          </div>
        </div>

        <!-- 3. Transaksi terbaru — klik baris untuk lihat detail, tanpa pindah halaman -->
        <div class="transactions-card">
          <div class="transactions-header">
            <h3 class="transactions-title">Transaksi terbaru</h3>
            <span class="transactions-count" v-if="dashboard.latestSales?.length">{{ dashboard.latestSales.length }}</span>
          </div>

          <div v-if="!dashboard.latestSales || dashboard.latestSales.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
            <p>Belum ada transaksi.</p>
          </div>

          <transition-group name="list-item" tag="div">
            <div
              v-for="sale in dashboard.latestSales"
              :key="sale.id"
              class="transaction-block"
              :class="{ 'transaction-block-open': expandedId === sale.id }"
            >
              <button
                type="button"
                class="transaction-row"
                @click="toggleExpand(sale.id)"
                :aria-expanded="expandedId === sale.id"
              >
                <div class="transaction-info">
                  <div class="transaction-avatar">
                    {{ (sale.GameAccount?.account_name || "AG").substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="transaction-text">
                    <p class="transaction-name">
                      {{ sale.GameAccount?.account_name || "Akun Game" }}
                    </p>
                    <p class="transaction-meta">
                      {{ sale.transaction_no }} &bull; {{ sale.buyer_name }}
                    </p>
                  </div>
                </div>

                <div class="transaction-right">
                  <div class="text-right">
                    <p class="transaction-price">{{ formatRupiah(sale.sold_price) }}</p>
                    <p class="transaction-profit">
                      +{{ formatRupiah(sale.profit) }}
                    </p>
                  </div>
                  <svg class="transaction-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              <div class="transaction-detail" v-show="expandedId === sale.id">
                <div class="detail-panel">
                  <div class="detail-row">
                    <span class="detail-label">Tanggal</span>
                    <span class="detail-value">{{ formatDate(sale.sale_date) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Metode bayar</span>
                    <span class="detail-value">{{ paymentLabel(sale.payment_method) }}</span>
                  </div>
                  <div class="detail-row" v-if="sale.GameAccount?.game_name">
                    <span class="detail-label">Game</span>
                    <span class="detail-value">{{ sale.GameAccount.game_name }}</span>
                  </div>
                  <div class="detail-row" v-if="sale.cost_price">
                    <span class="detail-label">Modal akun</span>
                    <span class="detail-value">{{ formatRupiah(sale.cost_price) }}</span>
                  </div>
                  <div class="detail-row" v-if="sale.notes">
                    <span class="detail-label">Catatan</span>
                    <span class="detail-value">{{ sale.notes }}</span>
                  </div>
                  <div class="detail-row detail-row-total">
                    <span class="detail-label">Margin</span>
                    <span class="detail-value detail-value-profit">{{ formatMargin(sale) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import api from "../services/api";

const loading = ref(false);
const expandedId = ref(null);

const dashboard = ref({
  totalAccounts: 0,
  availableAccounts: 0,
  soldAccounts: 0,
  problemAccounts: 0,
  totalSales: 0,
  totalProfit: 0,
  totalExpense: 0,
  netProfit: 0,
  latestSales: [],
});

const paymentLabels = {
  direct: "Direct",
  rekber: "Rekber",
  cod: "COD",
};

const paymentLabel = (value) => {
  if (!value) return "Belum dicatat";
  return paymentLabels[value] || value;
};

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) return "Belum dicatat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum dicatat";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMargin = (sale) => {
  if (!sale.sold_price || !sale.profit) return "-";
  const margin = (sale.profit / sale.sold_price) * 100;
  return `${margin.toFixed(1)}%`;
};

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const getDashboard = async () => {
  try {
    loading.value = true;
    const response = await api.get("/dashboard");
    dashboard.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getDashboard();
});
</script>

<style scoped>
.page-heading {
  margin-bottom: 0.25rem;
}
.eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0.1rem 0 0.1rem;
}
.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* 1. Hero — satu fokus utama, tenang */
.hero-card {
  position: relative;
  background: #0d1321;
  color: white;
  border-radius: 1.4rem;
  padding: 1.3rem 1.35rem;
  overflow: hidden;
  box-shadow: 0 14px 32px -14px rgba(13, 19, 33, 0.55);
}
.hero-glow {
  position: absolute;
  top: -60px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(29, 158, 117, 0.28), transparent 68%);
  z-index: 0;
  pointer-events: none;
}
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hero-label {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  background: rgba(93, 202, 165, 0.15);
  color: #5dcaa5;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
}
.hero-badge-warn {
  background: rgba(224, 122, 95, 0.15);
  color: #f0997b;
}
.hero-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.35rem 0 1.05rem;
  letter-spacing: -0.01em;
}
.hero-breakdown {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding-top: 0.95rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.hero-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.08);
}
.hero-breakdown-label {
  font-size: 0.7rem;
  color: #64748b;
  margin: 0 0 0.15rem;
}
.hero-breakdown-value {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #e2e8f0;
}

/* 2. Status strip — satu baris ringkas */
.status-strip {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1.25rem;
  padding: 0.95rem 0.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.status-item {
  flex: 1;
  text-align: center;
}
.status-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.status-warn {
  color: #993c1d;
}
.status-label {
  font-size: 0.68rem;
  color: #94a3b8;
  margin: 0.15rem 0 0;
}
.status-sep {
  width: 1px;
  height: 26px;
  background: #f1f5f9;
}

/* 3. Transaksi */
.transactions-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.transactions-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  margin: 0;
}
.transactions-count {
  font-size: 0.7rem;
  font-weight: 600;
  background: #e1f5ee;
  color: #0f6e56;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #94a3b8;
}
.empty-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 0.5rem;
  display: block;
  opacity: 0.5;
}
.empty-state p {
  font-size: 0.85rem;
  margin: 0;
}

.transaction-block {
  border-bottom: 1px solid #f1f5f9;
}
.transaction-block:last-child {
  border-bottom: none;
}

.transaction-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 0.7rem 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  -webkit-tap-highlight-color: transparent;
}
.transaction-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.transaction-text {
  min-width: 0;
}
.transaction-avatar {
  width: 38px;
  height: 38px;
  border-radius: 0.75rem;
  background: #e1f5ee;
  color: #0f6e56;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.transaction-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.transaction-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 0.1rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.transaction-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.transaction-price {
  font-weight: 700;
  font-size: 0.875rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
}
.transaction-profit {
  font-size: 0.72rem;
  color: #1d9e75;
  font-weight: 600;
  margin: 0.1rem 0 0;
  white-space: nowrap;
}
.transaction-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  transition: transform 0.22s ease, color 0.22s ease;
}
.transaction-block-open .transaction-chevron {
  transform: rotate(180deg);
  color: #1d9e75;
}

.transaction-detail {
  padding: 0 0 0.85rem 48px;
}
.detail-panel {
  background: #f8fafc;
  border-radius: 0.9rem;
  padding: 0.7rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
}
.detail-label {
  color: #94a3b8;
  flex-shrink: 0;
}
.detail-value {
  color: #334155;
  font-weight: 500;
  text-align: right;
}
.detail-row-total {
  padding-top: 0.5rem;
  margin-top: 0.05rem;
  border-top: 1px solid #e2e8f0;
}
.detail-row-total .detail-label {
  color: #64748b;
  font-weight: 600;
}
.detail-value-profit {
  color: #0f6e56;
  font-weight: 700;
}

.list-item-enter-active {
  transition: all 0.3s ease;
}
.list-item-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

/* Skeleton */
.skeleton-card {
  border-radius: 1.25rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
.skeleton-hero {
  height: 150px;
}
.skeleton-tall {
  height: 70px;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .transaction-chevron { transition: none; }
  .skeleton-card { animation: none; }
}
</style>
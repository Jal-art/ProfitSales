<template>
  <AdminLayout>
    <div class="space-y-4">

      <!-- Heading -->
      <div class="page-heading">
        <h2 class="page-title">Laporan</h2>
        <p class="page-subtitle">Ringkasan penjualan berdasarkan rentang tanggal</p>
      </div>

      <!-- Filter tanggal — collapsible -->
      <div class="add-card">
        <button class="add-toggle" @click="showFilter = !showFilter">
          <span class="add-toggle-icon" :class="{ 'add-toggle-icon-open': showFilter }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/>
            </svg>
          </span>
          <span>{{ filterLabel }}</span>
        </button>

        <Transition name="expand">
          <div v-if="showFilter" class="add-form">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Dari</label>
                <input v-model="startDate" type="date" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Sampai</label>
                <input v-model="endDate" type="date" class="field-input" />
              </div>
            </div>
            <button class="submit-btn" @click="applyFilter" :disabled="loading">
              <span v-if="!loading">Tampilkan laporan</span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Summary cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <p class="summary-label">Transaksi</p>
          <p class="summary-value">{{ report.totalTransaction }}</p>
        </div>
        <div class="summary-card">
          <p class="summary-label">Total profit</p>
          <p class="summary-value summary-value-green">{{ formatRupiah(report.totalProfit) }}</p>
        </div>
        <div class="summary-card summary-card-dark">
          <p class="summary-label summary-label-light">Total penjualan</p>
          <p class="summary-value summary-value-light">{{ formatRupiah(report.totalSales) }}</p>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="skeleton-row"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="sales.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <p>Belum ada data penjualan untuk periode ini.</p>
      </div>

      <!-- List transaksi -->
      <div v-else class="space-y-2.5">
        <button
          v-for="sale in sales"
          :key="sale.id"
          class="sale-row"
          @click="openDetail(sale)"
        >
          <div class="sale-main">
            <div class="sale-avatar">
              {{ (sale.GameAccount?.account_name || "AG").substring(0, 2).toUpperCase() }}
            </div>
            <div class="sale-info">
              <p class="sale-name">{{ sale.GameAccount?.account_name || "Akun Game" }}</p>
              <p class="sale-meta">{{ sale.transaction_no }} · {{ sale.buyer_name }}</p>
            </div>
            <div class="sale-right">
              <span class="date-badge">{{ formatDate(sale.sale_date) }}</span>
              <span class="profit-pill">+{{ formatRupiah(sale.profit) }}</span>
            </div>
          </div>
        </button>
      </div>

    </div>

    <!-- Detail sheet -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="selectedSale" class="detail-backdrop" @click.self="closeDetail">
          <div class="detail-sheet">
            <div class="detail-handle"></div>

            <!-- Header -->
            <div class="detail-header">
              <div class="detail-avatar">
                {{ (selectedSale.GameAccount?.account_name || "AG").substring(0, 2).toUpperCase() }}
              </div>
              <div class="detail-header-text">
                <h3 class="detail-name">{{ selectedSale.GameAccount?.account_name || "Akun Game" }}</h3>
                <p class="detail-game">{{ selectedSale.GameAccount?.game_name || "-" }}</p>
              </div>
              <span class="status-badge status-sold">sold</span>
            </div>

            <!-- Info transaksi -->
            <div class="detail-section">
              <div class="detail-field">
                <span class="detail-label">No. transaksi</span>
                <span class="detail-value">{{ selectedSale.transaction_no }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Pembeli</span>
                <span class="detail-value">{{ selectedSale.buyer_name || "-" }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Tanggal jual</span>
                <span class="detail-value">{{ formatDate(selectedSale.sale_date) }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Metode bayar</span>
                <span class="method-badge">{{ selectedSale.payment_method }}</span>
              </div>
            </div>

            <!-- Kredensial akun -->
            <div class="detail-section" v-if="selectedSale.GameAccount">
              <p class="section-title">Kredensial akun</p>
              <div class="detail-field">
                <span class="detail-label">Email login</span>
                <span class="detail-value-actions">
                  <span class="detail-value">{{ selectedSale.GameAccount.login_email || "-" }}</span>
                  <button
                    v-if="selectedSale.GameAccount.login_email"
                    class="icon-btn"
                    @click="copyText(selectedSale.GameAccount.login_email, 'email')"
                    aria-label="Salin email"
                  >
                    <svg v-if="copiedField !== 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>
                  </button>
                </span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Password</span>
                <span class="detail-value-actions">
                  <span class="detail-value">{{ showPassword ? (selectedSale.GameAccount.login_password || "-") : "••••••••" }}</span>
                  <button class="icon-btn" @click="showPassword = !showPassword" aria-label="Tampilkan password">
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.5A10.6 10.6 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-2.6 3.4M6.6 6.6A13.7 13.7 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 4-.8"/></svg>
                  </button>
                  <button
                    v-if="selectedSale.GameAccount.login_password"
                    class="icon-btn"
                    @click="copyText(selectedSale.GameAccount.login_password, 'password')"
                    aria-label="Salin password"
                  >
                    <svg v-if="copiedField !== 'password'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>
                  </button>
                </span>
              </div>
            </div>

            <!-- Ringkasan harga -->
            <div class="price-panel">
              <div class="price-row">
                <span class="detail-label">Harga beli</span>
                <span class="detail-value">{{ formatRupiah(selectedSale.GameAccount?.purchase_price) }}</span>
              </div>
              <div class="price-row">
                <span class="detail-label">Harga jual</span>
                <span class="detail-value">{{ formatRupiah(selectedSale.sold_price) }}</span>
              </div>
              <div class="price-row price-row-total">
                <span class="detail-label">Profit</span>
                <span class="detail-value detail-profit">{{ formatRupiah(selectedSale.profit) }}</span>
              </div>
            </div>

            <button class="detail-close" @click="closeDetail">Tutup</button>
          </div>
        </div>
      </transition>
    </Teleport>

  </AdminLayout>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import api from "../services/api";

const startDate = ref("");
const endDate = ref("");
const sales = ref([]);
const loading = ref(false);
const showFilter = ref(false);

const selectedSale = ref(null);
const showPassword = ref(false);
const copiedField = ref("");

const report = ref({
  totalTransaction: 0,
  totalSales: 0,
  totalProfit: 0,
});

const filterLabel = computed(() => {
  if (startDate.value && endDate.value) {
    return `${formatDate(startDate.value)} – ${formatDate(endDate.value)}`;
  }
  return "Filter tanggal";
});

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const getReport = async () => {
  try {
    loading.value = true;
    let url = "/reports/sales";
    if (startDate.value && endDate.value) {
      url += `?start_date=${startDate.value}&end_date=${endDate.value}`;
    }
    const response = await api.get(url);
    report.value = {
      totalTransaction: response.data.totalTransaction || 0,
      totalSales: response.data.totalSales || 0,
      totalProfit: response.data.totalProfit || 0,
    };
    sales.value = response.data.data || response.data.sales || [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  showFilter.value = false;
  getReport();
};

function openDetail(sale) {
  selectedSale.value = sale;
  showPassword.value = false;
  copiedField.value = "";
}

function closeDetail() {
  selectedSale.value = null;
}

async function copyText(text, field) {
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = field;
    setTimeout(() => {
      if (copiedField.value === field) copiedField.value = "";
    }, 1500);
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  getReport();
});
</script>

<style scoped>
.page-heading { margin-bottom: 0.1rem; }
.page-title { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.15rem 0 0; }

/* Collapsible filter */
.add-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  overflow: hidden;
}
.add-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.9rem 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
}
.add-toggle-icon {
  width: 26px; height: 26px;
  border-radius: 0.6rem;
  background: #e1f5ee;
  color: #0f6e56;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.add-toggle-icon-open { background: #faece7; color: #993c1d; }
.add-form {
  padding: 0 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.field-group { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.field-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.field-input:focus { border-color: #1d9e75; }
.submit-btn {
  height: 44px; border: none; border-radius: 0.85rem;
  background: #0d1321; color: white; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; transition: background 0.2s;
}
.submit-btn:hover { background: #1d9e75; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  display: inline-block; width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active, .expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 400px; }

/* Summary grid */
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.summary-card {
  background: white; border: 1px solid #f1f5f9;
  border-radius: 1.1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); padding: 1rem;
}
.summary-card-dark { background: #0d1321; border-color: #0d1321; grid-column: span 2; }
.summary-label { font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.35rem; }
.summary-label-light { color: #64748b; }
.summary-value { font-size: 1.45rem; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.1; }
.summary-value-green { color: #0f6e56; }
.summary-value-light { color: white; font-size: 1.6rem; }

/* Sale row — sekarang jadi button */
.sale-row {
  width: 100%;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.sale-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -8px rgba(0,0,0,0.12);
}
.sale-main { display: flex; align-items: center; gap: 12px; }
.sale-avatar {
  width: 40px; height: 40px; border-radius: 0.8rem;
  background: #eeedfe; color: #534ab7;
  font-weight: 700; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sale-info { flex: 1; min-width: 0; }
.sale-name {
  font-weight: 600; font-size: 0.9rem; color: #0f172a; margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sale-meta { font-size: 0.75rem; color: #94a3b8; margin: 0.1rem 0 0; }

.sale-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;
}
.date-badge {
  font-size: 0.68rem; font-weight: 600;
  padding: 0.2rem 0.55rem; border-radius: 9999px;
  background: #f1f5f9; color: #475569;
}
.profit-pill {
  font-size: 0.7rem; font-weight: 700;
  padding: 0.2rem 0.55rem; border-radius: 9999px;
  background: #e1f5ee; color: #0f6e56;
}

/* Empty & skeleton */
.empty-state { text-align: center; padding: 2.5rem 0; color: #94a3b8; }
.empty-icon { width: 36px; height: 36px; margin: 0 auto 0.6rem; display: block; opacity: 0.4; }
.empty-state p { font-size: 0.875rem; margin: 0; }
.skeleton-row {
  height: 68px; border-radius: 1.1rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%; animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>

<style>
/* Detail sheet — identik polanya dengan GameAccounts */
.detail-backdrop {
  position: fixed; inset: 0; z-index: 150;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  display: flex; align-items: flex-end; justify-content: center;
}
.detail-sheet {
  width: 100%; max-width: 480px; max-height: 85vh;
  overflow-y: auto; background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 0.75rem 1.25rem 1.5rem;
}
.detail-handle {
  width: 40px; height: 4px; border-radius: 9999px;
  background: #e2e8f0; margin: 0 auto 1rem;
}
.detail-header {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 0.9rem; border-bottom: 1px solid #f1f5f9;
}
.detail-avatar {
  width: 46px; height: 46px; border-radius: 0.9rem;
  background: #eeedfe; color: #534ab7;
  font-weight: 700; font-size: 0.95rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.detail-header-text { flex: 1; min-width: 0; }
.detail-name {
  font-size: 1.02rem; font-weight: 700; color: #0f172a; margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.detail-game { font-size: 0.8rem; color: #94a3b8; margin: 0.1rem 0 0; }

.status-badge {
  font-size: 0.68rem; font-weight: 600;
  padding: 0.25rem 0.65rem; border-radius: 9999px;
  flex-shrink: 0; text-transform: capitalize;
}
.status-sold { background: #f1f5f9; color: #475569; }

.detail-section {
  padding: 0.9rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.section-title {
  font-size: 0.75rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase;
  letter-spacing: 0.05em; margin: 0 0 0.55rem;
}
.detail-field {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0.38rem 0; gap: 1rem;
}
.detail-label { font-size: 0.8rem; color: #94a3b8; flex-shrink: 0; }
.detail-value {
  font-size: 0.875rem; font-weight: 600; color: #0f172a;
  text-align: right; word-break: break-all;
}
.detail-value-actions { display: flex; align-items: center; gap: 6px; min-width: 0; }
.icon-btn {
  border: none; background: #f1f5f9; color: #64748b;
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { background: #e1f5ee; color: #0f6e56; }

.method-badge {
  font-size: 0.68rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 9999px;
  background: #e1f5ee; color: #0f6e56; text-transform: capitalize;
}

.price-panel {
  margin: 0.9rem 0 0;
  background: #f8fafc; border-radius: 0.9rem;
  padding: 0.75rem 0.9rem;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.price-row {
  display: flex; align-items: center;
  justify-content: space-between; gap: 1rem;
}
.price-row-total {
  padding-top: 0.5rem; margin-top: 0.05rem;
  border-top: 1px solid #e2e8f0;
}
.price-row-total .detail-label { color: #64748b; font-weight: 600; }
.detail-profit { color: #0f6e56; }

.detail-close {
  width: 100%; margin-top: 1.1rem; height: 44px;
  border: none; border-radius: 0.9rem;
  background: #f1f5f9; color: #334155; font-weight: 600; cursor: pointer;
}
.detail-close:hover { background: #e2e8f0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="page-heading">
        <span class="eyebrow">Transaksi</span>
        <h2 class="page-title">Penjualan</h2>
        <p class="page-subtitle">Catat akun yang sudah terjual</p>
      </div>

      <!-- Form tambah penjualan -->
      <form @submit.prevent="createSale" class="form-card">
        <div class="form-card-header">
          <span class="form-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
          </span>
          <h3 class="form-card-title">Tambah penjualan</h3>
        </div>

        <div class="field">
          <label class="field-label" for="game_account_id">Akun game</label>
          <select id="game_account_id" v-model="form.game_account_id" class="field-input" required>
            <option value="">Pilih akun game</option>
            <option
              v-for="account in availableAccounts"
              :key="account.id"
              :value="account.id"
            >
              {{ account.account_name }} - {{ account.game_name }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="buyer_name">Nama pembeli</label>
            <input
              id="buyer_name"
              v-model="form.buyer_name"
              class="field-input"
              placeholder="cth. Budi Santoso"
              required
            />
          </div>

          <div class="field">
            <label class="field-label" for="sold_price">Harga jual</label>
            <div class="field-prefix">
              <span class="field-prefix-text">Rp</span>
              <input
                id="sold_price"
                v-model="form.sold_price"
                type="number"
                min="0"
                class="field-input field-input-prefixed"
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="payment_method">Metode bayar</label>
            <select id="payment_method" v-model="form.payment_method" class="field-input" required>
              <option value="">Pilih metode</option>
              <option value="direct">Direct</option>
              <option value="rekber">Rekber</option>
              <option value="cod">COD</option>
            </select>
          </div>

          <div class="field">
            <label class="field-label" for="sale_date">Tanggal</label>
            <input
              id="sale_date"
              v-model="form.sale_date"
              type="date"
              class="field-input"
              required
            />
          </div>
        </div>

        <transition name="msg-fade">
          <p v-if="message" class="form-message form-message-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>
            {{ message }}
          </p>
        </transition>
        <transition name="msg-fade">
          <p v-if="errorMessage" class="form-message form-message-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
            {{ errorMessage }}
          </p>
        </transition>

        <button type="submit" class="submit-btn" :disabled="submitting">
          <span v-if="!submitting">Simpan penjualan</span>
          <span v-else class="submit-loading">
            <span class="spinner"></span>
            Menyimpan...
          </span>
        </button>
      </form>

      <!-- Daftar penjualan -->
      <div class="sales-card">
        <div class="sales-header">
          <h3 class="sales-title">Riwayat penjualan</h3>
          <span class="sales-count" v-if="sales.length">{{ sales.length }}</span>
        </div>

        <div v-if="loading" class="space-y-2">
          <div class="skeleton-row"></div>
          <div class="skeleton-row"></div>
          <div class="skeleton-row"></div>
        </div>

        <div v-else-if="sales.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          <p>Belum ada penjualan tercatat.</p>
        </div>

        <transition-group name="list-item" tag="div" v-else>
          <div
            v-for="sale in sales"
            :key="sale.id"
            class="sale-block"
            :class="{ 'sale-block-open': expandedId === sale.id }"
          >
            <button
              type="button"
              class="sale-row"
              @click="toggleExpand(sale.id)"
              :aria-expanded="expandedId === sale.id"
            >
              <div class="sale-info">
                <div class="sale-avatar">
                  {{ (sale.GameAccount?.account_name || "AG").substring(0, 2).toUpperCase() }}
                </div>
                <div class="sale-text">
                  <p class="sale-name">{{ sale.GameAccount?.account_name || "Akun Game" }}</p>
                  <p class="sale-meta">{{ sale.transaction_no }} &bull; {{ sale.buyer_name }}</p>
                </div>
              </div>

              <div class="sale-right">
                <span class="payment-badge" :class="paymentBadgeClass(sale.payment_method)">
                  {{ paymentLabel(sale.payment_method) }}
                </span>
                <svg class="sale-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            <div class="sale-detail" v-show="expandedId === sale.id">
              <div class="detail-panel">
                <div class="detail-row">
                  <span class="detail-label">Harga jual</span>
                  <span class="detail-value">{{ formatRupiah(sale.sold_price) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Profit</span>
                  <span class="detail-value detail-value-profit">+{{ formatRupiah(sale.profit) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tanggal</span>
                  <span class="detail-value">{{ formatDate(sale.sale_date) }}</span>
                </div>
                <div class="detail-row" v-if="sale.GameAccount?.game_name">
                  <span class="detail-label">Game</span>
                  <span class="detail-value">{{ sale.GameAccount.game_name }}</span>
                </div>

                <button
                  type="button"
                  @click.stop="askRefundSale(sale)"
                  class="refund-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 1 0-15-6.7L3 13"/></svg>
                  Refund penjualan ini
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Modal konfirmasi refund -->
    <Teleport to="body">
      <transition name="confirm-fade">
        <div v-if="confirmRefund" class="confirm-backdrop" @click.self="cancelRefund">
          <div class="confirm-modal">
            <div class="confirm-icon confirm-icon-warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                <path d="M3 7v6h6"/><path d="M21 17a9 9 0 1 0-15-6.7L3 13"/>
              </svg>
            </div>
            <h3 class="confirm-title">Refund penjualan ini?</h3>
            <p class="confirm-sub">
              Penjualan ke <strong>{{ saleToRefund?.buyer_name }}</strong> akan dibatalkan dan akun
              <strong>{{ saleToRefund?.GameAccount?.account_name || "ini" }}</strong> akan dikembalikan ke status tersedia.
            </p>

            <div class="confirm-actions">
              <button class="confirm-btn confirm-btn-cancel" @click="cancelRefund">Batal</button>
              <button class="confirm-btn confirm-btn-warn" @click="confirmRefundAction" :disabled="refunding">
                <span v-if="!refunding">Refund</span>
                <span v-else class="spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import api from "../services/api";

const sales = ref([]);
const availableAccounts = ref([]);
const message = ref("");
const errorMessage = ref("");
const submitting = ref(false);
const loading = ref(false);
const expandedId = ref(null);

// Konfirmasi refund
const confirmRefund = ref(false);
const saleToRefund = ref(null);
const refunding = ref(false);

const form = ref({
  game_account_id: "",
  buyer_name: "",
  sold_price: "",
  payment_method: "",
  sale_date: new Date().toISOString().slice(0, 10),
});

const paymentLabels = {
  direct: "Direct",
  rekber: "Rekber",
  cod: "COD",
};

const paymentLabel = (value) => paymentLabels[value] || value || "-";

const paymentBadgeClass = (value) => {
  if (value === "rekber") return "payment-badge-rekber";
  if (value === "cod") return "payment-badge-cod";
  return "payment-badge-direct";
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

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const getSales = async () => {
  try {
    loading.value = true;
    const response = await api.get("/sales");
    sales.value = response.data.data || response.data;
  } finally {
    loading.value = false;
  }
};

const getAvailableAccounts = async () => {
  const response = await api.get("/accounts?status=available");
  availableAccounts.value = response.data.data || response.data;
};

const createSale = async () => {
  try {
    submitting.value = true;
    message.value = "";
    errorMessage.value = "";

    await api.post("/sales", form.value);

    message.value = "Penjualan berhasil dicatat";

    form.value = {
      game_account_id: "",
      buyer_name: "",
      sold_price: "",
      payment_method: "",
      sale_date: new Date().toISOString().slice(0, 10),
    };

    getSales();
    getAvailableAccounts();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Gagal mencatat penjualan";
  } finally {
    submitting.value = false;
  }
};

// Buka modal konfirmasi refund (dipanggil dari tombol "Refund penjualan ini")
function askRefundSale(sale) {
  saleToRefund.value = sale;
  confirmRefund.value = true;
}

function cancelRefund() {
  confirmRefund.value = false;
  saleToRefund.value = null;
}

async function confirmRefundAction() {
  if (!saleToRefund.value) return;
  try {
    refunding.value = true;
    await api.delete(`/sales/${saleToRefund.value.id}/refund`);
    confirmRefund.value = false;
    saleToRefund.value = null;
    expandedId.value = null;

    getSales();
    getAvailableAccounts();
  } finally {
    refunding.value = false;
  }
}

onMounted(() => {
  getSales();
  getAvailableAccounts();
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

/* Form card */
.form-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.form-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.1rem;
}
.form-card-icon {
  width: 28px;
  height: 28px;
  border-radius: 0.6rem;
  background: #e1f5ee;
  color: #0f6e56;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.form-card-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  margin: 0;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.field-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
}
.field-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  padding: 0.62rem 0.8rem;
  font-size: 0.875rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.field-input::placeholder {
  color: #b6c0cc;
}
.field-input:focus {
  outline: none;
  border-color: #1d9e75;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.12);
}
.field-prefix {
  position: relative;
  display: flex;
  align-items: center;
}
.field-prefix-text {
  position: absolute;
  left: 0.8rem;
  font-size: 0.875rem;
  color: #94a3b8;
  pointer-events: none;
}
.field-input-prefixed {
  padding-left: 2.1rem;
}

.form-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0;
}
.form-message-success { color: #0f6e56; }
.form-message-error { color: #993c1d; }

.submit-btn {
  width: 100%;
  background: #0d1321;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;
}
.submit-btn:hover:not(:disabled) {
  background: #16213e;
}
.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.submit-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sales list card */
.sales-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sales-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.sales-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  margin: 0;
}
.sales-count {
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

.skeleton-row {
  height: 56px;
  border-radius: 0.85rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  margin-bottom: 8px;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.sale-block {
  border-bottom: 1px solid #f1f5f9;
}
.sale-block:last-child {
  border-bottom: none;
}

.sale-row {
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
.sale-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.sale-text {
  min-width: 0;
}
.sale-avatar {
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
.sale-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sale-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 0.1rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sale-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.payment-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;
}
.payment-badge-direct { background: #e1f5ee; color: #0f6e56; }
.payment-badge-rekber { background: #e6f1fb; color: #0c447c; }
.payment-badge-cod { background: #faeeda; color: #854f0b; }

.sale-chevron {
  flex-shrink: 0;
  color: #cbd5e1;
  transition: transform 0.22s ease, color 0.22s ease;
}
.sale-block-open .sale-chevron {
  transform: rotate(180deg);
  color: #1d9e75;
}

.sale-detail {
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
.detail-value-profit {
  color: #0f6e56;
  font-weight: 700;
}

.refund-btn {
  margin-top: 0.3rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fff1ec;
  color: #993c1d;
  padding: 0.6rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease;
}
.refund-btn:hover {
  background: #f5c4b3;
}

.list-item-enter-active {
  transition: all 0.3s ease;
}
.list-item-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.msg-fade-enter-from,
.msg-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 380px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sale-chevron { transition: none; }
  .skeleton-row { animation: none; }
  .spinner { animation-duration: 1.4s; }
}
</style>

<style>
/* ===== Modal konfirmasi (centered, konsisten di seluruh app) ===== */
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirm-modal {
  width: 100%;
  max-width: 22rem;
  background: white;
  border-radius: 1.4rem;
  padding: 1.5rem 1.35rem 1.25rem;
  text-align: center;
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.35);
}

.confirm-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 0.9rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-icon-danger {
  background: #fff1f1;
  color: #b91c1c;
}
.confirm-icon-warn {
  background: #fff1ec;
  color: #c2410c;
}

.confirm-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.confirm-sub {
  margin: 0.4rem 0 1.25rem;
  font-size: 0.83rem;
  color: #64748b;
  line-height: 1.5;
}
.confirm-sub strong {
  color: #334155;
  font-weight: 700;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.confirm-btn {
  height: 42px;
  border-radius: 0.85rem;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.confirm-btn-cancel {
  background: #f1f5f9;
  color: #334155;
}
.confirm-btn-cancel:hover { background: #e2e8f0; }

.confirm-btn-danger {
  background: #dc2626;
  color: white;
}
.confirm-btn-danger:hover:not(:disabled) { background: #b91c1c; }
.confirm-btn-danger:disabled { opacity: 0.7; cursor: not-allowed; }

.confirm-btn-warn {
  background: #c2410c;
  color: white;
}
.confirm-btn-warn:hover:not(:disabled) { background: #9a3412; }
.confirm-btn-warn:disabled { opacity: 0.7; cursor: not-allowed; }

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-fade-enter-active .confirm-modal,
.confirm-fade-leave-active .confirm-modal {
  transition: transform 0.2s cubic-bezier(0.34, 1.2, 0.4, 1), opacity 0.2s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
.confirm-fade-enter-from .confirm-modal,
.confirm-fade-leave-to .confirm-modal {
  transform: scale(0.92);
  opacity: 0;
}
</style>
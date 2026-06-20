<template>
  <AdminLayout>
    <div class="space-y-4">

      <!-- Heading -->
      <div class="page-heading">
        <h2 class="page-title">Pengeluaran</h2>
        <p class="page-subtitle">Catat biaya tambahan bisnis kamu</p>
      </div>

      <!-- Form tambah — collapsible -->
      <div class="add-card">
        <button class="add-toggle" @click="showForm = !showForm">
          <span class="add-toggle-icon" :class="{ 'add-toggle-icon-open': showForm }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span>Tambah pengeluaran baru</span>
        </button>

        <Transition name="expand">
          <form v-if="showForm" @submit.prevent="createExpense" class="add-form">
            <input v-model="form.name" class="field-input" placeholder="Nama pengeluaran" />
            <input v-model="form.amount" type="number" class="field-input" placeholder="Jumlah biaya" />
            <input v-model="form.expense_date" type="date" class="field-input" />
            <textarea v-model="form.note" class="field-input field-textarea" placeholder="Catatan (opsional)"></textarea>

            <button type="submit" class="submit-btn" :disabled="saving">
              <span v-if="!saving">Simpan pengeluaran</span>
              <span v-else class="spinner"></span>
            </button>
          </form>
        </Transition>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="skeleton-row"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="expenses.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
        </svg>
        <p>Belum ada pengeluaran tercatat.</p>
      </div>

      <!-- List pengeluaran -->
      <div v-else class="space-y-2.5">
        <div
          v-for="expense in expenses"
          :key="expense.id"
          class="expense-row"
        >
          <div class="expense-main">
            <div class="expense-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
            </div>

            <div class="expense-info">
              <p class="expense-name">{{ expense.name }}</p>
              <p class="expense-date">{{ formatDate(expense.expense_date) }}</p>
            </div>

            <span class="expense-amount">{{ formatRupiah(expense.amount) }}</span>
          </div>

          <p v-if="expense.note" class="expense-note">{{ expense.note }}</p>

          <button class="delete-btn" @click="askDeleteExpense(expense)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Hapus
          </button>
        </div>
      </div>

    </div>

    <!-- Modal konfirmasi hapus pengeluaran -->
    <Teleport to="body">
      <transition name="confirm-fade">
        <div v-if="confirmDeleteExpense" class="confirm-backdrop" @click.self="cancelDeleteExpense">
          <div class="confirm-modal">
            <div class="confirm-icon confirm-icon-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <h3 class="confirm-title">Hapus pengeluaran ini?</h3>
            <p class="confirm-sub">
              <strong>{{ expenseToDelete?.name }}</strong> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>

            <div class="confirm-actions">
              <button class="confirm-btn confirm-btn-cancel" @click="cancelDeleteExpense">Batal</button>
              <button class="confirm-btn confirm-btn-danger" @click="confirmDeleteExpenseAction" :disabled="deleting">
                <span v-if="!deleting">Hapus</span>
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

const expenses = ref([]);
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);

// Konfirmasi hapus pengeluaran
const confirmDeleteExpense = ref(false);
const expenseToDelete = ref(null);
const deleting = ref(false);

const form = ref({
  name: "",
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
  note: "",
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

const getExpenses = async () => {
  try {
    loading.value = true;
    const response = await api.get("/expenses");
    expenses.value = response.data.data || response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createExpense = async () => {
  try {
    saving.value = true;
    await api.post("/expenses", form.value);
    form.value = {
      name: "",
      amount: "",
      expense_date: new Date().toISOString().slice(0, 10),
      note: "",
    };
    showForm.value = false;
    getExpenses();
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};

// Buka modal konfirmasi hapus (dipanggil dari tombol "Hapus" di setiap baris)
function askDeleteExpense(expense) {
  expenseToDelete.value = expense;
  confirmDeleteExpense.value = true;
}

function cancelDeleteExpense() {
  confirmDeleteExpense.value = false;
  expenseToDelete.value = null;
}

async function confirmDeleteExpenseAction() {
  if (!expenseToDelete.value) return;
  try {
    deleting.value = true;
    await api.delete(`/expenses/${expenseToDelete.value.id}`);
    confirmDeleteExpense.value = false;
    expenseToDelete.value = null;
    getExpenses();
  } catch (error) {
    console.error(error);
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  getExpenses();
});
</script>

<style scoped>
.page-heading { margin-bottom: 0.1rem; }
.page-title { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.15rem 0 0; }

/* Collapsible form */
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
  width: 26px;
  height: 26px;
  border-radius: 0.6rem;
  background: #e1f5ee;
  color: #0f6e56;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s, background 0.2s;
  flex-shrink: 0;
}
.add-toggle-icon-open {
  transform: rotate(45deg);
  background: #faece7;
  color: #993c1d;
}
.add-form {
  padding: 0 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
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
.field-textarea { resize: none; min-height: 70px; }
.submit-btn {
  height: 44px;
  border: none;
  border-radius: 0.85rem;
  background: #0d1321;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover { background: #1d9e75; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  display: inline-block;
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 600px; }

/* Expense row */
.expense-row {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.expense-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.expense-avatar {
  width: 40px;
  height: 40px;
  border-radius: 0.8rem;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.expense-info { flex: 1; min-width: 0; }
.expense-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expense-date { font-size: 0.75rem; color: #94a3b8; margin: 0.1rem 0 0; }
.expense-amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: #dc2626;
  flex-shrink: 0;
}
.expense-note {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.6rem;
  line-height: 1.5;
}
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 36px;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  background: white;
  color: #991b1b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.delete-btn:hover { background: #fff1f1; }

/* Empty & skeleton */
.empty-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #94a3b8;
}
.empty-icon {
  width: 36px; height: 36px;
  margin: 0 auto 0.6rem;
  display: block;
  opacity: 0.4;
}
.empty-state p { font-size: 0.875rem; margin: 0; }

.skeleton-row {
  height: 80px;
  border-radius: 1.1rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>

<style>
/* ===== Modal konfirmasi hapus (centered, konsisten di seluruh app) ===== */
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
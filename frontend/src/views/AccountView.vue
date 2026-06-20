<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="page-heading">
        <h2 class="page-title">Akun game</h2>
        <p class="page-subtitle">Kelola stok akun game kamu</p>
      </div>

      <!-- Search live, langsung jalan tanpa Enter -->
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama akun atau game..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">×</button>
      </div>

      <!-- Form tambah akun, collapsible biar nggak penuh layar -->
      <div class="add-card">
        <button class="add-toggle" @click="showForm = !showForm">
          <span class="add-toggle-icon" :class="{ 'add-toggle-icon-open': showForm }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span>Tambah akun baru</span>
        </button>

        <Transition name="expand">
          <form v-if="showForm" @submit.prevent="createAccount" class="add-form">
            <select v-model="form.game_name" class="field-input">
              <option value="">Pilih game</option>
              <option>Mobile Legends</option>
              <option>Free Fire</option>
              <option>PUBG Mobile</option>
              <option>Genshin Impact</option>
              <option>Valorant</option>
              <option>Roblox</option>
              <option>Other</option>
            </select>

            <input v-model="form.account_name" class="field-input" placeholder="Nama akun" />
            <input v-model="form.login_email" class="field-input" placeholder="Email login" />
            <input v-model="form.login_password" class="field-input" placeholder="Password login" />

            <div class="field-row">
              <input v-model="form.purchase_price" type="number" class="field-input" placeholder="Harga beli" />
              <input v-model="form.selling_price" type="number" class="field-input" placeholder="Harga jual target" />
            </div>

            <textarea v-model="form.note" class="field-input field-textarea" placeholder="Catatan (opsional)"></textarea>

            <button type="submit" class="submit-btn" :disabled="saving">
              <span v-if="!saving">Simpan akun</span>
              <span v-else class="spinner"></span>
            </button>
          </form>
        </Transition>
      </div>

      <!-- List akun -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="skeleton-row"></div>
      </div>

      <div v-else-if="accounts.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
        <p>{{ searchQuery ? "Tidak ada akun yang cocok." : "Belum ada akun." }}</p>
      </div>

      <div v-else class="space-y-2.5">
        <button
          v-for="account in accounts"
          :key="account.id"
          class="account-row"
          @click="openDetail(account)"
        >
          <div class="account-avatar">
            {{ account.account_name?.substring(0, 2).toUpperCase() || "AG" }}
          </div>

          <div class="account-info">
            <p class="account-name">{{ account.account_name }}</p>
            <p class="account-game">{{ account.game_name }}</p>
          </div>

          <span class="status-badge" :class="statusClass(account.status)">
            {{ account.status }}
          </span>
        </button>
      </div>
    </div>

    <!-- Detail akun via modal, bukan view baru -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="selectedAccount" class="detail-backdrop" @click.self="closeDetail">
          <div class="detail-sheet">
            <div class="detail-handle"></div>

            <div class="detail-header">
              <div class="detail-avatar">
                {{ selectedAccount.account_name?.substring(0, 2).toUpperCase() || "AG" }}
              </div>
              <div class="detail-header-text">
                <h3 class="detail-name">{{ selectedAccount.account_name }}</h3>
                <p class="detail-game">{{ selectedAccount.game_name }}</p>
              </div>
              <span class="status-badge" :class="statusClass(selectedAccount.status)">
                {{ selectedAccount.status }}
              </span>
            </div>

            <!-- Notif sold -->
            <div v-if="isSold" class="sold-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>Akun ini sudah terjual. Edit dan hapus tidak tersedia.</span>
            </div>

            <!-- Aksi cepat -->
            <div class="quick-actions" :class="{ 'quick-actions-sold': isSold }">
              <!-- Edit -->
              <button
                class="quick-action"
                :class="{ 'quick-action-disabled': isSold }"
                :disabled="isSold"
                @click="toggleEdit"
              >
                <i class="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </i>
                {{ editMode ? "Batal edit" : "Edit" }}
              </button>

              <!-- Hapus -->
              <button
                class="quick-action quick-action-danger"
                :class="{ 'quick-action-disabled': isSold }"
                :disabled="isSold"
                @click="askDeleteAccount"
              >
                <i class="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </i>
                Hapus akun
              </button>

              <!-- Tandai problem — hanya kalau bukan sold, span 2 kolom -->
              <button
                v-if="!isSold"
                class="quick-action quick-action-warn quick-action-full"
                @click="markProblem"
              >
                <i class="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
                  </svg>
                </i>
                {{ selectedAccount.status === "problem" ? "Tandai tersedia" : "Tandai problem" }}
              </button>
            </div>

            <!-- Mode edit ringkas -->
            <div v-if="editMode && !isSold" class="edit-panel">
              <input v-model="editForm.account_name" class="field-input" placeholder="Nama akun" />
              <div class="field-row">
                <input v-model="editForm.purchase_price" type="number" class="field-input" placeholder="Harga beli" />
                <input v-model="editForm.selling_price" type="number" class="field-input" placeholder="Target jual" />
              </div>
              <button class="submit-btn" @click="saveEdit" :disabled="savingEdit">
                <span v-if="!savingEdit">Simpan perubahan</span>
                <span v-else class="spinner"></span>
              </button>
            </div>

            <template v-if="!editMode || isSold">
              <!-- Kredensial dengan aksi salin -->
              <div class="detail-section">
                <div class="detail-field">
                  <span class="detail-label">Email login</span>
                  <span class="detail-value-actions">
                    <span class="detail-value">{{ selectedAccount.login_email || "-" }}</span>
                    <button
                      v-if="selectedAccount.login_email"
                      class="icon-btn"
                      @click="copyText(selectedAccount.login_email, 'email')"
                      aria-label="Salin email"
                    >
                      <svg v-if="copiedField !== 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>
                    </button>
                  </span>
                </div>

                <div class="detail-field">
                  <span class="detail-label">Password login</span>
                  <span class="detail-value-actions">
                    <span class="detail-value">{{ showPassword ? (selectedAccount.login_password || "-") : "••••••••" }}</span>
                    <button class="icon-btn" @click="showPassword = !showPassword" aria-label="Tampilkan password">
                      <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.5A10.6 10.6 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-2.6 3.4M6.6 6.6A13.7 13.7 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 4-.8"/></svg>
                    </button>
                    <button
                      v-if="selectedAccount.login_password"
                      class="icon-btn"
                      @click="copyText(selectedAccount.login_password, 'password')"
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
                  <span class="detail-value">{{ formatRupiah(selectedAccount.purchase_price) }}</span>
                </div>
                <div class="price-row">
                  <span class="detail-label">Target jual</span>
                  <span class="detail-value">{{ formatRupiah(selectedAccount.selling_price) }}</span>
                </div>
                <div class="price-row price-row-total">
                  <span class="detail-label">Estimasi profit</span>
                  <span class="detail-value detail-profit">
                    {{ formatRupiah((selectedAccount.selling_price || 0) - (selectedAccount.purchase_price || 0)) }}
                  </span>
                </div>
              </div>

              <div v-if="selectedAccount.note" class="detail-note">
                <span class="detail-label">Catatan</span>
                <p>{{ selectedAccount.note }}</p>
              </div>
            </template>

            <button class="detail-close" @click="closeDetail">Tutup</button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Modal konfirmasi hapus akun -->
    <Teleport to="body">
      <transition name="confirm-fade">
        <div v-if="confirmDeleteAccount" class="confirm-backdrop" @click.self="cancelDeleteAccount">
          <div class="confirm-modal">
            <div class="confirm-icon confirm-icon-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <h3 class="confirm-title">Hapus akun ini?</h3>
            <p class="confirm-sub">
              <strong>{{ accountToDelete?.account_name }}</strong> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>

            <div class="confirm-actions">
              <button class="confirm-btn confirm-btn-cancel" @click="cancelDeleteAccount">Batal</button>
              <button class="confirm-btn confirm-btn-danger" @click="confirmDeleteAccountAction" :disabled="deleting">
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
import { onMounted, ref, watch, computed } from "vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import api from "../services/api";

const accounts = ref([]);
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);
const searchQuery = ref("");

const selectedAccount = ref(null);
const showPassword = ref(false);
const copiedField = ref("");
const editMode = ref(false);
const savingEdit = ref(false);
const editForm = ref({ account_name: "", purchase_price: "", selling_price: "" });

// Konfirmasi hapus akun
const confirmDeleteAccount = ref(false);
const accountToDelete = ref(null);
const deleting = ref(false);

const form = ref({
  game_name: "",
  account_name: "",
  login_email: "",
  login_password: "",
  purchase_price: "",
  selling_price: "",
  status: "available",
  note: "",
});

// Computed: true kalau akun yang dibuka berstatus sold
const isSold = computed(() => selectedAccount.value?.status === "sold");

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

function statusClass(status) {
  if (status === "sold") return "status-sold";
  if (status === "problem") return "status-problem";
  return "status-available";
}

const getAccounts = async () => {
  try {
    loading.value = true;
    const response = await api.get("/accounts", {
      params: { search: searchQuery.value || "" },
    });
    accounts.value = response.data.data || response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createAccount = async () => {
  try {
    saving.value = true;
    await api.post("/accounts", form.value);

    form.value = {
      game_name: "",
      account_name: "",
      login_email: "",
      login_password: "",
      purchase_price: "",
      selling_price: "",
      status: "available",
      note: "",
    };

    showForm.value = false;
    getAccounts();
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};

function openDetail(account) {
  selectedAccount.value = account;
  showPassword.value = false;
  copiedField.value = "";
  editMode.value = false;
}

function closeDetail() {
  selectedAccount.value = null;
  editMode.value = false;
}

function toggleEdit() {
  if (isSold.value) return;
  if (!editMode.value) {
    editForm.value = {
      account_name: selectedAccount.value.account_name,
      purchase_price: selectedAccount.value.purchase_price,
      selling_price: selectedAccount.value.selling_price,
    };
  }
  editMode.value = !editMode.value;
}

async function saveEdit() {
  try {
    savingEdit.value = true;
    await api.put(`/accounts/${selectedAccount.value.id}`, editForm.value);
    selectedAccount.value = { ...selectedAccount.value, ...editForm.value };
    editMode.value = false;
    getAccounts();
  } catch (error) {
    console.error(error);
  } finally {
    savingEdit.value = false;
  }
}

async function markProblem() {
  const nextStatus = selectedAccount.value.status === "problem" ? "available" : "problem";
  try {
    await api.put(`/accounts/${selectedAccount.value.id}`, { status: nextStatus });
    selectedAccount.value = { ...selectedAccount.value, status: nextStatus };
    getAccounts();
  } catch (error) {
    console.error(error);
  }
}

// Buka modal konfirmasi hapus (dipanggil dari tombol "Hapus akun" di detail sheet)
function askDeleteAccount() {
  if (isSold.value) return;
  accountToDelete.value = selectedAccount.value;
  confirmDeleteAccount.value = true;
}

function cancelDeleteAccount() {
  confirmDeleteAccount.value = false;
  accountToDelete.value = null;
}

async function confirmDeleteAccountAction() {
  if (!accountToDelete.value) return;
  try {
    deleting.value = true;
    await api.delete(`/accounts/${accountToDelete.value.id}`);
    confirmDeleteAccount.value = false;
    accountToDelete.value = null;
    closeDetail();
    getAccounts();
  } catch (error) {
    console.error(error);
  } finally {
    deleting.value = false;
  }
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

// Live search dengan debounce kecil
let debounceTimer = null;
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    getAccounts();
  }, 350);
});

onMounted(() => {
  getAccounts();
});
</script>

<style scoped>
.page-heading { margin-bottom: 0.1rem; }
.page-title { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.15rem 0 0; }

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  height: 46px;
  padding: 0 0.85rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-wrap:focus-within {
  border-color: #1d9e75;
  box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.12);
}
.search-icon { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: none;
  min-width: 0;
}
.search-clear {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Collapsible add form */
.add-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
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
}
.field-input:focus {
  border-color: #1d9e75;
}
.field-textarea {
  resize: none;
  min-height: 70px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}
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
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 600px;
}

/* List akun */
.account-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.85rem 1rem;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1.1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s;
}
.account-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.12);
}
.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 0.8rem;
  background: #eeedfe;
  color: #534ab7;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.account-info { flex: 1; min-width: 0; }
.account-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.account-game { font-size: 0.75rem; color: #94a3b8; margin: 0.1rem 0 0; }

.status-badge {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  flex-shrink: 0;
  text-transform: capitalize;
}
.status-available { background: #e1f5ee; color: #0f6e56; }
.status-sold { background: #f1f5f9; color: #475569; }
.status-problem { background: #faece7; color: #993c1d; }

.empty-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #94a3b8;
}
.empty-icon {
  width: 36px; height: 36px; margin: 0 auto 0.6rem; display: block; opacity: 0.5;
}
.empty-state p { font-size: 0.875rem; margin: 0; }

.skeleton-row {
  height: 68px;
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
/* Detail sheet (teleported) */
.detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.detail-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 0.75rem 1.25rem 1.5rem;
}
.detail-handle {
  width: 40px;
  height: 4px;
  border-radius: 9999px;
  background: #e2e8f0;
  margin: 0 auto 1rem;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}
.detail-avatar {
  width: 46px;
  height: 46px;
  border-radius: 0.9rem;
  background: #eeedfe;
  color: #534ab7;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-header-text { flex: 1; min-width: 0; }
.detail-name {
  font-size: 1.02rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detail-game { font-size: 0.8rem; color: #94a3b8; margin: 0.1rem 0 0; }

/* Notif sold */
.sold-notice {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0.75rem 0 0;
  padding: 0.6rem 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.78rem;
  color: #64748b;
}

/* Aksi cepat */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.55rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.quick-action:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.quick-action-icon {
  display: flex;
  align-items: center;
  font-style: normal;
}
.quick-action-warn {
  color: #993c1d;
  border-color: #f5c4b3;
}
.quick-action-warn:hover:not(:disabled) {
  background: #fff1ec;
}
.quick-action-danger {
  color: #991b1b;
  border-color: #fecaca;
}
.quick-action-danger:hover:not(:disabled) {
  background: #fff1f1;
}
/* Span 2 kolom untuk tombol "Tandai problem" */
.quick-action-full {
  grid-column: span 2;
}
/* Disabled state saat sold */
.quick-action-disabled {
  opacity: 0.35;
  cursor: not-allowed !important;
  pointer-events: none;
}

/* Edit ringkas */
.edit-panel {
  padding: 0.9rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.detail-section {
  padding: 0.9rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0;
  gap: 1rem;
}
.detail-label { font-size: 0.8rem; color: #94a3b8; flex-shrink: 0; }
.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  text-align: right;
  word-break: break-all;
}
.detail-value-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.icon-btn {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}
.icon-btn:hover {
  background: #e1f5ee;
  color: #0f6e56;
}

/* Ringkasan harga */
.price-panel {
  margin: 0.9rem 0 0;
  background: #f8fafc;
  border-radius: 0.9rem;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.price-row-total {
  padding-top: 0.5rem;
  margin-top: 0.05rem;
  border-top: 1px solid #e2e8f0;
}
.price-row-total .detail-label {
  color: #64748b;
  font-weight: 600;
}
.detail-profit { color: #0f6e56; }

.detail-note {
  padding: 0.9rem 0 0;
}
.detail-note p {
  font-size: 0.85rem;
  color: #334155;
  margin: 0.4rem 0 0;
  line-height: 1.5;
}

.detail-close {
  width: 100%;
  margin-top: 1.1rem;
  height: 44px;
  border: none;
  border-radius: 0.9rem;
  background: #f1f5f9;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
}
.detail-close:hover { background: #e2e8f0; }

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

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
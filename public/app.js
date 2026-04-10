/* ============================================================
   Punto de Venta Rewards — Mobile-First App v6
   ============================================================ */

/* ---------- 1. Constants & State ---------- */
const storageKey = "sales-program-token";
const roleKey = "sales-program-role";
const languageKey = "sales-program-language";

let deferredInstallPrompt = null;
let currentLanguage = localStorage.getItem(languageKey) || "es";
let latestDashboard = null;
let latestAdminDashboard = null;
let adminStoreQuery = "";
let activeStoreTab = "storeHomeTab";
let activeAdminTab = "adminOverviewTab";
let adminCurrentPage = 1;
let adminPageSize = 20;
let selectedAdminStoreCode = "";
let cachedAllStoreItems = null;

/* ---------- 2. DOM References ---------- */
const $ = (id) => document.getElementById(id);

const loginScreen = $("loginScreen");
const appShell = $("appShell");
const storeApp = $("storeApp");
const adminApp = $("adminApp");
const loginForm = $("loginForm");
const loginBtn = $("loginBtn");
const codeInput = $("codeInput");
const passwordInput = $("passwordInput");
const authStatus = $("authStatus");
const installBtn = $("installBtn");
const toastContainer = $("toastContainer");

/* Store DOM */
const storeName = $("storeName");
const storeMeta = $("storeMeta");
const totalReward = $("totalReward");
const totalRewardMeta = $("totalRewardMeta");
const todayTotal = $("todayTotal");
const todayDate = $("todayDate");
const cumulativeTotal = $("cumulativeTotal");
const cumulativeMeta = $("cumulativeMeta");
const achievedReward = $("achievedReward");
const achievedLevel = $("achievedLevel");
const achCardReached = $("achCardReached");
const nextReward = $("nextReward");
const nextLevel = $("nextLevel");
const updatedAt = $("updatedAt");
const levelsGrid = $("levelsGrid");
const categoriesGrid = $("categoriesGrid");
const historyGrid = $("historyGrid");
const dashboardStatus = $("dashboardStatus");
const refreshBtn = $("refreshBtn");
const logoutBtn = $("logoutBtn");
const pullIndicator = $("pullIndicator");
const storeContent = $("storeContent");

/* Admin DOM */
const adminNameEl = $("adminName");
const adminMeta = $("adminMeta");
const adminTotalReward = $("adminTotalReward");
const adminTotalRewardMeta = $("adminTotalRewardMeta");
const adminStoresCount = $("adminStoresCount");
const adminStoresMeta = $("adminStoresMeta");
const adminTodayTotal = $("adminTodayTotal");
const adminTodayMeta = $("adminTodayMeta");
const adminCumulativeTotal = $("adminCumulativeTotal");
const adminCumulativeMeta = $("adminCumulativeMeta");
const adminAggregateCategoriesGrid = $("adminAggregateCategoriesGrid");
const adminAggregateLevelsGrid = $("adminAggregateLevelsGrid");
const adminStoresTableBody = $("adminStoresTableBody");
const adminPaginationInfo = $("adminPaginationInfo");
const adminPrevPageBtn = $("adminPrevPageBtn");
const adminNextPageBtn = $("adminNextPageBtn");
const adminPageSizeSelect = $("adminPageSizeSelect");
const adminRefreshBtn = $("adminRefreshBtn");
const exportBtn = $("exportBtn");
const adminLogoutBtn = $("adminLogoutBtn");
const storeSearchInput = $("storeSearchInput");
const storeSelector = $("storeSelector");
const adminStoreDetail = $("adminStoreDetail");

/* ---------- 3. Translations ---------- */
const translations = {
  es: {
    htmlLang: "es",
    title: "Programa Punto de Venta",
    heroSubtitle: "Sigue resultados diarios, metas por tipo de línea, niveles dinámicos y panel administrador para reportes.",
    installBtn: "Instalar app en Android",
    loginTitle: "Ingreso del sistema",
    loginText: "Use el código del punto de venta o el usuario administrador. La contraseña es entregada por el sistema.",
    codeLabel: "Usuario o código",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Ingrese la contraseña",
    loginBtn: "Entrar",
    dashboardEyebrow: "Dashboard diario",
    adminEyebrow: "Panel administrador",
    defaultStoreName: "Punto de venta",
    defaultAdminName: "Administrador",
    refreshBtn: "Actualizar datos",
    exportBtn: "Exportar Excel",
    logoutBtn: "Cerrar sesión",
    todayTotalLabel: "Resultado de hoy",
    cumulativeTotalLabel: "Acumulado al día",
    totalRewardLabel: "Premio total del mes",
    achievedRewardLabel: "Premio ya logrado",
    achievedRewardEmpty: "Sin logro",
    achievedRewardEmptyNote: "El punto de venta aún no alcanza un nivel de premio.",
    nextRewardLabel: "Siguiente meta",
    levelSectionTitle: "Avance de niveles",
    levelSectionText: "Cada nivel solo se completa cuando los 4 tipos de línea cumplen sus metas del nivel.",
    categorySectionTitle: "4 tipos de línea y metas",
    categoryNames: {
      prepaid_new_line: "Prepago New Line",
      prepaid_portabilidad: "Prepago Portabilidad",
      postpaid_new_line: "Postpago New Line",
      postpaid_portabilidad: "Postpago Portabilidad"
    },
    shortNames: {
      prepaid_new_line: "Pre NL",
      prepaid_portabilidad: "Pre Porta",
      postpaid_new_line: "Post NL",
      postpaid_portabilidad: "Post Porta"
    },
    historySectionTitle: "Resultados últimos 7 días",
    historySectionText: "Total de líneas por día.",
    todayDatePrefix: "Fecha:",
    cumulativeMeta: ({ target, progress }) => `Meta ${target} • ${progress}`,
    totalRewardMeta: ({ levelReward, categoryRewardTotal, monthLabel }) =>
      `Nivel ${levelReward} • Líneas ${categoryRewardTotal} • ${monthLabel}`,
    monthLabel: ({ month, year }) => `${month}/${year}`,
    achievedLevelDone: ({ label }) => `${label} completado.`,
    nextLevelWaiting: ({ label }) => `${label}: esperando metas.`,
    nextLevelMissing: ({ label, missing }) => `${label}: ${missing}`,
    nextLevelMax: "Todos los niveles superados.",
    levelDone: "Logrado",
    levelNotDone: ({ progress }) => progress,
    levelFootDone: ({ label, reward }) => `${label} completado. Premio ${reward}.`,
    levelFootPending: "Completa todas las metas para alcanzar este nivel.",
    requirementDone: "✓",
    categoryRewardLabel: "Premio",
    categoryReached: "Meta lograda",
    categoryNotReached: ({ progress }) => progress,
    statToday: "Hoy",
    statTarget: "Meta",
    statCumulative: "Acum.",
    statRemaining: "Falta",
    categoryFootDone: ({ reward }) => `Meta cumplida. Premio ${reward}.`,
    categoryFootPending: ({ remaining }) => `Faltan ${remaining} para la meta.`,
    rewardNotConfigured: "Sin premio",
    updatedAt: ({ value }) => `Actualizado ${value}`,
    historyEmpty: "Sin datos en 7 días.",
    dashboardSynced: "Datos sincronizados.",
    dashboardLoading: "Sincronizando...",
    adminDashboardSynced: "Panel sincronizado.",
    adminDashboardLoading: "Sincronizando panel...",
    loginLoading: "Ingresando...",
    logoutDone: "Sesión cerrada.",
    authInvalid: "Sesión no válida.",
    unsupportedRequest: "No se pudo procesar.",
    authError: "Error al ingresar.",
    missingFields: "Ingrese usuario y contraseña.",
    countLineSingular: "Línea",
    countLinePlural: "Líneas",
    adminTotalRewardLabel: "Premio total de todos los puntos",
    adminStoresCountLabel: "Puntos de venta",
    adminTodayTotalLabel: "Resultado de hoy",
    adminCumulativeTotalLabel: "Acumulado total",
    adminTotalRewardMeta: ({ levelReward, categoryReward, monthLabel }) =>
      `Niveles ${levelReward} • Líneas ${categoryReward} • ${monthLabel}`,
    adminStoresMeta: ({ storesCount }) => `${storesCount} puntos en el mes.`,
    adminTodayMeta: ({ updatedAt }) => `Última: ${updatedAt}`,
    adminCumulativeMeta: ({ target, progress }) => `Meta ${target} • ${progress}`,
    adminStoreSectionTitle: "Detalle por punto de venta",
    adminStoreSectionText: "Seleccione un punto para ver metas y premio.",
    adminAggregateCategoryTitle: "Consolidado por tipo de línea",
    adminAggregateCategoryText: "Resumen de líneas y metas de todos los puntos.",
    adminAggregateLevelTitle: "Consolidado por niveles",
    adminAggregateLevelText: "Avance acumulado y puntos que lograron cada nivel.",
    adminStoresTableTitle: "Todos los puntos de venta",
    adminStoresTableText: "Cumplimiento y premio por punto.",
    adminPageSizeLabel: "Filas",
    paginationPrev: "Anterior",
    paginationNext: "Siguiente",
    paginationInfo: ({ start, end, total, page, pages }) =>
      `${start}-${end} de ${total} • Pág ${page}/${pages}`,
    tableCode: "Código",
    tableName: "Punto",
    tableArea: "Zona",
    tableReward: "Premio",
    tableProgress: "Avance",
    tableLevel: "Nivel",
    adminStoreDetailTitle: ({ name, code }) => `${name} • ${code}`,
    adminStoreDetailMeta: ({ area }) => area || "Sin zona",
    adminAggregateReachedStores: ({ count }) => `${count} puntos logrados`,
    adminAggregateLevelFoot: ({ reached, total }) => `${reached}/${total} puntos lograron este nivel.`,
    adminNoStores: "Sin puntos de venta.",
    adminNoStoreMatch: "No encontrado.",
    adminStorePrompt: "Ingrese código para ver detalle.",
    adminStoreSearchLoading: "Buscando...",
    adminStoreDetailLoading: "Cargando detalle...",
    exportLoading: "Generando Excel...",
    exportDone: "Excel descargado.",
    exportFilename: ({ monthKey }) => `reporte-pdv-${monthKey}.xlsx`,
    storeSearchLabel: "Buscar por código",
    storeSelectorLabel: "Punto de venta",
    pullRefresh: "Actualizando...",
    navHome: "Inicio",
    navLevels: "Niveles",
    navLines: "Líneas",
    navMore: "Más",
    navOverview: "Resumen",
    navStores: "Puntos",
    moreLangTitle: "Idioma",
    moreLangLabel: "Seleccionar idioma",
    moreActionsTitle: "Acciones",
    moreInstall: "Instalar app"
  },
  vi: {
    htmlLang: "vi",
    title: "Programa Punto de Venta",
    heroSubtitle: "Theo dõi kết quả ngày, chỉ tiêu theo thuê bao, mức thưởng động và panel quản trị xuất báo cáo.",
    installBtn: "Cài app trên Android",
    loginTitle: "Đăng nhập hệ thống",
    loginText: "Dùng mã điểm bán hoặc user admin. Mật khẩu do hệ thống cấp.",
    codeLabel: "User hoặc mã điểm bán",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    loginBtn: "Đăng nhập",
    dashboardEyebrow: "Dashboard ngày",
    adminEyebrow: "Panel quản trị",
    defaultStoreName: "Điểm bán",
    defaultAdminName: "Quản trị",
    refreshBtn: "Làm mới dữ liệu",
    exportBtn: "Xuất Excel",
    logoutBtn: "Đăng xuất",
    todayTotalLabel: "Kết quả hôm nay",
    cumulativeTotalLabel: "Luỹ kế đến ngày",
    totalRewardLabel: "Tổng số tiền thưởng",
    achievedRewardLabel: "Thưởng đã đạt",
    achievedRewardEmpty: "Chưa đạt",
    achievedRewardEmptyNote: "Điểm bán chưa chạm mức thưởng nào.",
    nextRewardLabel: "Mốc kế tiếp",
    levelSectionTitle: "Tiến độ các mức",
    levelSectionText: "Mỗi mức chỉ hoàn thành khi cả 4 loại thuê bao đều đạt.",
    categorySectionTitle: "4 loại thuê bao",
    categoryNames: {
      prepaid_new_line: "Trả trước New Line",
      prepaid_portabilidad: "Trả trước Portabilidad",
      postpaid_new_line: "Trả sau New Line",
      postpaid_portabilidad: "Trả sau Portabilidad"
    },
    shortNames: {
      prepaid_new_line: "Pre NL",
      prepaid_portabilidad: "Pre Porta",
      postpaid_new_line: "Post NL",
      postpaid_portabilidad: "Post Porta"
    },
    historySectionTitle: "Kết quả 7 ngày gần nhất",
    historySectionText: "Tổng số thuê bao theo ngày.",
    todayDatePrefix: "Ngày:",
    cumulativeMeta: ({ target, progress }) => `CT ${target} • ${progress}`,
    totalRewardMeta: ({ levelReward, categoryRewardTotal, monthLabel }) =>
      `Mức ${levelReward} • TB ${categoryRewardTotal} • ${monthLabel}`,
    monthLabel: ({ month, year }) => `T${month}/${year}`,
    achievedLevelDone: ({ label }) => `${label} đã đạt.`,
    nextLevelWaiting: ({ label }) => `${label}: đang chờ.`,
    nextLevelMissing: ({ label, missing }) => `${label}: ${missing}`,
    nextLevelMax: "Đã vượt toàn bộ mức.",
    levelDone: "Đã đạt",
    levelNotDone: ({ progress }) => progress,
    levelFootDone: ({ label, reward }) => `Đã đạt ${label}, nhận ${reward}.`,
    levelFootPending: "Cần hoàn thành đủ chỉ tiêu con.",
    requirementDone: "✓",
    categoryRewardLabel: "Thưởng",
    categoryReached: "Đạt chỉ tiêu",
    categoryNotReached: ({ progress }) => progress,
    statToday: "Ngày",
    statTarget: "CT",
    statCumulative: "LK",
    statRemaining: "Còn",
    categoryFootDone: ({ reward }) => `Đạt chỉ tiêu, nhận ${reward}.`,
    categoryFootPending: ({ remaining }) => `Cần thêm ${remaining}.`,
    rewardNotConfigured: "Chưa cấu hình",
    updatedAt: ({ value }) => `Cập nhật ${value}`,
    historyEmpty: "Chưa có dữ liệu 7 ngày.",
    dashboardSynced: "Đã đồng bộ.",
    dashboardLoading: "Đang đồng bộ...",
    adminDashboardSynced: "Panel đã đồng bộ.",
    adminDashboardLoading: "Đang đồng bộ panel...",
    loginLoading: "Đang đăng nhập...",
    logoutDone: "Đã đăng xuất.",
    authInvalid: "Phiên không hợp lệ.",
    unsupportedRequest: "Không thể xử lý.",
    authError: "Không thể đăng nhập.",
    missingFields: "Nhập user và mật khẩu.",
    countLineSingular: "TB",
    countLinePlural: "TB",
    adminTotalRewardLabel: "Tổng thưởng tất cả điểm bán",
    adminStoresCountLabel: "Số điểm bán",
    adminTodayTotalLabel: "Kết quả hôm nay",
    adminCumulativeTotalLabel: "Luỹ kế tổng",
    adminTotalRewardMeta: ({ levelReward, categoryReward, monthLabel }) =>
      `Mức ${levelReward} • TB ${categoryReward} • ${monthLabel}`,
    adminStoresMeta: ({ storesCount }) => `${storesCount} điểm bán trong tháng.`,
    adminTodayMeta: ({ updatedAt }) => `Lần cuối ${updatedAt}`,
    adminCumulativeMeta: ({ target, progress }) => `CT tổng ${target} • ${progress}`,
    adminStoreSectionTitle: "Chi tiết điểm bán",
    adminStoreSectionText: "Chọn điểm bán để xem chỉ tiêu.",
    adminAggregateCategoryTitle: "Tổng hợp theo loại TB",
    adminAggregateCategoryText: "Tổng hợp tất cả điểm bán.",
    adminAggregateLevelTitle: "Tổng hợp theo mức",
    adminAggregateLevelText: "Tiến độ cộng gộp và số điểm bán đạt.",
    adminStoresTableTitle: "Tất cả điểm bán",
    adminStoresTableText: "Mức hoàn thành và thưởng.",
    adminPageSizeLabel: "Số dòng",
    paginationPrev: "Trước",
    paginationNext: "Sau",
    paginationInfo: ({ start, end, total, page, pages }) =>
      `${start}-${end}/${total} • Trang ${page}/${pages}`,
    tableCode: "Mã",
    tableName: "Điểm bán",
    tableArea: "KV",
    tableReward: "Thưởng",
    tableProgress: "TĐ",
    tableLevel: "Mức",
    adminStoreDetailTitle: ({ name, code }) => `${name} • ${code}`,
    adminStoreDetailMeta: ({ area }) => area || "Chưa có KV",
    adminAggregateReachedStores: ({ count }) => `${count} điểm đạt`,
    adminAggregateLevelFoot: ({ reached, total }) => `${reached}/${total} điểm đạt mức này.`,
    adminNoStores: "Chưa có điểm bán.",
    adminNoStoreMatch: "Không tìm thấy.",
    adminStorePrompt: "Nhập mã điểm bán.",
    adminStoreSearchLoading: "Đang tìm...",
    adminStoreDetailLoading: "Đang tải...",
    exportLoading: "Đang tạo Excel...",
    exportDone: "Đã tải Excel.",
    exportFilename: ({ monthKey }) => `bao-cao-pdv-${monthKey}.xlsx`,
    storeSearchLabel: "Tìm theo mã",
    storeSelectorLabel: "Điểm bán",
    pullRefresh: "Đang làm mới...",
    navHome: "Trang chủ",
    navLevels: "Mức",
    navLines: "TB",
    navMore: "Thêm",
    navOverview: "Tổng hợp",
    navStores: "Điểm bán",
    moreLangTitle: "Ngôn ngữ",
    moreLangLabel: "Chọn ngôn ngữ",
    moreActionsTitle: "Hành động",
    moreInstall: "Cài app"
  }
};

const serverMessageMap = {
  "Vui lòng đăng nhập.": { es: "Inicie sesión.", vi: "Vui lòng đăng nhập." },
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.": { es: "Sesión expiró.", vi: "Phiên đã hết hạn." },
  "Sai mã điểm bán hoặc mật khẩu.": { es: "Usuario o contraseña incorrectos.", vi: "Sai user hoặc mật khẩu." },
  "Không thể tải dashboard.": { es: "No se pudo cargar.", vi: "Không thể tải." },
  "Không thể đăng nhập lúc này.": { es: "No se pudo iniciar sesión.", vi: "Không thể đăng nhập." },
  "Điểm bán không còn tồn tại trên hệ thống.": { es: "Punto ya no existe.", vi: "Điểm bán không còn." },
  "Vui lòng nhập mã điểm bán và mật khẩu.": { es: "Ingrese usuario y contraseña.", vi: "Nhập user và mật khẩu." },
  "Bạn không có quyền truy cập khu vực này.": { es: "Sin permisos.", vi: "Không có quyền." },
  "Không thể tải dashboard quản trị.": { es: "No se pudo cargar panel.", vi: "Không thể tải panel." },
  "Không thể xuất file Excel.": { es: "No se pudo exportar.", vi: "Không thể xuất." },
  "Không thể tìm kiếm điểm bán.": { es: "No se pudo buscar.", vi: "Không thể tìm." },
  "Không thể tải chi tiết điểm bán.": { es: "No se pudo cargar detalle.", vi: "Không thể tải chi tiết." },
  "Vui lòng nhập mã điểm bán.": { es: "Ingrese código.", vi: "Nhập mã điểm bán." }
};

/* ---------- 4. Utility Functions ---------- */
function getToken() { return localStorage.getItem(storageKey) || ""; }
function setToken(v) { v ? localStorage.setItem(storageKey, v) : localStorage.removeItem(storageKey); }
function getRole() { return localStorage.getItem(roleKey) || ""; }
function setRole(v) { v ? localStorage.setItem(roleKey, v) : localStorage.removeItem(roleKey); }
function clearSession() { setToken(""); setRole(""); }
function getLocale() { return currentLanguage === "es" ? "es-PE" : "vi-VN"; }

function t(key, params = {}) {
  const value = translations[currentLanguage][key];
  return typeof value === "function" ? value(params) : (value ?? key);
}

function localizeServerMessage(msg) {
  return serverMessageMap[msg]?.[currentLanguage] || msg;
}

function getCategoryLabel(id, fallback = "") {
  return translations[currentLanguage].categoryNames[id] || fallback;
}

function getShortLabel(id, fallback = "") {
  return translations[currentLanguage].shortNames[id] || fallback;
}

function getLevelLabel(label) {
  const m = String(label || "").match(/(\d+)/);
  if (!m) return label;
  return currentLanguage === "es" ? `Nivel ${m[1]}` : `Mức ${m[1]}`;
}

function formatNumber(v) {
  return new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 0 }).format(Number(v || 0));
}

function getCountUnit(v) {
  if (currentLanguage === "es") return Number(v || 0) === 1 ? t("countLineSingular") : t("countLinePlural");
  return t("countLinePlural");
}

function formatCount(v) { return `${formatNumber(v)} ${getCountUnit(v)}`; }

function formatCurrency(v) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(Number(v || 0));
}

function formatPercent(v) { return `${Math.round(Number(v || 0))}%`; }

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(getLocale(), { weekday: "short", day: "2-digit", month: "2-digit" }).format(d);
}

function formatTimestamp(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(getLocale(), { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(d);
}

function setTextById(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

/* ---------- 5. Toast System ---------- */
function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " is-error" : type === "success" ? " is-success" : ""}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

/* ---------- 6. View Management ---------- */
function showLogin() {
  loginScreen.classList.remove("hidden");
  appShell.classList.add("hidden");
  storeApp.classList.add("hidden");
  adminApp.classList.add("hidden");
}

function showStoreApp() {
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  storeApp.classList.remove("hidden");
  adminApp.classList.add("hidden");
}

function showAdminApp() {
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  storeApp.classList.add("hidden");
  adminApp.classList.remove("hidden");
}

/* ---------- 7. Tab Navigation ---------- */
function switchTab(navContainer, contentContainer, tabId) {
  // Update nav buttons
  navContainer.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  // Update panels
  contentContainer.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });
  // Scroll content to top
  const contentArea = contentContainer.querySelector(".content-area");
  if (contentArea) contentArea.scrollTop = 0;
}

function setupTabNavigation(navEl, contentEl, onSwitch) {
  navEl.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      switchTab(navEl, contentEl, tabId);
      if (onSwitch) onSwitch(tabId);
    });
  });
}

/* ---------- 8. Pull to Refresh ---------- */
function setupPullToRefresh(contentEl, indicatorEl, onRefresh) {
  let startY = 0;
  let pulling = false;

  contentEl.addEventListener("touchstart", (e) => {
    if (contentEl.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  contentEl.addEventListener("touchmove", (e) => {
    if (!pulling) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 60 && contentEl.scrollTop <= 0) {
      indicatorEl.classList.add("is-visible");
    }
  }, { passive: true });

  contentEl.addEventListener("touchend", () => {
    if (indicatorEl.classList.contains("is-visible")) {
      onRefresh();
      setTimeout(() => indicatorEl.classList.remove("is-visible"), 1500);
    }
    pulling = false;
  });
}

/* ---------- 9. Language ---------- */
function syncAllLangButtons() {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    const isEs = btn.id.toLowerCase().includes("es");
    const isVi = btn.id.toLowerCase().includes("vi");
    btn.classList.toggle("active", (isEs && currentLanguage === "es") || (isVi && currentLanguage === "vi"));
  });
}

function applyStaticTranslations() {
  document.documentElement.lang = t("htmlLang");
  document.title = t("title");

  setTextById("heroSubtitle", t("heroSubtitle"));
  setTextById("loginTitle", t("loginTitle"));
  setTextById("loginText", t("loginText"));
  setTextById("codeLabel", t("codeLabel"));
  setTextById("passwordLabel", t("passwordLabel"));
  passwordInput.placeholder = t("passwordPlaceholder");
  loginBtn.textContent = t("loginBtn");
  installBtn.textContent = t("installBtn");

  setTextById("dashboardEyebrow", t("dashboardEyebrow"));
  setTextById("totalRewardLabel", t("totalRewardLabel"));
  setTextById("todayTotalLabel", t("todayTotalLabel"));
  setTextById("cumulativeTotalLabel", t("cumulativeTotalLabel"));
  setTextById("achievedRewardLabel", t("achievedRewardLabel"));
  setTextById("nextRewardLabel", t("nextRewardLabel"));
  setTextById("levelSectionTitle", t("levelSectionTitle"));
  setTextById("levelSectionText", t("levelSectionText"));
  setTextById("categorySectionTitle", t("categorySectionTitle"));
  setTextById("historySectionTitle", t("historySectionTitle"));
  setTextById("historySectionText", t("historySectionText"));
  setTextById("refreshBtnText", t("refreshBtn"));
  setTextById("logoutBtnText", t("logoutBtn"));
  setTextById("pullText", t("pullRefresh"));

  setTextById("adminEyebrow", t("adminEyebrow"));
  setTextById("adminTotalRewardLabel", t("adminTotalRewardLabel"));
  setTextById("adminStoresCountLabel", t("adminStoresCountLabel"));
  setTextById("adminTodayTotalLabel", t("adminTodayTotalLabel"));
  setTextById("adminCumulativeTotalLabel", t("adminCumulativeTotalLabel"));
  setTextById("adminStoreSectionTitle", t("adminStoreSectionTitle"));
  setTextById("adminStoreSectionText", t("adminStoreSectionText"));
  setTextById("storeSearchLabel", t("storeSearchLabel"));
  setTextById("storeSelectorLabel", t("storeSelectorLabel"));
  setTextById("adminAggregateCategoryTitle", t("adminAggregateCategoryTitle"));
  setTextById("adminAggregateCategoryText", t("adminAggregateCategoryText"));
  setTextById("adminAggregateLevelTitle", t("adminAggregateLevelTitle"));
  setTextById("adminAggregateLevelText", t("adminAggregateLevelText"));
  setTextById("adminStoresTableTitle", t("adminStoresTableTitle"));
  setTextById("adminStoresTableText", t("adminStoresTableText"));
  setTextById("adminRefreshBtnText", t("refreshBtn"));
  setTextById("exportBtnText", t("exportBtn"));
  setTextById("adminLogoutBtnText", t("logoutBtn"));
  adminPrevPageBtn.textContent = t("paginationPrev");
  adminNextPageBtn.textContent = t("paginationNext");

  setTextById("adminTableHeadCode", t("tableCode"));
  setTextById("adminTableHeadName", t("tableName"));
  setTextById("adminTableHeadArea", t("tableArea"));
  setTextById("adminTableHeadReward", t("tableReward"));
  setTextById("adminTableHeadProgress", t("tableProgress"));
  setTextById("adminTableHeadLevel", t("tableLevel"));

  // Nav labels
  setTextById("navStoreHome", t("navHome"));
  setTextById("navStoreLevels", t("navLevels"));
  setTextById("navStoreLines", t("navLines"));
  setTextById("navStoreMore", t("navMore"));
  setTextById("navAdminOverview", t("navOverview"));
  setTextById("navAdminStores", t("navStores"));
  setTextById("navAdminMore", t("navMore"));

  // More panel
  setTextById("moreLangGroupTitle", t("moreLangTitle"));
  setTextById("moreLangLabel", t("moreLangLabel"));
  setTextById("moreActionsTitle", t("moreActionsTitle"));
  setTextById("moreInstallText", t("moreInstall"));
  setTextById("adminMoreLangTitle", t("moreLangTitle"));
  setTextById("adminMoreLangLabel", t("moreLangLabel"));
  setTextById("adminMoreActionsTitle", t("moreActionsTitle"));

  syncAllLangButtons();

  if (!latestDashboard) {
    todayTotal.textContent = formatCount(0);
    cumulativeTotal.textContent = formatCount(0);
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
  }
  if (!latestAdminDashboard) {
    adminNameEl.textContent = t("defaultAdminName");
    adminTotalReward.textContent = formatCurrency(0);
    adminStoresCount.textContent = "0";
    adminTodayTotal.textContent = formatCount(0);
    adminCumulativeTotal.textContent = formatCount(0);
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem(languageKey, lang);
  applyStaticTranslations();
  if (latestDashboard) renderStoreDashboard(latestDashboard);
  if (latestAdminDashboard) renderAdminDashboard(latestAdminDashboard);
}

/* ---------- 10. Card Builders ---------- */
function buildLevelCard(level, index = 0) {
  const card = document.createElement("article");
  card.className = `level-card${level.reached ? " is-reached" : ""}`;
  card.style.animationDelay = `${index * 0.06}s`;

  const reqs = level.requirements.map(r => `
    <div class="req-chip${r.reached ? " is-reached" : ""}">
      <div class="req-top">
        <span class="req-name">${getShortLabel(r.id, r.shortLabel)}</span>
        <span class="req-pct">${r.reached ? t("requirementDone") : formatPercent(r.progress)}</span>
      </div>
      <span class="req-val">${formatCount(r.actual)} / ${formatCount(r.target)}</span>
      <div class="req-bar"><div class="req-bar-fill" style="width:0%"></div></div>
    </div>
  `).join("");

  card.innerHTML = `
    <div class="level-head">
      <div class="level-info">
        <span class="level-name">${getLevelLabel(level.label)}</span>
        <strong class="level-reward">${formatCurrency(level.reward)}</strong>
      </div>
      <span class="level-badge">${level.reached ? t("levelDone") : t("levelNotDone", { progress: formatPercent(level.progress) })}</span>
    </div>
    <div class="req-grid">${reqs}</div>
    <div class="level-progress"><div class="level-progress-fill" style="width:0%"></div></div>
    <p class="level-foot">${level.reached ? t("levelFootDone", { label: getLevelLabel(level.label), reward: formatCurrency(level.reward) }) : t("levelFootPending")}</p>
  `;

  requestAnimationFrame(() => {
    card.querySelector(".level-progress-fill").style.width = `${Math.min(100, level.progress)}%`;
    card.querySelectorAll(".req-bar-fill").forEach((fill, i) => {
      fill.style.width = `${Math.min(100, level.requirements[i]?.progress || 0)}%`;
    });
  });

  return card;
}

function buildCategoryCard(cat, index = 0) {
  const card = document.createElement("article");
  card.className = `cat-card${cat.reached ? " is-reached" : ""}`;
  card.style.animationDelay = `${index * 0.06}s`;

  card.innerHTML = `
    <div class="cat-head">
      <div class="cat-info">
        <span class="cat-name">${getCategoryLabel(cat.id, cat.label)}</span>
        <strong class="cat-cumulative">${formatCount(cat.cumulative)}</strong>
      </div>
      <div class="cat-reward-box">
        <span class="cat-reward-label">${t("categoryRewardLabel")}</span>
        <strong class="cat-reward-amount">${cat.reward > 0 ? formatCurrency(cat.reward) : "S/ 0"}</strong>
      </div>
    </div>
    <div class="cat-badge-row">
      <span class="cat-badge">${cat.reached ? t("categoryReached") : t("categoryNotReached", { progress: formatPercent(cat.progress) })}</span>
    </div>
    <div class="cat-stats">
      <div class="cat-stat"><span class="cs-label">${t("statToday")}</span><strong class="cs-value">${formatNumber(cat.daily)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statTarget")}</span><strong class="cs-value">${formatNumber(cat.target)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statCumulative")}</span><strong class="cs-value">${formatNumber(cat.cumulative)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statRemaining")}</span><strong class="cs-value">${formatNumber(cat.remaining)}</strong></div>
    </div>
    <div class="cat-progress"><div class="cat-progress-fill" style="width:0%"></div></div>
    <p class="cat-foot">${cat.reached ? t("categoryFootDone", { reward: formatCurrency(cat.reward) }) : t("categoryFootPending", { remaining: formatCount(cat.remaining) })}</p>
  `;

  requestAnimationFrame(() => {
    card.querySelector(".cat-progress-fill").style.width = `${Math.min(100, cat.progress)}%`;
  });

  return card;
}

function buildAggregateCategoryCard(cat, index = 0) {
  const card = document.createElement("article");
  card.className = `cat-card${cat.reachedStores > 0 ? " is-reached" : ""}`;
  card.style.animationDelay = `${index * 0.06}s`;

  card.innerHTML = `
    <div class="cat-head">
      <div class="cat-info">
        <span class="cat-name">${getCategoryLabel(cat.id, cat.label)}</span>
        <strong class="cat-cumulative">${formatCount(cat.cumulative)}</strong>
      </div>
      <div class="cat-reward-box">
        <span class="cat-reward-label">${t("categoryRewardLabel")}</span>
        <strong class="cat-reward-amount">${formatCurrency(cat.rewardEarned)}</strong>
      </div>
    </div>
    <div class="cat-badge-row">
      <span class="cat-badge">${t("adminAggregateReachedStores", { count: cat.reachedStores })}</span>
    </div>
    <div class="cat-stats">
      <div class="cat-stat"><span class="cs-label">${t("statToday")}</span><strong class="cs-value">${formatNumber(cat.daily)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statTarget")}</span><strong class="cs-value">${formatNumber(cat.target)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statCumulative")}</span><strong class="cs-value">${formatNumber(cat.cumulative)}</strong></div>
      <div class="cat-stat"><span class="cs-label">${t("statRemaining")}</span><strong class="cs-value">${formatNumber(cat.remaining)}</strong></div>
    </div>
    <div class="cat-progress"><div class="cat-progress-fill" style="width:0%"></div></div>
    <p class="cat-foot">${t("categoryFootPending", { remaining: formatCount(cat.remaining) })}</p>
  `;

  requestAnimationFrame(() => {
    card.querySelector(".cat-progress-fill").style.width = `${Math.min(100, cat.progress)}%`;
  });

  return card;
}

function buildAggregateLevelCard(level, index = 0) {
  const card = document.createElement("article");
  card.className = `level-card${level.reachedStores > 0 ? " is-reached" : ""}`;
  card.style.animationDelay = `${index * 0.06}s`;

  const reqs = level.requirements.map(r => `
    <div class="req-chip${r.reached ? " is-reached" : ""}">
      <div class="req-top">
        <span class="req-name">${getShortLabel(r.id, r.shortLabel)}</span>
        <span class="req-pct">${formatPercent(r.progress)}</span>
      </div>
      <span class="req-val">${formatCount(r.actual)} / ${formatCount(r.target)}</span>
      <div class="req-bar"><div class="req-bar-fill" style="width:0%"></div></div>
    </div>
  `).join("");

  card.innerHTML = `
    <div class="level-head">
      <div class="level-info">
        <span class="level-name">${getLevelLabel(level.label)}</span>
        <strong class="level-reward">${formatCurrency(level.rewardEarned)}</strong>
      </div>
      <span class="level-badge">${formatPercent(level.progress)}</span>
    </div>
    <div class="req-grid">${reqs}</div>
    <div class="level-progress"><div class="level-progress-fill" style="width:0%"></div></div>
    <p class="level-foot">${t("adminAggregateLevelFoot", { reached: level.reachedStores, total: level.storesWithLevel })}</p>
  `;

  requestAnimationFrame(() => {
    card.querySelector(".level-progress-fill").style.width = `${Math.min(100, level.progress)}%`;
    card.querySelectorAll(".req-bar-fill").forEach((fill, i) => {
      fill.style.width = `${Math.min(100, level.requirements[i]?.progress || 0)}%`;
    });
  });

  return card;
}

/* ---------- 11. History Chart ---------- */
function renderHistory(container, history, todayKey) {
  container.innerHTML = "";
  if (!history.length) {
    container.innerHTML = `<div class="history-empty">${t("historyEmpty")}</div>`;
    container.style.minHeight = "60px";
    return;
  }

  container.style.minHeight = "";
  const maxVal = Math.max(...history.map(e => e.total), 1);

  history.forEach((entry, i) => {
    const bar = document.createElement("div");
    bar.className = `history-bar${entry.date === todayKey ? " is-today" : ""}`;
    const pct = Math.max(6, (entry.total / maxVal) * 100);

    bar.innerHTML = `
      <span class="hb-value">${formatNumber(entry.total)}</span>
      <div class="hb-track"><div class="hb-fill" style="height:0%"></div></div>
      <span class="hb-date">${new Intl.DateTimeFormat(getLocale(), { day: "2-digit", month: "2-digit" }).format(new Date(`${entry.date}T00:00:00`))}</span>
    `;

    container.appendChild(bar);

    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.querySelector(".hb-fill").style.height = `${pct}%`;
      }, i * 80);
    });
  });
}

/* ---------- 12. Store Dashboard Renderer ---------- */
function renderStoreDashboard(data) {
  latestDashboard = data;
  storeName.textContent = data.store.name || t("defaultStoreName");
  storeMeta.textContent = [data.store.code, data.store.area].filter(Boolean).join(" • ");

  totalReward.textContent = formatCurrency(data.rewardSummary.total);
  const [year, month] = (data.rewardSummary.monthKey || "").split("-");
  totalRewardMeta.textContent = t("totalRewardMeta", {
    levelReward: formatCurrency(data.rewardSummary.levelReward),
    categoryRewardTotal: formatCurrency(data.rewardSummary.categoryRewardTotal),
    monthLabel: t("monthLabel", { month, year })
  });

  todayTotal.textContent = formatCount(data.today.total);
  todayDate.textContent = `${t("todayDatePrefix")} ${formatDisplayDate(data.today.date)}`;
  cumulativeTotal.textContent = formatCount(data.cumulative.total);
  cumulativeMeta.textContent = t("cumulativeMeta", {
    target: formatCount(data.cumulative.target),
    progress: formatPercent(data.cumulative.progress)
  });

  if (data.achievements.achievedLevel) {
    achievedReward.textContent = formatCurrency(data.achievements.achievedLevel.reward);
    achievedLevel.textContent = t("achievedLevelDone", { label: getLevelLabel(data.achievements.achievedLevel.label) });
    achCardReached.classList.add("is-achieved");
  } else {
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
    achCardReached.classList.remove("is-achieved");
  }

  if (data.achievements.nextLevel) {
    nextReward.textContent = formatCurrency(data.achievements.nextLevel.reward);
    const missing = data.achievements.nextLevel.missingRequirements
      .slice(0, 2)
      .map(m => `${getShortLabel(m.id, m.shortLabel)} ${currentLanguage === "es" ? "falta" : "còn"} ${formatCount(m.remaining)}`)
      .join(" • ");
    nextLevel.textContent = missing ? t("nextLevelMissing", { label: getLevelLabel(data.achievements.nextLevel.label), missing }) : t("nextLevelWaiting", { label: getLevelLabel(data.achievements.nextLevel.label) });
  } else {
    nextReward.textContent = "S/ 0";
    nextLevel.textContent = t("nextLevelMax");
  }

  updatedAt.textContent = t("updatedAt", { value: formatTimestamp(data.updatedAt) });

  levelsGrid.innerHTML = "";
  data.levels.forEach((lv, i) => levelsGrid.appendChild(buildLevelCard(lv, i)));

  categoriesGrid.innerHTML = "";
  data.categories.forEach((cat, i) => categoriesGrid.appendChild(buildCategoryCard(cat, i)));

  renderHistory(historyGrid, data.history, data.today.date);
}

/* ---------- 13. Admin Dashboard Renderer ---------- */
function createStoreDetailView(sd) {
  const w = document.createElement("div");
  w.className = "admin-detail-stack";
  const [yr, mo] = (sd.rewardSummary.monthKey || "").split("-");

  w.innerHTML = `
    <div class="section-block">
      <h3 class="section-title">${t("adminStoreDetailTitle", { name: sd.store.name, code: sd.store.code })}</h3>
      <p class="section-text">${t("adminStoreDetailMeta", { area: sd.store.area })}</p>
    </div>
    <div class="admin-summary">
      <div class="admin-stat is-hero">
        <span class="as-label">${t("totalRewardLabel")}</span>
        <strong class="as-value">${formatCurrency(sd.rewardSummary.total)}</strong>
        <p class="as-meta">${t("totalRewardMeta", { levelReward: formatCurrency(sd.rewardSummary.levelReward), categoryRewardTotal: formatCurrency(sd.rewardSummary.categoryRewardTotal), monthLabel: t("monthLabel", { month: mo, year: yr }) })}</p>
      </div>
      <div class="admin-stat">
        <span class="as-label">${t("todayTotalLabel")}</span>
        <strong class="as-value">${formatCount(sd.today.total)}</strong>
      </div>
      <div class="admin-stat">
        <span class="as-label">${t("cumulativeTotalLabel")}</span>
        <strong class="as-value">${formatCount(sd.cumulative.total)}</strong>
        <p class="as-meta">${t("cumulativeMeta", { target: formatCount(sd.cumulative.target), progress: formatPercent(sd.cumulative.progress) })}</p>
      </div>
      <div class="admin-stat">
        <span class="as-label">${t("achievedRewardLabel")}</span>
        <strong class="as-value">${sd.achievements.achievedLevel ? formatCurrency(sd.achievements.achievedLevel.reward) : t("achievedRewardEmpty")}</strong>
      </div>
    </div>
  `;

  const levSec = document.createElement("div");
  levSec.innerHTML = `<div class="section-block mt-md"><h3 class="section-title">${t("levelSectionTitle")}</h3></div>`;
  const levGrid = document.createElement("div");
  levGrid.className = "levels-list";
  sd.levels.forEach((lv, i) => levGrid.appendChild(buildLevelCard(lv, i)));
  levSec.appendChild(levGrid);

  const catSec = document.createElement("div");
  catSec.innerHTML = `<div class="section-block mt-md"><h3 class="section-title">${t("categorySectionTitle")}</h3></div>`;
  const catGrid = document.createElement("div");
  catGrid.className = "categories-list";
  sd.categories.forEach((cat, i) => catGrid.appendChild(buildCategoryCard(cat, i)));
  catSec.appendChild(catGrid);

  const histSec = document.createElement("div");
  histSec.innerHTML = `<div class="section-block mt-md"><h3 class="section-title">${t("historySectionTitle")}</h3></div>`;
  const histChart = document.createElement("div");
  histChart.className = "history-chart";
  renderHistory(histChart, sd.history, sd.today.date);
  histSec.appendChild(histChart);

  w.appendChild(levSec);
  w.appendChild(catSec);
  w.appendChild(histSec);
  return w;
}

function renderAdminTable(storesPage) {
  adminStoresTableBody.innerHTML = "";
  if (!storesPage?.items?.length) {
    adminStoresTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px">${t("adminNoStores")}</td></tr>`;
    adminPaginationInfo.textContent = "";
    adminPrevPageBtn.disabled = true;
    adminNextPageBtn.disabled = true;
    return;
  }
  storesPage.items.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.code}</td>
      <td>${s.name}</td>
      <td>${s.area || ""}</td>
      <td>${formatCurrency(s.totalReward)}</td>
      <td>${formatPercent(s.cumulativeProgress)}</td>
      <td>${s.achievedLevel ? getLevelLabel(s.achievedLevel.label) : "-"}</td>
    `;
    adminStoresTableBody.appendChild(row);
  });

  const { page, pageSize: ps, totalItems, totalPages, startIndex } = storesPage.pagination;
  const start = totalItems ? startIndex + 1 : 0;
  const end = Math.min(startIndex + ps, totalItems);
  adminPaginationInfo.textContent = t("paginationInfo", { start, end, total: totalItems, page, pages: totalPages });
  adminPrevPageBtn.disabled = page <= 1;
  adminNextPageBtn.disabled = page >= totalPages;
}

function populateStoreSelector(items) {
  const curVal = items.some(i => i.code === selectedAdminStoreCode) ? selectedAdminStoreCode : (items[0]?.code || "");
  storeSelector.innerHTML = "";
  items.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.code;
    opt.textContent = `${s.code} • ${s.name}`;
    if (s.code === curVal) opt.selected = true;
    storeSelector.appendChild(opt);
  });
  selectedAdminStoreCode = curVal;
}

function showAdminStorePromptMsg(msg) {
  adminStoreDetail.innerHTML = `<div class="empty-state">${msg || t("adminStorePrompt")}</div>`;
}

function renderAdminDashboard(data) {
  if (!data || !data.summary) return;
  latestAdminDashboard = data;

  // Cache all store items for client-side pagination
  if (data.allStoreItems) {
    cachedAllStoreItems = data.allStoreItems;
  }

  if (data.storesPage?.pagination) {
    adminCurrentPage = data.storesPage.pagination.page;
    adminPageSize = data.storesPage.pagination.pageSize;
    adminPageSizeSelect.value = String(adminPageSize);
  }

  adminNameEl.textContent = data.admin?.name || t("defaultAdminName");
  adminMeta.textContent = [data.admin?.username || "", t("updatedAt", { value: formatTimestamp(data.updatedAt) })].filter(Boolean).join(" • ");

  const [year, month] = (data.summary.monthKey || "").split("-");
  adminTotalReward.textContent = formatCurrency(data.summary.totalReward);
  adminTotalRewardMeta.textContent = t("adminTotalRewardMeta", {
    levelReward: formatCurrency(data.summary.levelRewardTotal),
    categoryReward: formatCurrency(data.summary.categoryRewardTotal),
    monthLabel: t("monthLabel", { month, year })
  });
  adminStoresCount.textContent = formatNumber(data.summary.storesCount);
  adminStoresMeta.textContent = t("adminStoresMeta", { storesCount: data.summary.storesCount });
  adminTodayTotal.textContent = formatCount(data.summary.todayTotal);
  adminTodayMeta.textContent = t("adminTodayMeta", { updatedAt: formatTimestamp(data.updatedAt) });
  adminCumulativeTotal.textContent = formatCount(data.summary.cumulativeTotal);
  adminCumulativeMeta.textContent = t("adminCumulativeMeta", {
    target: formatCount(data.summary.cumulativeTarget),
    progress: formatPercent(data.summary.progress)
  });

  adminAggregateCategoriesGrid.innerHTML = "";
  (data.aggregateCategories || []).forEach((cat, i) => adminAggregateCategoriesGrid.appendChild(buildAggregateCategoryCard(cat, i)));

  adminAggregateLevelsGrid.innerHTML = "";
  (data.aggregateLevels || []).forEach((lv, i) => adminAggregateLevelsGrid.appendChild(buildAggregateLevelCard(lv, i)));

  if (data.storesPage) renderAdminTable(data.storesPage);

  if (!adminStoreQuery.trim()) showAdminStorePromptMsg();
}

// Client-side pagination from cached store items
function paginateLocally() {
  if (!cachedAllStoreItems) return;
  const totalItems = cachedAllStoreItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / adminPageSize));
  adminCurrentPage = Math.min(Math.max(adminCurrentPage, 1), totalPages);
  const startIndex = (adminCurrentPage - 1) * adminPageSize;
  const items = cachedAllStoreItems.slice(startIndex, startIndex + adminPageSize);
  renderAdminTable({
    items,
    pagination: { page: adminCurrentPage, pageSize: adminPageSize, totalItems, totalPages, startIndex }
  });
}

/* ---------- 14. API Functions ---------- */
async function apiFetch(url, options = {}) {
  const token = getToken();
  const resp = await fetch(url, {
    ...options,
    cache: options.cache || "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(localizeServerMessage(data.error || t("unsupportedRequest")));
  return data;
}

async function apiBlobFetch(url, options = {}) {
  const token = getToken();
  const resp = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!resp.ok) {
    let msg = t("unsupportedRequest");
    try { const d = await resp.json(); msg = localizeServerMessage(d.error || msg); } catch (_e) { /* ignore */ }
    throw new Error(msg);
  }
  return resp.blob();
}

/* ---------- 15. Data Loading ---------- */
async function loadStoreDashboard(forceRefresh = false) {
  try {
    const url = forceRefresh ? `/api/dashboard?refresh=1&t=${Date.now()}` : "/api/dashboard";
    const data = await apiFetch(url);
    renderStoreDashboard(data);
    showStoreApp();
    if (forceRefresh) showToast(t("dashboardSynced"), "success");
  } catch (err) {
    clearSession();
    latestDashboard = null;
    showLogin();
    showToast(err.message || t("authInvalid"), "error");
  }
}

async function loadAdminDashboard(forceRefresh = false) {
  try {
    const params = new URLSearchParams({ page: String(adminCurrentPage), pageSize: String(adminPageSize) });
    if (forceRefresh) { params.set("refresh", "1"); params.set("t", String(Date.now())); }
    const data = await apiFetch(`/api/admin/dashboard?${params}`);
    renderAdminDashboard(data);
    showAdminApp();
    if (forceRefresh) showToast(t("adminDashboardSynced"), "success");
  } catch (err) {
    clearSession();
    latestAdminDashboard = null;
    showLogin();
    showToast(err.message || t("authInvalid"), "error");
  }
}

async function loadAdminStoreDetail(code, forceRefresh = false) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) { showAdminStorePromptMsg(); return; }
  showAdminStorePromptMsg(t("adminStoreDetailLoading"));
  try {
    const params = new URLSearchParams({ code: c });
    if (forceRefresh) { params.set("refresh", "1"); params.set("t", String(Date.now())); }
    const data = await apiFetch(`/api/admin/store?${params}`);
    adminStoreDetail.innerHTML = "";
    adminStoreDetail.appendChild(createStoreDetailView(data));
  } catch (err) {
    showAdminStorePromptMsg(err.message || t("adminNoStoreMatch"));
  }
}

async function loadAdminStoreSearch(forceRefresh = false) {
  const q = adminStoreQuery.trim().toUpperCase();
  if (!q) { selectedAdminStoreCode = ""; storeSelector.innerHTML = ""; showAdminStorePromptMsg(); return; }
  showAdminStorePromptMsg(t("adminStoreSearchLoading"));
  try {
    const params = new URLSearchParams({ query: q, page: "1", pageSize: String(adminPageSize) });
    if (forceRefresh) { params.set("refresh", "1"); params.set("t", String(Date.now())); }
    const data = await apiFetch(`/api/admin/stores?${params}`);
    populateStoreSelector(data.items || []);
    if (data.items?.length) {
      // Use firstDetail from search response to avoid a second API call
      if (data.firstDetail) {
        selectedAdminStoreCode = data.firstDetail.store.code;
        adminStoreDetail.innerHTML = "";
        adminStoreDetail.appendChild(createStoreDetailView(data.firstDetail));
      } else {
        await loadAdminStoreDetail(selectedAdminStoreCode, forceRefresh);
      }
    } else {
      showAdminStorePromptMsg(t("adminNoStoreMatch"));
    }
  } catch (err) {
    storeSelector.innerHTML = "";
    showAdminStorePromptMsg(err.message || t("adminNoStoreMatch"));
  }
}

async function handleLogout() {
  try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch (_e) { /* ignore */ }
  latestDashboard = null;
  latestAdminDashboard = null;
  selectedAdminStoreCode = "";
  adminStoreQuery = "";
  adminCurrentPage = 1;
  storeSearchInput.value = "";
  clearSession();
  showLogin();
  showToast(t("logoutDone"), "success");
  codeInput.focus();
}

async function downloadAdminExport() {
  showToast(t("exportLoading"));
  try {
    const blob = await apiBlobFetch(`/api/admin/export?refresh=1&t=${Date.now()}`);
    const monthKey = latestAdminDashboard?.summary?.monthKey || "report";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = t("exportFilename", { monthKey });
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    showToast(t("exportDone"), "success");
  } catch (err) {
    showToast(err.message || t("unsupportedRequest"), "error");
  }
}

/* ---------- 16. Event Handlers ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;
  authStatus.textContent = t("loginLoading");
  authStatus.classList.remove("is-error");

  try {
    const payload = { code: codeInput.value.trim().toUpperCase(), password: passwordInput.value.trim() };
    const data = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    setToken(data.token);
    setRole(data.role || "store");
    passwordInput.value = "";
    authStatus.textContent = "";

    if (data.role === "admin") {
      adminCurrentPage = 1;
      adminStoreQuery = "";
      storeSearchInput.value = "";
      // Show admin app immediately with loading state, then fetch dashboard async
      showAdminApp();
      showToast(t("loginLoading"), "info", 3000);
      loadAdminDashboard(true);
    } else if (data.dashboard) {
      renderStoreDashboard(data.dashboard);
      showStoreApp();
    } else {
      showStoreApp();
      loadStoreDashboard(true);
    }
  } catch (err) {
    clearSession();
    authStatus.textContent = err.message || t("authError");
    authStatus.classList.add("is-error");
  } finally {
    loginBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => loadStoreDashboard(true));
logoutBtn.addEventListener("click", handleLogout);
adminRefreshBtn.addEventListener("click", () => {
  loadAdminDashboard(true);
  if (adminStoreQuery.trim()) loadAdminStoreSearch(true);
});
adminLogoutBtn.addEventListener("click", handleLogout);
exportBtn.addEventListener("click", downloadAdminExport);

storeSelector.addEventListener("change", () => {
  selectedAdminStoreCode = storeSelector.value;
  if (selectedAdminStoreCode) loadAdminStoreDetail(selectedAdminStoreCode);
});

let searchDebounce = null;
storeSearchInput.addEventListener("input", () => {
  adminStoreQuery = storeSearchInput.value;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => loadAdminStoreSearch(), 300);
});

adminPageSizeSelect.addEventListener("change", () => {
  adminPageSize = Number(adminPageSizeSelect.value || 20);
  adminCurrentPage = 1;
  if (cachedAllStoreItems) {
    paginateLocally();
  } else if (latestAdminDashboard) {
    loadAdminDashboard();
  }
  if (adminStoreQuery.trim()) loadAdminStoreSearch();
});

adminPrevPageBtn.addEventListener("click", () => {
  if (adminCurrentPage > 1) {
    adminCurrentPage--;
    if (cachedAllStoreItems) {
      paginateLocally();
    } else if (latestAdminDashboard) {
      loadAdminDashboard();
    }
  }
});

adminNextPageBtn.addEventListener("click", () => {
  adminCurrentPage++;
  if (cachedAllStoreItems) {
    paginateLocally();
  } else if (latestAdminDashboard) {
    loadAdminDashboard();
  }
});

// Language buttons — all pairs
function setupLangBtns(esId, viId) {
  const esBtn = $(esId);
  const viBtn = $(viId);
  if (esBtn) esBtn.addEventListener("click", () => setLanguage("es"));
  if (viBtn) viBtn.addEventListener("click", () => setLanguage("vi"));
}
setupLangBtns("langEsBtn", "langViBtn");
setupLangBtns("moreLangEsBtn", "moreLangViBtn");
setupLangBtns("adminMoreLangEsBtn", "adminMoreLangViBtn");

// Header lang toggle cycles language
$("storeLangBtn")?.addEventListener("click", () => setLanguage(currentLanguage === "es" ? "vi" : "es"));
$("adminLangBtn")?.addEventListener("click", () => setLanguage(currentLanguage === "es" ? "vi" : "es"));

// Install buttons
const moreInstallBtn = $("moreInstallBtn");
function handleInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  installBtn.classList.add("hidden");
  if (moreInstallBtn) moreInstallBtn.classList.add("hidden");
}
installBtn.addEventListener("click", handleInstall);
if (moreInstallBtn) moreInstallBtn.addEventListener("click", handleInstall);

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBtn.classList.remove("hidden");
  if (moreInstallBtn) moreInstallBtn.classList.remove("hidden");
});

/* ---------- 17. Tab Setup ---------- */
setupTabNavigation($("storeNav"), storeApp, (tabId) => { activeStoreTab = tabId; });
setupTabNavigation($("adminNav"), adminApp, (tabId) => { activeAdminTab = tabId; });

/* ---------- 18. Pull to Refresh ---------- */
if (storeContent && pullIndicator) {
  setupPullToRefresh(storeContent, pullIndicator, () => loadStoreDashboard(true));
}

/* ---------- 19. Service Worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => null));
}

/* ---------- 20. Init ---------- */
applyStaticTranslations();

if (getToken()) {
  if (getRole() === "admin") {
    showAdminApp();
    adminCurrentPage = 1;
    loadAdminDashboard(true);
  } else {
    showStoreApp();
    loadStoreDashboard(true);
  }
} else {
  showLogin();
  codeInput.focus();
}

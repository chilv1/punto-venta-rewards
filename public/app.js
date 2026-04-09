const storageKey = "sales-program-token";
const roleKey = "sales-program-role";
const languageKey = "sales-program-language";

const authPanel = document.getElementById("authPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const codeInput = document.getElementById("codeInput");
const passwordInput = document.getElementById("passwordInput");
const authStatus = document.getElementById("authStatus");

const storeName = document.getElementById("storeName");
const storeMeta = document.getElementById("storeMeta");
const todayTotal = document.getElementById("todayTotal");
const todayDate = document.getElementById("todayDate");
const cumulativeTotal = document.getElementById("cumulativeTotal");
const cumulativeMeta = document.getElementById("cumulativeMeta");
const totalReward = document.getElementById("totalReward");
const totalRewardMeta = document.getElementById("totalRewardMeta");
const achievedReward = document.getElementById("achievedReward");
const achievedLevel = document.getElementById("achievedLevel");
const nextReward = document.getElementById("nextReward");
const nextLevel = document.getElementById("nextLevel");
const updatedAt = document.getElementById("updatedAt");
const levelsGrid = document.getElementById("levelsGrid");
const categoriesGrid = document.getElementById("categoriesGrid");
const historyGrid = document.getElementById("historyGrid");
const dashboardStatus = document.getElementById("dashboardStatus");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const adminName = document.getElementById("adminName");
const adminMeta = document.getElementById("adminMeta");
const adminTotalReward = document.getElementById("adminTotalReward");
const adminTotalRewardMeta = document.getElementById("adminTotalRewardMeta");
const adminStoresCount = document.getElementById("adminStoresCount");
const adminStoresMeta = document.getElementById("adminStoresMeta");
const adminTodayTotal = document.getElementById("adminTodayTotal");
const adminTodayMeta = document.getElementById("adminTodayMeta");
const adminCumulativeTotal = document.getElementById("adminCumulativeTotal");
const adminCumulativeMeta = document.getElementById("adminCumulativeMeta");
const adminStoreDetail = document.getElementById("adminStoreDetail");
const adminAggregateCategoriesGrid = document.getElementById("adminAggregateCategoriesGrid");
const adminAggregateLevelsGrid = document.getElementById("adminAggregateLevelsGrid");
const adminStoresTableBody = document.getElementById("adminStoresTableBody");
const adminStatus = document.getElementById("adminStatus");
const adminRefreshBtn = document.getElementById("adminRefreshBtn");
const exportBtn = document.getElementById("exportBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const storeSelector = document.getElementById("storeSelector");
const storeSearchInput = document.getElementById("storeSearchInput");
const adminPageSizeSelect = document.getElementById("adminPageSizeSelect");
const adminPaginationInfo = document.getElementById("adminPaginationInfo");
const adminPrevPageBtn = document.getElementById("adminPrevPageBtn");
const adminNextPageBtn = document.getElementById("adminNextPageBtn");
const adminTabTotalBtn = document.getElementById("adminTabTotalBtn");
const adminTabStoreBtn = document.getElementById("adminTabStoreBtn");
const adminTotalView = document.getElementById("adminTotalView");
const adminStoreView = document.getElementById("adminStoreView");

const installBtn = document.getElementById("installBtn");
const langEsBtn = document.getElementById("langEsBtn");
const langViBtn = document.getElementById("langViBtn");

const translations = {
  es: {
    htmlLang: "es",
    title: "Programa Punto de Venta",
    heroEyebrow: "Subscription tracker v5",
    heroSubtitle:
      "Sigue resultados diarios, metas por tipo de línea, niveles dinámicos y ahora también un panel administrador para revisar todos los puntos de venta y exportar reportes.",
    installBtn: "Instalar app en Android",
    loginEyebrow: "Ingreso",
    loginTitle: "Ingreso del sistema",
    loginText:
      "Use el código del punto de venta o el usuario administrador. La contraseña es entregada por el sistema.",
    codeLabel: "Usuario o código",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Ingrese la contraseña",
    loginBtn: "Entrar",
    dashboardEyebrow: "Dashboard diario",
    adminEyebrow: "Panel administrador",
    defaultStoreName: "Punto de venta",
    defaultAdminName: "Administrador",
    refreshBtn: "Actualizar",
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
    levelSectionText:
      "Cada nivel solo se completa cuando los 4 tipos de línea cumplen sus metas del nivel.",
    categorySectionTitle: "4 tipos de línea y metas",
    categoryNames: {
      prepaid_new_line: "Prepago New Line",
      prepaid_portabilidad: "Prepago Portabilidad",
      postpaid_new_line: "Postpago New Line",
      postpaid_portabilidad: "Postpago Portabilidad"
    },
    shortNames: {
      prepaid_new_line: "Pre New Line",
      prepaid_portabilidad: "Pre Porta",
      postpaid_new_line: "Post New Line",
      postpaid_portabilidad: "Post Porta"
    },
    historySectionTitle: "Resultados de los últimos 7 días",
    historySectionText: "El gráfico muestra el total de líneas por día.",
    todayDatePrefix: "Fecha registrada:",
    cumulativeMeta: ({ target, progress }) => `Meta ${target} • Cumplimiento ${progress}`,
    totalRewardMeta: ({ levelReward, categoryRewardTotal, monthLabel }) =>
      `Nivel más alto ${levelReward} • Tipos de línea ${categoryRewardTotal} • ${monthLabel}`,
    monthLabel: ({ month, year }) => `Mes ${month}/${year}`,
    achievedLevelDone: ({ label }) => `${label} ya fue completado.`,
    nextLevelWaiting: ({ label }) => `${label}: esperando completar las metas faltantes.`,
    nextLevelMissing: ({ label, missing }) => `${label}: ${missing}`,
    nextLevelMax: "Ya superó todos los niveles configurados.",
    levelDone: "Logrado",
    levelNotDone: ({ progress }) => progress,
    levelFootDone: ({ label, reward }) => `${label} completado. Premio ${reward}.`,
    levelFootPending: "Completa todas las metas internas para alcanzar este nivel.",
    requirementDone: "Logrado",
    categoryRewardLabel: "Premio",
    categoryReached: "Meta lograda",
    categoryNotReached: ({ progress }) => progress,
    statToday: "Hoy",
    statTarget: "Meta",
    statCumulative: "Acumulado",
    statRemaining: "Falta",
    categoryFootDone: ({ reward }) => `Meta cumplida. Premio ${reward}.`,
    categoryFootPending: ({ remaining }) => `Faltan ${remaining} para cumplir la meta.`,
    rewardNotConfigured: "Sin premio",
    updatedAt: ({ value }) => `Actualizado a las ${value}`,
    historyEmpty: "Aún no hay datos en los últimos 7 días.",
    dashboardSynced:
      "Datos sincronizados con Google Sheets. Actualiza DailyResults y pulsa Actualizar.",
    dashboardLoading: "Sincronizando resultados diarios y acumulados...",
    adminDashboardSynced:
      "Panel administrador sincronizado. Puede revisar cada punto de venta y exportar el consolidado.",
    adminDashboardLoading: "Sincronizando panel administrador...",
    loginLoading: "Ingresando...",
    logoutDone: "Sesión cerrada.",
    authInvalid: "La sesión no es válida.",
    unsupportedRequest: "No se pudo procesar la solicitud.",
    authError: "No se pudo ingresar.",
    missingFields: "Ingrese usuario y contraseña.",
    installGroupLabel: "Selector de idioma",
    countLineSingular: "Línea",
    countLinePlural: "Líneas",
    adminTotalRewardLabel: "Premio total de todos los puntos",
    adminStoresCountLabel: "Puntos de venta",
    adminTodayTotalLabel: "Resultado de hoy",
    adminCumulativeTotalLabel: "Acumulado total",
    adminTotalRewardMeta: ({ levelReward, categoryReward, monthLabel }) =>
      `Niveles ${levelReward} • Tipos de línea ${categoryReward} • ${monthLabel}`,
    adminStoresMeta: ({ storesCount }) => `${storesCount} puntos con datos en el mes actual.`,
    adminTodayMeta: ({ updatedAt }) => `Última actualización ${updatedAt}`,
    adminCumulativeMeta: ({ target, progress }) => `Meta consolidada ${target} • Cumplimiento ${progress}`,
    adminStoreSectionTitle: "Detalle por punto de venta",
    adminStoreSectionText:
      "Seleccione un punto de venta para revisar sus metas por tipo de línea, niveles y premio total.",
    adminTabTotal: "Total",
    adminTabStore: "Punto de venta",
    storeSearchLabel: "Buscar por código",
    storeSearchPlaceholder: "CUSPS0001",
    storeSelectorLabel: "Punto de venta",
    adminAggregateCategoryTitle: "Consolidado por tipo de línea",
    adminAggregateCategoryText: "Resumen de todas las líneas y metas de todos los puntos de venta.",
    adminAggregateLevelTitle: "Consolidado por niveles",
    adminAggregateLevelText:
      "Cada nivel muestra el avance acumulado y cuántos puntos de venta ya lo lograron.",
    adminStoresTableTitle: "Todos los puntos de venta",
    adminStoresTableText:
      "Vista rápida de cumplimiento, premio total y nivel alcanzado por cada punto.",
    adminPageSizeLabel: "Filas por página",
    paginationPrev: "Anterior",
    paginationNext: "Siguiente",
    paginationInfo: ({ start, end, total, page, pages }) =>
      `Mostrando ${start}-${end} de ${total} puntos • Página ${page}/${pages}`,
    tableCode: "Código",
    tableName: "Punto",
    tableArea: "Zona",
    tableReward: "Premio total",
    tableProgress: "Avance",
    tableLevel: "Nivel",
    adminStoreDetailTitle: ({ name, code }) => `${name} • ${code}`,
    adminStoreDetailMeta: ({ area }) => area || "Sin zona",
    adminAggregateReachedStores: ({ count }) => `${count} puntos logrados`,
    adminAggregateLevelFoot: ({ reached, total }) => `${reached} de ${total} puntos ya lograron este nivel.`,
    adminNoStores: "No hay puntos de venta disponibles.",
    adminNoStoreMatch: "No se encontró ningún punto de venta con ese código.",
    adminStorePrompt: "Ingrese el código del punto de venta para ver su detalle.",
    adminStoreSearchLoading: "Buscando puntos de venta...",
    adminStoreDetailLoading: "Cargando detalle del punto de venta...",
    exportLoading: "Generando archivo Excel...",
    exportDone: "Archivo Excel descargado.",
    exportFilename: ({ monthKey }) => `reporte-pdv-${monthKey}.xlsx`
  },
  vi: {
    htmlLang: "vi",
    title: "Programa Punto de Venta",
    heroEyebrow: "Subscription tracker v5",
    heroSubtitle:
      "Theo dõi kết quả ngày, chỉ tiêu theo loại thuê bao, mức thưởng động và thêm panel quản trị để xem toàn bộ điểm bán và xuất báo cáo Excel.",
    installBtn: "Cài app trên Android",
    loginEyebrow: "Ingreso",
    loginTitle: "Đăng nhập hệ thống",
    loginText:
      "Dùng mã điểm bán hoặc user admin. Mật khẩu do hệ thống cấp.",
    codeLabel: "User hoặc mã điểm bán",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    loginBtn: "Đăng nhập",
    dashboardEyebrow: "Dashboard ngày",
    adminEyebrow: "Panel quản trị",
    defaultStoreName: "Điểm bán",
    defaultAdminName: "Quản trị",
    refreshBtn: "Làm mới",
    exportBtn: "Xuất Excel",
    logoutBtn: "Đăng xuất",
    todayTotalLabel: "Kết quả hôm nay",
    cumulativeTotalLabel: "Luỹ kế đến ngày",
    totalRewardLabel: "Tổng số tiền thưởng",
    achievedRewardLabel: "Thưởng đã đạt",
    achievedRewardEmpty: "Chưa đạt",
    achievedRewardEmptyNote: "Điểm bán chưa chạm mức thưởng nào.",
    nextRewardLabel: "Mốc kế tiếp",
    levelSectionTitle: "Tiến độ các mức chỉ tiêu",
    levelSectionText:
      "Mỗi mức chỉ hoàn thành khi cả 4 loại thuê bao đều đạt chỉ tiêu của mức đó.",
    categorySectionTitle: "4 loại thuê bao và chỉ tiêu",
    categoryNames: {
      prepaid_new_line: "Trả trước New Line",
      prepaid_portabilidad: "Trả trước Portabilidad",
      postpaid_new_line: "Trả sau New Line",
      postpaid_portabilidad: "Trả sau Portabilidad"
    },
    shortNames: {
      prepaid_new_line: "Pre New Line",
      prepaid_portabilidad: "Pre Porta",
      postpaid_new_line: "Post New Line",
      postpaid_portabilidad: "Post Porta"
    },
    historySectionTitle: "Kết quả 7 ngày gần nhất",
    historySectionText: "Biểu đồ đang hiển thị tổng số thuê bao theo ngày.",
    todayDatePrefix: "Ngày ghi nhận:",
    cumulativeMeta: ({ target, progress }) => `Chỉ tiêu ${target} • Hoàn thành ${progress}`,
    totalRewardMeta: ({ levelReward, categoryRewardTotal, monthLabel }) =>
      `Mức cao nhất ${levelReward} • 4 loại thuê bao ${categoryRewardTotal} • ${monthLabel}`,
    monthLabel: ({ month, year }) => `Tháng ${month}/${year}`,
    achievedLevelDone: ({ label }) => `${label} đã hoàn thành.`,
    nextLevelWaiting: ({ label }) => `${label}: đang chờ hoàn tất các chỉ tiêu con.`,
    nextLevelMissing: ({ label, missing }) => `${label}: ${missing}`,
    nextLevelMax: "Đã vượt toàn bộ các mức chỉ tiêu.",
    levelDone: "Đã đạt",
    levelNotDone: ({ progress }) => progress,
    levelFootDone: ({ label, reward }) => `Đã đạt ${label} và nhận ${reward}.`,
    levelFootPending: "Cần hoàn thành đủ các chỉ tiêu con để chạm mức này.",
    requirementDone: "Đạt",
    categoryRewardLabel: "Thưởng",
    categoryReached: "Đạt chỉ tiêu",
    categoryNotReached: ({ progress }) => progress,
    statToday: "Ngày",
    statTarget: "Chỉ tiêu",
    statCumulative: "Luỹ kế",
    statRemaining: "Còn lại",
    categoryFootDone: ({ reward }) => `Đã hoàn thành chỉ tiêu nhóm thuê bao này và nhận ${reward}.`,
    categoryFootPending: ({ remaining }) => `Cần thêm ${remaining} để đạt chỉ tiêu.`,
    rewardNotConfigured: "Chưa cấu hình thưởng",
    updatedAt: ({ value }) => `Cập nhật lúc ${value}`,
    historyEmpty: "Chưa có dữ liệu 7 ngày gần nhất.",
    dashboardSynced:
      "Dữ liệu đã đồng bộ từ Google Sheets. Chỉ cần cập nhật lại DailyResults rồi bấm Làm mới.",
    dashboardLoading: "Đang đồng bộ kết quả ngày và luỹ kế...",
    adminDashboardSynced:
      "Panel quản trị đã đồng bộ. Có thể xem từng điểm bán và xuất báo cáo tổng hợp.",
    adminDashboardLoading: "Đang đồng bộ panel quản trị...",
    loginLoading: "Đang đăng nhập...",
    logoutDone: "Đã đăng xuất.",
    authInvalid: "Phiên đăng nhập không hợp lệ.",
    unsupportedRequest: "Không thể xử lý yêu cầu.",
    authError: "Không thể đăng nhập.",
    missingFields: "Vui lòng nhập user và mật khẩu.",
    installGroupLabel: "Chuyển ngôn ngữ",
    countLineSingular: "TB",
    countLinePlural: "TB",
    adminTotalRewardLabel: "Tổng thưởng của tất cả điểm bán",
    adminStoresCountLabel: "Số điểm bán",
    adminTodayTotalLabel: "Kết quả hôm nay",
    adminCumulativeTotalLabel: "Luỹ kế tổng",
    adminTotalRewardMeta: ({ levelReward, categoryReward, monthLabel }) =>
      `Thưởng mức ${levelReward} • Thưởng loại thuê bao ${categoryReward} • ${monthLabel}`,
    adminStoresMeta: ({ storesCount }) => `${storesCount} điểm bán có dữ liệu trong tháng hiện tại.`,
    adminTodayMeta: ({ updatedAt }) => `Lần cập nhật ${updatedAt}`,
    adminCumulativeMeta: ({ target, progress }) => `Chỉ tiêu tổng ${target} • Hoàn thành ${progress}`,
    adminStoreSectionTitle: "Chi tiết theo điểm bán",
    adminStoreSectionText:
      "Chọn một điểm bán để xem chỉ tiêu theo thuê bao, theo mức và tổng thưởng.",
    adminTabTotal: "Total",
    adminTabStore: "Từng điểm bán",
    storeSearchLabel: "Tìm theo mã điểm bán",
    storeSearchPlaceholder: "CUSPS0001",
    storeSelectorLabel: "Điểm bán",
    adminAggregateCategoryTitle: "Tổng hợp theo loại thuê bao",
    adminAggregateCategoryText: "Tổng hợp chỉ tiêu và kết quả của tất cả điểm bán.",
    adminAggregateLevelTitle: "Tổng hợp theo mức",
    adminAggregateLevelText:
      "Mỗi mức cho biết tiến độ cộng gộp và số điểm bán đã hoàn thành mức đó.",
    adminStoresTableTitle: "Tất cả điểm bán",
    adminStoresTableText:
      "Xem nhanh mức hoàn thành, tổng thưởng và mức đã đạt của từng điểm bán.",
    adminPageSizeLabel: "Số dòng mỗi trang",
    paginationPrev: "Trang trước",
    paginationNext: "Trang sau",
    paginationInfo: ({ start, end, total, page, pages }) =>
      `Hiển thị ${start}-${end} trên ${total} điểm bán • Trang ${page}/${pages}`,
    tableCode: "Mã",
    tableName: "Điểm bán",
    tableArea: "Khu vực",
    tableReward: "Tổng thưởng",
    tableProgress: "Tiến độ",
    tableLevel: "Mức",
    adminStoreDetailTitle: ({ name, code }) => `${name} • ${code}`,
    adminStoreDetailMeta: ({ area }) => area || "Chưa có khu vực",
    adminAggregateReachedStores: ({ count }) => `${count} điểm bán đạt`,
    adminAggregateLevelFoot: ({ reached, total }) => `${reached}/${total} điểm bán đã đạt mức này.`,
    adminNoStores: "Chưa có điểm bán nào.",
    adminNoStoreMatch: "Không tìm thấy điểm bán nào theo mã này.",
    adminStorePrompt: "Nhập mã điểm bán để xem chi tiết.",
    adminStoreSearchLoading: "Đang tìm điểm bán...",
    adminStoreDetailLoading: "Đang tải chi tiết điểm bán...",
    exportLoading: "Đang tạo file Excel...",
    exportDone: "Đã tải file Excel.",
    exportFilename: ({ monthKey }) => `bao-cao-pdv-${monthKey}.xlsx`
  }
};

const serverMessageMap = {
  "Vui lòng đăng nhập.": { es: "Inicie sesión para continuar.", vi: "Vui lòng đăng nhập." },
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.": {
    es: "La sesión expiró. Vuelva a ingresar.",
    vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  },
  "Sai mã điểm bán hoặc mật khẩu.": {
    es: "Usuario, código o contraseña incorrectos.",
    vi: "Sai user, mã điểm bán hoặc mật khẩu."
  },
  "Không thể tải dashboard.": {
    es: "No se pudo cargar el dashboard.",
    vi: "Không thể tải dashboard."
  },
  "Không thể đăng nhập lúc này.": {
    es: "No se pudo iniciar sesión en este momento.",
    vi: "Không thể đăng nhập lúc này."
  },
  "Điểm bán không còn tồn tại trên hệ thống.": {
    es: "El punto de venta ya no existe en el sistema.",
    vi: "Điểm bán không còn tồn tại trên hệ thống."
  },
  "Vui lòng nhập mã điểm bán và mật khẩu.": {
    es: "Ingrese usuario o código y la contraseña.",
    vi: "Vui lòng nhập user hoặc mã điểm bán và mật khẩu."
  },
  "Bạn không có quyền truy cập khu vực này.": {
    es: "No tiene permisos para acceder a esta zona.",
    vi: "Bạn không có quyền truy cập khu vực này."
  },
  "Không thể tải dashboard quản trị.": {
    es: "No se pudo cargar el panel administrador.",
    vi: "Không thể tải dashboard quản trị."
  },
  "Không thể xuất file Excel.": {
    es: "No se pudo exportar el archivo Excel.",
    vi: "Không thể xuất file Excel."
  },
  "Không thể tìm kiếm điểm bán.": {
    es: "No se pudo buscar puntos de venta.",
    vi: "Không thể tìm kiếm điểm bán."
  },
  "Không thể tải chi tiết điểm bán.": {
    es: "No se pudo cargar el detalle del punto de venta.",
    vi: "Không thể tải chi tiết điểm bán."
  },
  "Vui lòng nhập mã điểm bán.": {
    es: "Ingrese el código del punto de venta.",
    vi: "Vui lòng nhập mã điểm bán."
  }
};

let deferredInstallPrompt = null;
let currentLanguage = localStorage.getItem(languageKey) || "es";
let latestDashboard = null;
let latestAdminDashboard = null;
let adminStoreQuery = "";
let activeAdminTab = "total";
let adminCurrentPage = 1;
let adminPageSize = Number(adminPageSizeSelect?.value || 20);
let selectedAdminStoreCode = "";

function getToken() {
  return localStorage.getItem(storageKey) || "";
}

function setToken(token) {
  if (token) {
    localStorage.setItem(storageKey, token);
  } else {
    localStorage.removeItem(storageKey);
  }
}

function getRole() {
  return localStorage.getItem(roleKey) || "";
}

function setRole(role) {
  if (role) {
    localStorage.setItem(roleKey, role);
  } else {
    localStorage.removeItem(roleKey);
  }
}

function clearSession() {
  setToken("");
  setRole("");
}

function getLocale() {
  return currentLanguage === "es" ? "es-PE" : "vi-VN";
}

function t(key, params = {}) {
  const value = translations[currentLanguage][key];
  if (typeof value === "function") {
    return value(params);
  }
  return value ?? key;
}

function localizeServerMessage(message) {
  return serverMessageMap[message]?.[currentLanguage] || message;
}

function getCategoryLabel(id, fallback = "") {
  return translations[currentLanguage].categoryNames[id] || fallback;
}

function getShortLabel(id, fallback = "") {
  return translations[currentLanguage].shortNames[id] || fallback;
}

function getLevelLabel(label) {
  const match = String(label || "").match(/(\d+)/);
  if (!match) {
    return label;
  }
  return currentLanguage === "es" ? `Nivel ${match[1]}` : `Mức ${match[1]}`;
}

function setStatus(target, message, isError = false) {
  if (!target) {
    return;
  }
  target.textContent = message;
  target.classList.toggle("status-error", isError);
}

function setViewMode(mode) {
  authPanel.classList.toggle("hidden", mode !== "auth");
  dashboardPanel.classList.toggle("hidden", mode !== "store");
  adminPanel.classList.toggle("hidden", mode !== "admin");
}

function setTextById(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getCountUnit(value) {
  if (currentLanguage === "es") {
    return Number(value || 0) === 1 ? t("countLineSingular") : t("countLinePlural");
  }
  return t("countLinePlural");
}

function formatCount(value) {
  return `${formatNumber(value)} ${getCountUnit(value)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function formatDisplayDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(getLocale(), {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatTimestamp(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function applyStaticTranslations() {
  document.documentElement.lang = t("htmlLang");
  document.title = t("title");
  document.querySelector(".language-switch")?.setAttribute("aria-label", t("installGroupLabel"));
  setTextById("heroEyebrow", t("heroEyebrow"));
  setTextById("heroSubtitle", t("heroSubtitle"));
  installBtn.textContent = t("installBtn");
  setTextById("loginEyebrow", t("loginEyebrow"));
  setTextById("loginTitle", t("loginTitle"));
  setTextById("loginText", t("loginText"));
  setTextById("codeLabel", t("codeLabel"));
  setTextById("passwordLabel", t("passwordLabel"));
  passwordInput.placeholder = t("passwordPlaceholder");
  loginBtn.textContent = t("loginBtn");

  setTextById("dashboardEyebrow", t("dashboardEyebrow"));
  setTextById("todayTotalLabel", t("todayTotalLabel"));
  setTextById("cumulativeTotalLabel", t("cumulativeTotalLabel"));
  setTextById("totalRewardLabel", t("totalRewardLabel"));
  setTextById("achievedRewardLabel", t("achievedRewardLabel"));
  setTextById("nextRewardLabel", t("nextRewardLabel"));
  setTextById("levelSectionTitle", t("levelSectionTitle"));
  setTextById("levelSectionText", t("levelSectionText"));
  setTextById("categorySectionTitle", t("categorySectionTitle"));
  setTextById("historySectionTitle", t("historySectionTitle"));
  setTextById("historySectionText", t("historySectionText"));
  refreshBtn.textContent = t("refreshBtn");
  logoutBtn.textContent = t("logoutBtn");

  setTextById("adminEyebrow", t("adminEyebrow"));
  setTextById("adminTotalRewardLabel", t("adminTotalRewardLabel"));
  setTextById("adminStoresCountLabel", t("adminStoresCountLabel"));
  setTextById("adminTodayTotalLabel", t("adminTodayTotalLabel"));
  setTextById("adminCumulativeTotalLabel", t("adminCumulativeTotalLabel"));
  setTextById("adminTabTotalBtn", t("adminTabTotal"));
  setTextById("adminTabStoreBtn", t("adminTabStore"));
  setTextById("adminStoreSectionTitle", t("adminStoreSectionTitle"));
  setTextById("adminStoreSectionText", t("adminStoreSectionText"));
  setTextById("storeSearchLabel", t("storeSearchLabel"));
  storeSearchInput.placeholder = t("storeSearchPlaceholder");
  setTextById("storeSelectorLabel", t("storeSelectorLabel"));
  setTextById("adminAggregateCategoryTitle", t("adminAggregateCategoryTitle"));
  setTextById("adminAggregateCategoryText", t("adminAggregateCategoryText"));
  setTextById("adminAggregateLevelTitle", t("adminAggregateLevelTitle"));
  setTextById("adminAggregateLevelText", t("adminAggregateLevelText"));
  setTextById("adminStoresTableTitle", t("adminStoresTableTitle"));
  setTextById("adminStoresTableText", t("adminStoresTableText"));
  setTextById("adminPageSizeLabel", t("adminPageSizeLabel"));
  setTextById("adminTableHeadCode", t("tableCode"));
  setTextById("adminTableHeadName", t("tableName"));
  setTextById("adminTableHeadArea", t("tableArea"));
  setTextById("adminTableHeadReward", t("tableReward"));
  setTextById("adminTableHeadProgress", t("tableProgress"));
  setTextById("adminTableHeadLevel", t("tableLevel"));
  adminPrevPageBtn.textContent = t("paginationPrev");
  adminNextPageBtn.textContent = t("paginationNext");
  adminRefreshBtn.textContent = t("refreshBtn");
  adminLogoutBtn.textContent = t("logoutBtn");
  exportBtn.textContent = t("exportBtn");

  langEsBtn.classList.toggle("lang-btn-active", currentLanguage === "es");
  langViBtn.classList.toggle("lang-btn-active", currentLanguage === "vi");

  if (!latestDashboard) {
    todayTotal.textContent = formatCount(0);
    cumulativeTotal.textContent = formatCount(0);
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
  }

  if (!latestAdminDashboard) {
    adminName.textContent = t("defaultAdminName");
    adminTotalReward.textContent = formatCurrency(0);
    adminStoresCount.textContent = formatNumber(0);
    adminTodayTotal.textContent = formatCount(0);
    adminCumulativeTotal.textContent = formatCount(0);
  }
}

function setAdminTab(tab) {
  activeAdminTab = tab;
  adminTabTotalBtn.classList.toggle("admin-menu-btn-active", tab === "total");
  adminTabStoreBtn.classList.toggle("admin-menu-btn-active", tab === "store");
  adminTotalView.classList.toggle("hidden", tab !== "total");
  adminStoreView.classList.toggle("hidden", tab !== "store");
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(languageKey, language);
  applyStaticTranslations();

  if (latestDashboard) {
    renderStoreDashboard(latestDashboard);
  }
  if (latestAdminDashboard) {
    renderAdminDashboard(latestAdminDashboard);
  }
}

function buildCategoryCard(category) {
  const card = document.createElement("article");
  card.className = "category-card";
  if (category.reached) {
    card.classList.add("category-card-reached");
  }

  card.innerHTML = `
    <div class="category-head">
      <div>
        <span class="category-label">${getCategoryLabel(category.id, category.label)}</span>
        <strong>${formatCount(category.cumulative)}</strong>
      </div>
      <div class="category-reward-box">
        <span>${t("categoryRewardLabel")}</span>
        <strong class="category-reward-amount">${category.reward > 0 ? formatCurrency(category.reward) : "S/ 0"}</strong>
      </div>
    </div>
    <div class="category-status-row">
      <span class="category-badge">${category.reached ? t("categoryReached") : t("categoryNotReached", { progress: formatPercent(category.progress) })}</span>
    </div>
    <div class="stats-grid">
      <div class="stat-chip">
        <span>${t("statToday")}</span>
        <strong>${formatCount(category.daily)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statTarget")}</span>
        <strong>${formatCount(category.target)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statCumulative")}</span>
        <strong>${formatCount(category.cumulative)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statRemaining")}</span>
        <strong>${formatCount(category.remaining)}</strong>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <p class="category-foot">${category.reached ? t("categoryFootDone", { reward: formatCurrency(category.reward) }) : t("categoryFootPending", { remaining: formatCount(category.remaining) })}</p>
  `;

  requestAnimationFrame(() => {
    const fill = card.querySelector(".progress-fill");
    fill.style.width = `${Math.max(0, Math.min(100, category.progress))}%`;
  });

  return card;
}

function buildAggregateCategoryCard(category) {
  const card = document.createElement("article");
  card.className = "category-card";
  if (category.reachedStores > 0) {
    card.classList.add("category-card-reached");
  }

  card.innerHTML = `
    <div class="category-head">
      <div>
        <span class="category-label">${getCategoryLabel(category.id, category.label)}</span>
        <strong>${formatCount(category.cumulative)}</strong>
      </div>
      <div class="category-reward-box">
        <span>${t("categoryRewardLabel")}</span>
        <strong class="category-reward-amount">${formatCurrency(category.rewardEarned)}</strong>
      </div>
    </div>
    <div class="category-status-row">
      <span class="category-badge">${t("adminAggregateReachedStores", { count: category.reachedStores })}</span>
    </div>
    <div class="stats-grid">
      <div class="stat-chip">
        <span>${t("statToday")}</span>
        <strong>${formatCount(category.daily)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statTarget")}</span>
        <strong>${formatCount(category.target)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statCumulative")}</span>
        <strong>${formatCount(category.cumulative)}</strong>
      </div>
      <div class="stat-chip">
        <span>${t("statRemaining")}</span>
        <strong>${formatCount(category.remaining)}</strong>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <p class="category-foot">${t("categoryFootPending", { remaining: formatCount(category.remaining) })}</p>
  `;

  requestAnimationFrame(() => {
    const fill = card.querySelector(".progress-fill");
    fill.style.width = `${Math.max(0, Math.min(100, category.progress))}%`;
  });

  return card;
}

function buildLevelCard(level) {
  const card = document.createElement("article");
  card.className = "level-card";
  if (level.reached) {
    card.classList.add("level-card-reached");
  }

  const requirements = level.requirements
    .map(
      (item) => `
        <div class="requirement-chip ${item.reached ? "requirement-chip-reached" : ""}">
          <div class="requirement-head">
            <span>${getShortLabel(item.id, item.shortLabel)}</span>
            <em>${item.reached ? t("requirementDone") : formatPercent(item.progress)}</em>
          </div>
          <strong>${formatCount(item.actual)} / ${formatCount(item.target)}</strong>
          <div class="requirement-progress">
            <div class="requirement-progress-fill" style="width: ${Math.max(0, Math.min(100, item.progress))}%"></div>
          </div>
        </div>
      `
    )
    .join("");

  card.innerHTML = `
    <div class="level-head">
      <div>
        <span class="level-label">${getLevelLabel(level.label)}</span>
        <strong>${formatCurrency(level.reward)}</strong>
      </div>
      <span class="level-badge">${level.reached ? t("levelDone") : t("levelNotDone", { progress: formatPercent(level.progress) })}</span>
    </div>
    <div class="requirement-grid">${requirements}</div>
    <div class="progress-track">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <p class="level-foot">${level.reached ? t("levelFootDone", { label: getLevelLabel(level.label), reward: formatCurrency(level.reward) }) : t("levelFootPending")}</p>
  `;

  requestAnimationFrame(() => {
    const fill = card.querySelector(".progress-fill");
    fill.style.width = `${Math.max(0, Math.min(100, level.progress))}%`;
  });

  return card;
}

function buildAggregateLevelCard(level) {
  const card = document.createElement("article");
  card.className = "level-card";
  if (level.reachedStores > 0) {
    card.classList.add("level-card-reached");
  }

  const requirements = level.requirements
    .map(
      (item) => `
        <div class="requirement-chip ${item.reached ? "requirement-chip-reached" : ""}">
          <div class="requirement-head">
            <span>${getShortLabel(item.id, item.shortLabel)}</span>
            <em>${formatPercent(item.progress)}</em>
          </div>
          <strong>${formatCount(item.actual)} / ${formatCount(item.target)}</strong>
          <div class="requirement-progress">
            <div class="requirement-progress-fill" style="width: ${Math.max(0, Math.min(100, item.progress))}%"></div>
          </div>
        </div>
      `
    )
    .join("");

  card.innerHTML = `
    <div class="level-head">
      <div>
        <span class="level-label">${getLevelLabel(level.label)}</span>
        <strong>${formatCurrency(level.rewardEarned)}</strong>
      </div>
      <span class="level-badge">${formatPercent(level.progress)}</span>
    </div>
    <div class="requirement-grid">${requirements}</div>
    <div class="progress-track">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <p class="level-foot">${t("adminAggregateLevelFoot", { reached: level.reachedStores, total: level.storesWithLevel })}</p>
  `;

  requestAnimationFrame(() => {
    const fill = card.querySelector(".progress-fill");
    fill.style.width = `${Math.max(0, Math.min(100, level.progress))}%`;
  });

  return card;
}

function renderHistory(container, history, todayKey) {
  container.innerHTML = "";

  if (!history.length) {
    container.innerHTML = `<div class="empty-state">${t("historyEmpty")}</div>`;
    return;
  }

  const maxValue = Math.max(...history.map((entry) => entry.total), 1);

  history.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "history-card";
    if (entry.date === todayKey) {
      item.classList.add("history-card-today");
    }

    const height = Math.max(12, (entry.total / maxValue) * 100);
    const breakdown = entry.breakdown
      .map((part) => `${getShortLabel(part.id, part.shortLabel)}: ${formatNumber(part.value)}`)
      .join(" • ");

    item.innerHTML = `
      <span class="history-value">${formatCount(entry.total)}</span>
      <div class="history-bar-wrap">
        <div class="history-bar" style="height: ${height}%"></div>
      </div>
      <strong>${new Intl.DateTimeFormat(getLocale(), { day: "2-digit", month: "2-digit" }).format(new Date(`${entry.date}T00:00:00`))}</strong>
      <p class="history-meta">${breakdown}</p>
    `;
    container.appendChild(item);
  });
}

function renderStoreDashboard(data) {
  latestDashboard = data;
  storeName.textContent = data.store.name || t("defaultStoreName");
  storeMeta.textContent = [data.store.code, data.store.area].filter(Boolean).join(" • ");
  todayTotal.textContent = formatCount(data.today.total);
  todayDate.textContent = `${t("todayDatePrefix")} ${formatDisplayDate(data.today.date)}`;
  cumulativeTotal.textContent = formatCount(data.cumulative.total);
  cumulativeMeta.textContent = t("cumulativeMeta", {
    target: formatCount(data.cumulative.target),
    progress: formatPercent(data.cumulative.progress)
  });

  const [year, month] = (data.rewardSummary.monthKey || "").split("-");
  totalReward.textContent = formatCurrency(data.rewardSummary.total);
  totalRewardMeta.textContent = t("totalRewardMeta", {
    levelReward: formatCurrency(data.rewardSummary.levelReward),
    categoryRewardTotal: formatCurrency(data.rewardSummary.categoryRewardTotal),
    monthLabel: t("monthLabel", { month, year })
  });

  if (data.achievements.achievedLevel) {
    achievedReward.textContent = formatCurrency(data.achievements.achievedLevel.reward);
    achievedLevel.textContent = t("achievedLevelDone", {
      label: getLevelLabel(data.achievements.achievedLevel.label)
    });
  } else {
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
  }

  if (data.achievements.nextLevel) {
    nextReward.textContent = formatCurrency(data.achievements.nextLevel.reward);
    const missing = data.achievements.nextLevel.missingRequirements
      .slice(0, 2)
      .map((item) => `${getShortLabel(item.id, item.shortLabel)} ${currentLanguage === "es" ? "falta" : "còn"} ${formatCount(item.remaining)}`)
      .join(" • ");
    nextLevel.textContent = missing
      ? t("nextLevelMissing", { label: getLevelLabel(data.achievements.nextLevel.label), missing })
      : t("nextLevelWaiting", { label: getLevelLabel(data.achievements.nextLevel.label) });
  } else {
    nextReward.textContent = "S/ 0";
    nextLevel.textContent = t("nextLevelMax");
  }

  updatedAt.textContent = t("updatedAt", { value: formatTimestamp(data.updatedAt) });
  levelsGrid.innerHTML = "";
  data.levels.forEach((level) => levelsGrid.appendChild(buildLevelCard(level)));
  categoriesGrid.innerHTML = "";
  data.categories.forEach((category) => categoriesGrid.appendChild(buildCategoryCard(category)));
  renderHistory(historyGrid, data.history, data.today.date);
  setStatus(dashboardStatus, t("dashboardSynced"));
}

function createStoreDetailView(storeDashboard) {
  const wrapper = document.createElement("div");
  wrapper.className = "admin-detail-stack";
  const [year, month] = (storeDashboard.rewardSummary.monthKey || "").split("-");

  wrapper.innerHTML = `
    <div class="section-head">
      <div>
        <h3>${t("adminStoreDetailTitle", { name: storeDashboard.store.name, code: storeDashboard.store.code })}</h3>
        <p class="panel-text">${t("adminStoreDetailMeta", { area: storeDashboard.store.area })}</p>
      </div>
    </div>
    <div class="summary-grid admin-detail-summary">
      <article class="summary-card summary-card-main">
        <span>${t("totalRewardLabel")}</span>
        <strong>${formatCurrency(storeDashboard.rewardSummary.total)}</strong>
        <p class="summary-note">${t("totalRewardMeta", {
          levelReward: formatCurrency(storeDashboard.rewardSummary.levelReward),
          categoryRewardTotal: formatCurrency(storeDashboard.rewardSummary.categoryRewardTotal),
          monthLabel: t("monthLabel", { month, year })
        })}</p>
      </article>
      <article class="summary-card summary-card-reward">
        <span>${t("todayTotalLabel")}</span>
        <strong>${formatCount(storeDashboard.today.total)}</strong>
        <p class="summary-note">${t("todayDatePrefix")} ${formatDisplayDate(storeDashboard.today.date)}</p>
      </article>
      <article class="summary-card">
        <span>${t("cumulativeTotalLabel")}</span>
        <strong>${formatCount(storeDashboard.cumulative.total)}</strong>
        <p class="summary-note">${t("cumulativeMeta", {
          target: formatCount(storeDashboard.cumulative.target),
          progress: formatPercent(storeDashboard.cumulative.progress)
        })}</p>
      </article>
      <article class="summary-card">
        <span>${t("achievedRewardLabel")}</span>
        <strong>${storeDashboard.achievements.achievedLevel ? formatCurrency(storeDashboard.achievements.achievedLevel.reward) : t("achievedRewardEmpty")}</strong>
        <p class="summary-note">${storeDashboard.achievements.achievedLevel ? t("achievedLevelDone", { label: getLevelLabel(storeDashboard.achievements.achievedLevel.label) }) : t("achievedRewardEmptyNote")}</p>
      </article>
    </div>
  `;

  const levelsSection = document.createElement("section");
  levelsSection.className = "detail-section";
  levelsSection.innerHTML = `<div class="section-head"><h3>${t("levelSectionTitle")}</h3><p class="panel-text">${t("levelSectionText")}</p></div>`;
  const levelGrid = document.createElement("div");
  levelGrid.className = "levels-grid";
  storeDashboard.levels.forEach((level) => levelGrid.appendChild(buildLevelCard(level)));
  levelsSection.appendChild(levelGrid);

  const categoriesSection = document.createElement("section");
  categoriesSection.className = "detail-section";
  categoriesSection.innerHTML = `<div class="section-head"><h3>${t("categorySectionTitle")}</h3><p class="panel-text">${t("updatedAt", { value: formatTimestamp(storeDashboard.updatedAt) })}</p></div>`;
  const categoryGrid = document.createElement("div");
  categoryGrid.className = "categories-grid";
  storeDashboard.categories.forEach((category) => categoryGrid.appendChild(buildCategoryCard(category)));
  categoriesSection.appendChild(categoryGrid);

  const historySection = document.createElement("section");
  historySection.className = "detail-section";
  historySection.innerHTML = `<div class="section-head"><h3>${t("historySectionTitle")}</h3><p class="panel-text">${t("historySectionText")}</p></div>`;
  const detailHistory = document.createElement("div");
  detailHistory.className = "history-grid";
  renderHistory(detailHistory, storeDashboard.history, storeDashboard.today.date);
  historySection.appendChild(detailHistory);

  wrapper.appendChild(levelsSection);
  wrapper.appendChild(categoriesSection);
  wrapper.appendChild(historySection);
  return wrapper;
}

function populateStoreSelector(items) {
  const currentValue = items.some((item) => item.code === selectedAdminStoreCode)
    ? selectedAdminStoreCode
    : items[0]?.code || "";
  storeSelector.innerHTML = "";

  items.forEach((store) => {
    const option = document.createElement("option");
    option.value = store.code;
    option.textContent = `${store.code} • ${store.name}`;
    if (store.code === currentValue) {
      option.selected = true;
    }
    storeSelector.appendChild(option);
  });

  selectedAdminStoreCode = currentValue;
}

function renderAdminTable(storesPage) {
  adminStoresTableBody.innerHTML = "";

  if (!storesPage?.items?.length) {
    adminStoresTableBody.innerHTML = `<tr><td colspan="6">${t("adminNoStores")}</td></tr>`;
    adminPaginationInfo.textContent = "";
    adminPrevPageBtn.disabled = true;
    adminNextPageBtn.disabled = true;
    return;
  }

  storesPage.items.forEach((store) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${store.code}</td>
      <td>${store.name}</td>
      <td>${store.area || ""}</td>
      <td>${formatCurrency(store.totalReward)}</td>
      <td>${formatPercent(store.cumulativeProgress)}</td>
      <td>${store.achievedLevel ? getLevelLabel(store.achievedLevel.label) : "-"}</td>
    `;
    adminStoresTableBody.appendChild(row);
  });

  const { page, pageSize, totalItems, totalPages, startIndex } = storesPage.pagination;
  const start = totalItems ? startIndex + 1 : 0;
  const end = Math.min(startIndex + pageSize, totalItems);
  adminPaginationInfo.textContent = t("paginationInfo", {
    start,
    end,
    total: totalItems,
    page,
    pages: totalPages
  });
  adminPrevPageBtn.disabled = page <= 1;
  adminNextPageBtn.disabled = page >= totalPages;
}

function showAdminStorePrompt(message = t("adminStorePrompt")) {
  adminStoreDetail.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderAdminDashboard(data) {
  latestAdminDashboard = data;
  if (data.storesPage?.pagination) {
    adminCurrentPage = data.storesPage.pagination.page;
    adminPageSize = data.storesPage.pagination.pageSize;
    adminPageSizeSelect.value = String(adminPageSize);
  }
  adminName.textContent = data.admin.name || t("defaultAdminName");
  adminMeta.textContent = [data.admin.username, t("updatedAt", { value: formatTimestamp(data.updatedAt) })].join(" • ");

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
  data.aggregateCategories.forEach((category) =>
    adminAggregateCategoriesGrid.appendChild(buildAggregateCategoryCard(category))
  );

  adminAggregateLevelsGrid.innerHTML = "";
  data.aggregateLevels.forEach((level) =>
    adminAggregateLevelsGrid.appendChild(buildAggregateLevelCard(level))
  );

  renderAdminTable(data.storesPage);
  if (!adminStoreQuery.trim()) {
    showAdminStorePrompt();
  }
  setAdminTab(activeAdminTab);
  setStatus(adminStatus, t("adminDashboardSynced"));
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    cache: options.cache || "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(localizeServerMessage(data.error || t("unsupportedRequest")));
  }

  return data;
}

async function apiBlobFetch(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = t("unsupportedRequest");
    try {
      const data = await response.json();
      message = localizeServerMessage(data.error || message);
    } catch (_error) {
      // Ignore body parsing failure.
    }
    throw new Error(message);
  }

  return response.blob();
}

async function loadStoreDashboard(forceRefresh = false) {
  refreshBtn.disabled = true;
  setStatus(dashboardStatus, t("dashboardLoading"));

  try {
    const url = forceRefresh ? `/api/dashboard?refresh=1&t=${Date.now()}` : "/api/dashboard";
    const data = await apiFetch(url, { cache: "no-store" });
    renderStoreDashboard(data);
    setViewMode("store");
  } catch (error) {
    clearSession();
    latestDashboard = null;
    setViewMode("auth");
    setStatus(authStatus, error.message || t("authInvalid"), true);
  } finally {
    refreshBtn.disabled = false;
  }
}

async function loadAdminDashboard(forceRefresh = false) {
  adminRefreshBtn.disabled = true;
  exportBtn.disabled = true;
  setStatus(adminStatus, t("adminDashboardLoading"));

  try {
    const params = new URLSearchParams({
      page: String(adminCurrentPage),
      pageSize: String(adminPageSize)
    });
    if (forceRefresh) {
      params.set("refresh", "1");
      params.set("t", String(Date.now()));
    }
    const url = `/api/admin/dashboard?${params.toString()}`;
    const data = await apiFetch(url, { cache: "no-store" });
    renderAdminDashboard(data);
    setViewMode("admin");
  } catch (error) {
    clearSession();
    latestAdminDashboard = null;
    setViewMode("auth");
    setStatus(authStatus, error.message || t("authInvalid"), true);
  } finally {
    adminRefreshBtn.disabled = false;
    exportBtn.disabled = false;
  }
}

async function loadAdminStoreDetail(code, forceRefresh = false) {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();
  if (!normalizedCode) {
    showAdminStorePrompt();
    return;
  }

  showAdminStorePrompt(t("adminStoreDetailLoading"));
  try {
    const params = new URLSearchParams({ code: normalizedCode });
    if (forceRefresh) {
      params.set("refresh", "1");
      params.set("t", String(Date.now()));
    }
    const data = await apiFetch(`/api/admin/store?${params.toString()}`, {
      cache: "no-store"
    });
    adminStoreDetail.innerHTML = "";
    adminStoreDetail.appendChild(createStoreDetailView(data));
  } catch (error) {
    showAdminStorePrompt(error.message || t("adminNoStoreMatch"));
  }
}

async function loadAdminStoreSearch(forceRefresh = false) {
  const query = adminStoreQuery.trim().toUpperCase();
  if (!query) {
    selectedAdminStoreCode = "";
    storeSelector.innerHTML = "";
    showAdminStorePrompt();
    return;
  }

  setStatus(adminStatus, t("adminStoreSearchLoading"));

  try {
    const params = new URLSearchParams({
      query,
      page: "1",
      pageSize: String(adminPageSize)
    });
    if (forceRefresh) {
      params.set("refresh", "1");
      params.set("t", String(Date.now()));
    }
    const data = await apiFetch(`/api/admin/stores?${params.toString()}`, {
      cache: "no-store"
    });
    populateStoreSelector(data.items || []);
    if (data.items?.length) {
      await loadAdminStoreDetail(selectedAdminStoreCode, forceRefresh);
      setStatus(adminStatus, t("adminDashboardSynced"));
    } else {
      showAdminStorePrompt(t("adminNoStoreMatch"));
      setStatus(adminStatus, t("adminDashboardSynced"));
    }
  } catch (error) {
    storeSelector.innerHTML = "";
    showAdminStorePrompt(error.message || t("adminNoStoreMatch"));
    setStatus(adminStatus, error.message || t("unsupportedRequest"), true);
  }
}

async function handleLogout(statusTarget) {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (_error) {
    // Ignore logout network issues and clear session locally.
  } finally {
    latestDashboard = null;
    latestAdminDashboard = null;
    selectedAdminStoreCode = "";
    adminStoreQuery = "";
    adminCurrentPage = 1;
    storeSearchInput.value = "";
    setAdminTab("total");
    clearSession();
    setViewMode("auth");
    setStatus(statusTarget || authStatus, t("logoutDone"));
    setStatus(authStatus, t("logoutDone"));
    codeInput.focus();
  }
}

async function downloadAdminExport() {
  exportBtn.disabled = true;
  setStatus(adminStatus, t("exportLoading"));

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
    setStatus(adminStatus, t("exportDone"));
  } catch (error) {
    setStatus(adminStatus, error.message || t("unsupportedRequest"), true);
  } finally {
    exportBtn.disabled = false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginBtn.disabled = true;
  setStatus(authStatus, t("loginLoading"));

  try {
    const payload = {
      code: codeInput.value.trim().toUpperCase(),
      password: passwordInput.value.trim()
    };
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setToken(data.token);
    setRole(data.role || "store");
    passwordInput.value = "";
    setStatus(authStatus, "");

    if (data.role === "admin") {
      adminCurrentPage = 1;
      adminStoreQuery = "";
      storeSearchInput.value = "";
      setAdminTab("total");
      renderAdminDashboard(data.adminDashboard);
      setViewMode("admin");
    } else {
      renderStoreDashboard(data.dashboard);
      setViewMode("store");
    }
  } catch (error) {
    clearSession();
    setStatus(authStatus, error.message || t("authError"), true);
  } finally {
    loginBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => {
  loadStoreDashboard(true);
});

logoutBtn.addEventListener("click", () => {
  handleLogout(authStatus);
});

adminRefreshBtn.addEventListener("click", () => {
  loadAdminDashboard(true);
  if (activeAdminTab === "store" && adminStoreQuery.trim()) {
    loadAdminStoreSearch(true);
  }
});

adminLogoutBtn.addEventListener("click", () => {
  handleLogout(authStatus);
});

exportBtn.addEventListener("click", () => {
  downloadAdminExport();
});

storeSelector.addEventListener("change", () => {
  selectedAdminStoreCode = storeSelector.value;
  if (selectedAdminStoreCode) {
    loadAdminStoreDetail(selectedAdminStoreCode);
  }
});

storeSearchInput.addEventListener("input", () => {
  adminStoreQuery = storeSearchInput.value;
  loadAdminStoreSearch();
});

adminPageSizeSelect.addEventListener("change", () => {
  adminPageSize = Number(adminPageSizeSelect.value || 20);
  adminCurrentPage = 1;
  if (latestAdminDashboard) {
    loadAdminDashboard();
  }
  if (adminStoreQuery.trim()) {
    loadAdminStoreSearch();
  }
});

adminPrevPageBtn.addEventListener("click", () => {
  if (adminCurrentPage > 1) {
    adminCurrentPage -= 1;
    if (latestAdminDashboard) {
      loadAdminDashboard();
    }
  }
});

adminNextPageBtn.addEventListener("click", () => {
  adminCurrentPage += 1;
  if (latestAdminDashboard) {
    loadAdminDashboard();
  }
});

adminTabTotalBtn.addEventListener("click", () => {
  setAdminTab("total");
});

adminTabStoreBtn.addEventListener("click", () => {
  setAdminTab("store");
});

langEsBtn.addEventListener("click", () => setLanguage("es"));
langViBtn.addEventListener("click", () => setLanguage("vi"));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  });
}

applyStaticTranslations();
setLanguage(currentLanguage);

if (getToken()) {
  if (getRole() === "admin") {
    setViewMode("admin");
    setAdminTab("total");
    adminCurrentPage = 1;
    loadAdminDashboard(true);
  } else {
    setViewMode("store");
    loadStoreDashboard(true);
  }
} else {
  setViewMode("auth");
  storeName.textContent = t("defaultStoreName");
  adminName.textContent = t("defaultAdminName");
  achievedReward.textContent = t("achievedRewardEmpty");
  achievedLevel.textContent = t("achievedRewardEmptyNote");
  codeInput.focus();
}

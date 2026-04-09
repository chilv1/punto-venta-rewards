const storageKey = "sales-program-token";
const languageKey = "sales-program-language";
const authPanel = document.getElementById("authPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const codeInput = document.getElementById("codeInput");
const passwordInput = document.getElementById("passwordInput");
const authStatus = document.getElementById("authStatus");
const dashboardStatus = document.getElementById("dashboardStatus");
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
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const installBtn = document.getElementById("installBtn");
const langEsBtn = document.getElementById("langEsBtn");
const langViBtn = document.getElementById("langViBtn");

const translations = {
  es: {
    htmlLang: "es",
    title: "Programa Punto de Venta",
    heroEyebrow: "Subscription tracker v4",
    heroSubtitle:
      "Sigue los resultados diarios, el acumulado por 4 tipos de líneas y los premios dinámicos por niveles. Cada nivel tiene metas por tipo de línea y se pueden agregar nuevos niveles en el futuro.",
    metricPrepago: "Prepago",
    metricPostpago: "Postpago",
    installBtn: "Instalar app en Android",
    loginEyebrow: "Ingreso",
    loginTitle: "Ingreso del punto de venta",
    loginText:
      "El usuario es el código del punto de venta, por ejemplo `CUSPS0001`. La contraseña es entregada por el sistema.",
    codeLabel: "Código del punto de venta",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Ingrese la contraseña",
    loginBtn: "Entrar al dashboard",
    dashboardEyebrow: "Dashboard diario",
    defaultStoreName: "Punto de venta",
    refreshBtn: "Actualizar",
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
    loginLoading: "Ingresando...",
    logoutDone: "Sesión cerrada.",
    authInvalid: "La sesión no es válida.",
    unsupportedRequest: "No se pudo procesar la solicitud.",
    authError: "No se pudo ingresar.",
    missingFields: "Ingrese código y contraseña.",
    installGroupLabel: "Selector de idioma"
  },
  vi: {
    htmlLang: "vi",
    title: "Programa Punto de Venta",
    heroEyebrow: "Subscription tracker v4",
    heroSubtitle:
      "Theo dõi kết quả ngày, luỹ kế theo 4 loại thuê bao và các mức thưởng động. Mỗi mức có chỉ tiêu riêng cho từng loại thuê bao, và có thể thêm mức mới trong tương lai.",
    metricPrepago: "Trả trước",
    metricPostpago: "Trả sau",
    installBtn: "Cài app trên Android",
    loginEyebrow: "Ingreso",
    loginTitle: "Đăng nhập điểm bán",
    loginText:
      "User là mã code điểm bán, ví dụ `CUSPS0001`. Mật khẩu do hệ thống cấp.",
    codeLabel: "Mã điểm bán",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    loginBtn: "Vào dashboard",
    dashboardEyebrow: "Dashboard ngày",
    defaultStoreName: "Điểm bán",
    refreshBtn: "Làm mới",
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
    loginLoading: "Đang đăng nhập...",
    logoutDone: "Đã đăng xuất.",
    authInvalid: "Phiên đăng nhập không hợp lệ.",
    unsupportedRequest: "Không thể xử lý yêu cầu.",
    authError: "Không thể đăng nhập.",
    missingFields: "Vui lòng nhập mã điểm bán và mật khẩu.",
    installGroupLabel: "Chuyển ngôn ngữ"
  }
};

const serverMessageMap = {
  "Vui lòng đăng nhập.": { es: "Inicie sesión para continuar.", vi: "Vui lòng đăng nhập." },
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.": {
    es: "La sesión expiró. Vuelva a ingresar.",
    vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  },
  "Sai mã điểm bán hoặc mật khẩu.": {
    es: "Código del punto de venta o contraseña incorrectos.",
    vi: "Sai mã điểm bán hoặc mật khẩu."
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
    es: "Ingrese el código del punto de venta y la contraseña.",
    vi: "Vui lòng nhập mã điểm bán và mật khẩu."
  }
};

let deferredInstallPrompt = null;
let currentLanguage = localStorage.getItem(languageKey) || "es";
let latestDashboard = null;

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
  target.textContent = message;
  target.classList.toggle("status-error", isError);
}

function setAuthMode(isAuthenticated) {
  authPanel.classList.toggle("hidden", isAuthenticated);
  dashboardPanel.classList.toggle("hidden", !isAuthenticated);
}

function formatNumber(value) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getCountUnit(value) {
  if (currentLanguage === "es") {
    return Number(value || 0) === 1 ? "Línea" : "Líneas";
  }
  return "TB";
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
  document.getElementById("heroEyebrow").textContent = t("heroEyebrow");
  document.getElementById("heroSubtitle").textContent = t("heroSubtitle");
  document.getElementById("metric1Type").textContent = t("metricPrepago");
  document.getElementById("metric2Type").textContent = t("metricPrepago");
  document.getElementById("metric3Type").textContent = t("metricPostpago");
  document.getElementById("metric4Type").textContent = t("metricPostpago");
  installBtn.textContent = t("installBtn");
  document.getElementById("loginEyebrow").textContent = t("loginEyebrow");
  document.getElementById("loginTitle").textContent = t("loginTitle");
  document.getElementById("loginText").textContent = t("loginText");
  document.getElementById("codeLabel").textContent = t("codeLabel");
  document.getElementById("passwordLabel").textContent = t("passwordLabel");
  passwordInput.placeholder = t("passwordPlaceholder");
  loginBtn.textContent = t("loginBtn");
  document.getElementById("dashboardEyebrow").textContent = t("dashboardEyebrow");
  document.getElementById("todayTotalLabel").textContent = t("todayTotalLabel");
  document.getElementById("cumulativeTotalLabel").textContent = t("cumulativeTotalLabel");
  document.getElementById("totalRewardLabel").textContent = t("totalRewardLabel");
  document.getElementById("achievedRewardLabel").textContent = t("achievedRewardLabel");
  document.getElementById("nextRewardLabel").textContent = t("nextRewardLabel");
  document.getElementById("levelSectionTitle").textContent = t("levelSectionTitle");
  document.getElementById("levelSectionText").textContent = t("levelSectionText");
  document.getElementById("categorySectionTitle").textContent = t("categorySectionTitle");
  document.getElementById("historySectionTitle").textContent = t("historySectionTitle");
  document.getElementById("historySectionText").textContent = t("historySectionText");
  refreshBtn.textContent = t("refreshBtn");
  logoutBtn.textContent = t("logoutBtn");
  langEsBtn.classList.toggle("lang-btn-active", currentLanguage === "es");
  langViBtn.classList.toggle("lang-btn-active", currentLanguage === "vi");

  if (!latestDashboard) {
    todayTotal.textContent = formatCount(0);
    cumulativeTotal.textContent = formatCount(0);
  }
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(languageKey, language);
  applyStaticTranslations();

  if (latestDashboard) {
    renderDashboard(latestDashboard);
  } else {
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
    storeName.textContent = t("defaultStoreName");
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

function renderHistory(history, todayKey) {
  historyGrid.innerHTML = "";

  if (!history.length) {
    historyGrid.innerHTML = `<div class="empty-state">${t("historyEmpty")}</div>`;
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
    historyGrid.appendChild(item);
  });
}

function renderDashboard(data) {
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
    achievedLevel.textContent = t("achievedLevelDone", { label: getLevelLabel(data.achievements.achievedLevel.label) });
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
  renderHistory(data.history, data.today.date);
  setStatus(dashboardStatus, t("dashboardSynced"));
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

async function loadDashboard(forceRefresh = false) {
  refreshBtn.disabled = true;
  setStatus(dashboardStatus, t("dashboardLoading"));

  try {
    const url = forceRefresh
      ? `/api/dashboard?refresh=1&t=${Date.now()}`
      : "/api/dashboard";
    const data = await apiFetch(url, {
      cache: "no-store"
    });
    renderDashboard(data);
    setAuthMode(true);
  } catch (error) {
    setToken("");
    setAuthMode(false);
    setStatus(authStatus, error.message || t("authInvalid"), true);
  } finally {
    refreshBtn.disabled = false;
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
    passwordInput.value = "";
    setAuthMode(true);
    renderDashboard(data.dashboard);
    setStatus(authStatus, "");
  } catch (error) {
    setToken("");
    setStatus(authStatus, error.message || t("authError"), true);
  } finally {
    loginBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => {
  loadDashboard(true);
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST"
    });
  } catch (_error) {
    // Ignore logout network issues and clear session locally.
  } finally {
    setToken("");
    latestDashboard = null;
    setAuthMode(false);
    setStatus(authStatus, t("logoutDone"));
    achievedReward.textContent = t("achievedRewardEmpty");
    achievedLevel.textContent = t("achievedRewardEmptyNote");
    codeInput.focus();
  }
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
  setAuthMode(true);
  loadDashboard(true);
} else {
  setAuthMode(false);
  storeName.textContent = t("defaultStoreName");
  achievedReward.textContent = t("achievedRewardEmpty");
  achievedLevel.textContent = t("achievedRewardEmptyNote");
  codeInput.focus();
}

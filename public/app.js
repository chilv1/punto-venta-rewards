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
let latestAdminAnnouncements = [];
let announcementTargetOptions = { areas: [], stores: [] };
let adminAnnouncementFilter = "all";
let pushGateCopyConfig = null;
let pushGateEditorLanguage = currentLanguage === "vi" ? "vi" : "es";
let pushGateEditorBusy = false;
let adminAppConfig = {
  regionalLeaderboardEnabled: true,
  updatedAt: null,
  updatedBy: "SYSTEM"
};
let adminAppConfigBusy = false;
let serviceWorkerRegistrationPromise = null;
let foregroundPushAnnouncement = null;
let pendingPushAnnouncementPayload = null;
let pendingPushAnnouncementRef = null;
let notificationAudioContext = null;
let authTransitionLocked = false;
let suppressAuthErrorsUntil = 0;
let lastAuthNoticeAt = 0;
let logoutRequestPromise = null;
let lastToastSignature = "";
let lastToastAt = 0;
let storePushState = {
  supported: false,
  enabled: false,
  permission: typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  subscribed: false,
  busy: false,
  publicKey: "",
  storeSubscriptions: 0,
  lastSyncedEndpoint: ""
};

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
const pushStatusText = $("pushStatusText");
const pushStatusHint = $("pushStatusHint");
const pushActionBtn = $("pushActionBtn");
const pushActionText = $("pushActionText");
const pushActionBadge = $("pushActionBadge");

/* New Features DOM */
const storeAnnouncements = $("storeAnnouncements");
const annCarousel = $("annCarousel");
const annDots = $("annDots");
const annDismissBtn = $("annDismissBtn");

/* Simulator & Nudge */
const nudgeBanner = $("nudgeBanner");
const nudgeText = $("nudgeText");
const openSimulatorBtn = $("openSimulatorBtn");
const closeSimulatorBtn = $("closeSimulatorBtn");
const simulatorModal = $("simulatorModal");
const simulatorInputs = $("simulatorInputs");
const simulatorTotalReward = $("simulatorTotalReward");
const leaderboardSection = $("leaderboardSection");
const leaderboardGrid = $("leaderboardGrid");
const leaderboardMeta = $("leaderboardMeta");
const pushAnnouncementModal = $("pushAnnouncementModal");
const pushModalEyebrow = $("pushModalEyebrow");
const pushModalTitle = $("pushModalTitle");
const pushModalTypeBadge = $("pushModalTypeBadge");
const pushModalMessage = $("pushModalMessage");
const pushModalTarget = $("pushModalTarget");
const pushModalTime = $("pushModalTime");
const pushModalViewBtn = $("pushModalViewBtn");
const pushModalDismissBtn = $("pushModalDismissBtn");
const closePushModalBtn = $("closePushModalBtn");
const pushGateModal = $("pushGateModal");
const pushGateEyebrow = $("pushGateEyebrow");
const pushGateTitle = $("pushGateTitle");
const pushGateMessage = $("pushGateMessage");
const pushGateDetails = $("pushGateDetails");
const pushGateStatusTitle = $("pushGateStatusTitle");
const pushGateStatusHint = $("pushGateStatusHint");
const pushGatePrimaryBtn = $("pushGatePrimaryBtn");
const pushGateSecondaryBtn = $("pushGateSecondaryBtn");
const pushGateLogoutBtn = $("pushGateLogoutBtn");
const pushGateEditorForm = $("pushGateEditorForm");
const pushGateEditorMeta = $("pushGateEditorMeta");
const pushGateEditorStatus = $("pushGateEditorStatus");
const pushGateEditorSaveBtn = $("pushGateEditorSaveBtn");
const pushGateEditorResetBtn = $("pushGateEditorResetBtn");
const pushGateEditorEsBtn = $("pushGateEditorEsBtn");
const pushGateEditorViBtn = $("pushGateEditorViBtn");
const pushGateEditorFields = {
  eyebrow: $("pushGateEditorEyebrowInput"),
  title: $("pushGateEditorTitleInput"),
  message: $("pushGateEditorMessageInput"),
  details: $("pushGateEditorDetailsInput"),
  statusPending: $("pushGateEditorPendingInput"),
  statusPendingHint: $("pushGateEditorPendingHintInput"),
  statusDenied: $("pushGateEditorDeniedInput"),
  statusDeniedHint: $("pushGateEditorDeniedHintInput"),
  statusSync: $("pushGateEditorSyncInput"),
  statusSyncHint: $("pushGateEditorSyncHintInput"),
  statusUnsupported: $("pushGateEditorUnsupportedInput"),
  statusUnsupportedHint: $("pushGateEditorUnsupportedHintInput"),
  statusDisabled: $("pushGateEditorDisabledInput"),
  statusDisabledHint: $("pushGateEditorDisabledHintInput"),
  primary: $("pushGateEditorPrimaryInput"),
  secondary: $("pushGateEditorSecondaryInput")
};

/* Announcement admin */
const adminAnnouncementForm = $("adminAnnouncementForm");
const annTitleInput = $("annTitleInput");
const annMessageInput = $("annMessageInput");
const annCharCount = $("annCharCount");
const annTargetSelect = $("annTargetSelect");
const annAreaGroup = $("annAreaGroup");
const annAreaInput = $("annAreaInput");
const annStoreGroup = $("annStoreGroup");
const annStoreCodeInput = $("annStoreCodeInput");
const annExpiresInput = $("annExpiresInput");
const annPinnedInput = $("annPinnedInput");
const annNotifyPushInput = $("annNotifyPushInput");
const annEditingId = $("annEditingId");
const annSubmitBtn = $("annSubmitBtn");
const annCancelEditBtn = $("annCancelEditBtn");
const adminAnnouncementsGrid = $("adminAnnouncementsGrid");
const annTypeError = $("annTypeError");
const annTitleError = $("annTitleError");
const annMessageError = $("annMessageError");
const annTargetError = $("annTargetError");
const annAreaError = $("annAreaError");
const annStoreCodeError = $("annStoreCodeError");
const annExpiresError = $("annExpiresError");
const annFormStatus = $("annFormStatus");
const annFilterSelect = $("annFilterSelect");
const annListMeta = $("annListMeta");
const annAreaSuggestions = $("annAreaSuggestions");
const annStoreSuggestions = $("annStoreSuggestions");

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
const adminFeatureConfigForm = $("adminFeatureConfigForm");
const adminFeatureConfigMeta = $("adminFeatureConfigMeta");
const adminFeatureConfigStatus = $("adminFeatureConfigStatus");
const adminFeatureConfigSaveBtn = $("adminFeatureConfigSaveBtn");
const regionalLeaderboardEnabledInput = $("regionalLeaderboardEnabledInput");
const regionalLeaderboardStateBadge = $("regionalLeaderboardStateBadge");

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
    navAdminPush: "Push",
    moreLangTitle: "Idioma",
    moreLangLabel: "Seleccionar idioma",
    adminFeatureConfigTitle: "Funciones",
    regionalLeaderboardTitle: "Ranking Regional",
    regionalLeaderboardHint: "Controla si el dashboard de tienda muestra la tabla regional.",
    regionalLeaderboardToggleLabel: "Mostrar ranking a los puntos de venta",
    regionalLeaderboardToggleHint: "Cuando esté activo, cada punto verá su top 10 de la zona.",
    regionalLeaderboardStateOn: "Activo",
    regionalLeaderboardStateOff: "Oculto",
    adminFeatureConfigSave: "Guardar cambios",
    adminFeatureConfigSaving: "Guardando...",
    adminFeatureConfigLoading: "Cargando configuración...",
    adminFeatureConfigLoadError: "No se pudo cargar la configuración.",
    adminFeatureConfigSaveDone: "Configuración guardada.",
    adminFeatureConfigInvalid: "No se pudo guardar la configuración.",
    adminFeatureConfigNoUpdates: "Aún no hay cambios manuales en esta configuración.",
    adminFeatureConfigUpdatedMeta: ({ user, date }) => `Último cambio${user ? ` por ${user}` : ""} · ${date}`,
    pushGroupTitle: "Notificaciones",
    pushStatusUnsupported: "Tu navegador no soporta notificaciones push.",
    pushStatusDisabled: "Las notificaciones push no están activas en el servidor.",
    pushStatusDefault: "Activa las notificaciones para recibir anuncios urgentes.",
    pushStatusDenied: "El permiso de notificaciones está bloqueado en este navegador.",
    pushStatusSubscribed: "Notificaciones activas en este dispositivo.",
    pushStatusNotSubscribed: "Este dispositivo aún no está suscrito.",
    pushHintDefault: "Recibe anuncios incluso cuando la app esté cerrada.",
    pushHintDenied: "Debes habilitar notificaciones en la configuración del navegador.",
    pushHintSubscribed: ({ count }) => `${count} dispositivo${count === 1 ? "" : "s"} suscrito${count === 1 ? "" : "s"} para este punto.`,
    pushHintNotSubscribed: "Activa el permiso y sincroniza este dispositivo.",
    pushActionEnable: "Activar notificaciones",
    pushActionDisable: "Desactivar notificaciones",
    pushActionSync: "Sincronizar dispositivo",
    pushBadgeActive: "Activo",
    pushBadgeInactive: "Pendiente",
    pushSubscribing: "Activando notificaciones...",
    pushUnsubscribing: "Desactivando notificaciones...",
    pushSubscribedDone: "Notificaciones activadas.",
    pushUnsubscribedDone: "Notificaciones desactivadas.",
    pushMessageReceived: "Nuevo anuncio recibido.",
    pushModalEyebrow: "Alerta inmediata",
    pushModalView: "Ver ahora",
    pushModalDismiss: "Cerrar",
    pushModalTargetNow: "Atención del punto de venta",
    pushModalAudioLocked: "El navegador bloqueó el audio automático. Mantén la app activa para oír la alerta.",
    pushGateEyebrow: "Notificación obligatoria",
    pushGateTitle: "Activa las notificaciones para continuar",
    pushGateMessage: "Este punto de venta debe mantener activas las notificaciones push para recibir avisos y alertas operativas.",
    pushGateDetails: "Acepta la solicitud del navegador para que el equipo reciba anuncios urgentes, cambios operativos y recordatorios importantes incluso con la app cerrada.",
    pushGateStatusPending: "Esperando permiso del navegador",
    pushGateStatusPendingHint: "Pulsa el botón y acepta la solicitud del navegador.",
    pushGateStatusDenied: "Las notificaciones están bloqueadas",
    pushGateStatusDeniedHint: "Debes habilitarlas en la configuración del navegador y luego tocar \"Ya lo habilité\".",
    pushGateStatusSync: "Sincronizando este dispositivo",
    pushGateStatusSyncHint: "Estamos registrando este equipo para recibir anuncios obligatorios.",
    pushGateStatusUnsupported: "Este navegador no es compatible",
    pushGateStatusUnsupportedHint: "Usa Chrome Android o la PWA instalada para continuar.",
    pushGateStatusDisabled: "El servidor aún no permite push",
    pushGateStatusDisabledHint: "La app no puede continuar hasta que push esté disponible en el servidor.",
    pushGatePrimary: "Activar ahora",
    pushGateRetry: "Ya lo habilité",
    pushGateEditorTitle: "Popup obligatorio de notificaciones",
    pushGateEditorText: "Edita el texto que verá el punto de venta antes de aceptar las notificaciones push.",
    pushGateEditorLangLabel: "Idioma del popup",
    pushGateEditorEyebrowLabel: "Etiqueta superior",
    pushGateEditorTitleLabel: "Título principal",
    pushGateEditorMessageLabel: "Mensaje principal",
    pushGateEditorDetailsLabel: "Contenido adicional",
    pushGateEditorPendingLabel: "Estado: esperando permiso",
    pushGateEditorPendingHintLabel: "Ayuda: esperando permiso",
    pushGateEditorDeniedLabel: "Estado: bloqueado",
    pushGateEditorDeniedHintLabel: "Ayuda: bloqueado",
    pushGateEditorSyncLabel: "Estado: sincronizando",
    pushGateEditorSyncHintLabel: "Ayuda: sincronizando",
    pushGateEditorUnsupportedLabel: "Estado: navegador no compatible",
    pushGateEditorUnsupportedHintLabel: "Ayuda: navegador no compatible",
    pushGateEditorDisabledLabel: "Estado: servidor sin push",
    pushGateEditorDisabledHintLabel: "Ayuda: servidor sin push",
    pushGateEditorPrimaryLabel: "Botón principal",
    pushGateEditorSecondaryLabel: "Botón secundario",
    pushGateEditorSave: "Guardar texto",
    pushGateEditorSaving: "Guardando...",
    pushGateEditorReset: "Cargar texto base",
    pushGateEditorLoading: "Cargando contenido del popup...",
    pushGateEditorLoadError: "No se pudo cargar el contenido del popup.",
    pushGateEditorSaveDone: "Texto del popup guardado.",
    pushGateEditorResetDone: "Se cargó el texto base para este idioma. Guarda para aplicarlo.",
    pushGateEditorInvalid: "Revisa los campos marcados.",
    pushGateEditorNoUpdates: "Aún no se ha personalizado este popup.",
    pushGateEditorUpdatedMeta: ({ user, date }) => `Última edición${user ? ` por ${user}` : ""} · ${date}`,
    pushGateEditorValidationRequired: ({ field }) => `Completa: ${field}.`,
    pushGateEditorValidationTooLong: ({ field, max }) => `${field} no debe superar ${max} caracteres.`,
    moreActionsTitle: "Acciones",
    moreInstall: "Instalar app",
    navAnnouncements: "Avisos",
    announcementSectionTitle: "Novedades y Anuncios",
    announcementSectionText: "Publica mensajes para los puntos de venta. Puedes segmentar por zona o punto específico.",
    announcementTypeLabel: "Tipo de anuncio",
    announcementTypeLabels: {
      info: "Info",
      promo: "Promo",
      alert: "Alerta",
      urgent: "Urgente",
      success: "Logro"
    },
    announcementTypeBadges: {
      info: "INFO",
      promo: "PROMO",
      alert: "ALERTA",
      urgent: "URGENTE",
      success: "LOGRO"
    },
    announcementTitleLabel: "Título",
    announcementTitlePlaceholder: "Ej: ¡Doble de ventas este fin de semana!",
    announcementMessageLabel: "Mensaje",
    announcementMessagePlaceholder: "Detalle del anuncio para los puntos de venta...",
    announcementTargetLabel: "Destinatario",
    announcementTargetOptions: {
      all: "Todos los puntos",
      area: "Por zona",
      store: "Punto específico"
    },
    announcementAreaLabel: "Zona",
    announcementAreaPlaceholder: "Ej: Lima Norte",
    announcementStoreLabel: "Código del punto",
    announcementStorePlaceholder: "CUSPS0001",
    announcementExpiresLabel: "Válido hasta",
    announcementExpiresOptional: "(opcional)",
    announcementPinnedLabel: "📌 Fijar este anuncio (aparece primero siempre)",
    announcementNotifyPushLabel: "🔔 Enviar notificación push ahora",
    announcementNotifyPushHint: "Se enviará a los dispositivos suscritos del destinatario seleccionado.",
    announcementPublish: "Publicar",
    announcementUpdate: "Guardar cambios",
    announcementPublishing: "Publicando...",
    announcementSaving: "Guardando...",
    announcementCancel: "Cancelar",
    announcementFilterLabel: "Mostrar",
    announcementFilters: {
      all: "Todos",
      active: "Activos",
      paused: "Pausados",
      expired: "Expirados",
      pinned: "Fijados"
    },
    announcementLoading: "Cargando anuncios...",
    announcementTargetsLoading: "Cargando puntos y zonas...",
    announcementTargetsError: "No se pudieron cargar los puntos y zonas.",
    announcementEmpty: "No hay anuncios publicados.",
    announcementEmptyFiltered: "No hay anuncios para este filtro.",
    announcementListMeta: ({ shown, total }) => `${shown} de ${total} anuncios`,
    announcementTargetAllLabel: "Todos",
    announcementTargetAreaLabel: ({ area }) => `Zona: ${area}`,
    announcementTargetStoreLabel: ({ code }) => `Punto: ${code}`,
    announcementNoExpiry: "Sin expiración",
    announcementExpiry: ({ date }) => `Hasta ${date}`,
    announcementCreatedMeta: ({ user, date }) => `${user ? `Por ${user} · ` : ""}${date}`,
    announcementStatusActive: "Activo",
    announcementStatusPaused: "Pausado",
    announcementStatusExpired: "Expiró",
    announcementPinnedStatus: "Fijado",
    announcementCreateDone: "Anuncio publicado",
    announcementUpdateDone: "Anuncio actualizado",
    announcementDeleteDone: "Anuncio eliminado",
    announcementPinDone: "Anuncio fijado",
    announcementUnpinDone: "Anuncio desfijado",
    announcementPauseDone: "Anuncio pausado",
    announcementActivateDone: "Anuncio activado",
    announcementDeleteConfirm: "¿Eliminar este anuncio?",
    announcementPauseConfirm: "¿Pausar este anuncio?",
    announcementActivateConfirm: "¿Activar este anuncio?",
    announcementCloseLabel: "Cerrar anuncio",
    announcementDismissed: "Anuncio oculto.",
    announcementStoreUpdatedHint: "Las novedades editadas volverán a mostrarse.",
    announcementPushDisabled: "El anuncio quedó guardado, pero push no está configurado en el servidor.",
    announcementPushNoSubscribers: "El anuncio quedó guardado. No hay dispositivos suscritos para este destino.",
    announcementPushSentSummary: ({ sent, matched }) => `Push enviado a ${sent} de ${matched} dispositivo${matched === 1 ? "" : "s"}.`,
    announcementPushPartialSummary: ({ sent, matched, failed }) => `Push enviado a ${sent}/${matched}. ${failed} fallo${failed === 1 ? "" : "s"}.`,
    announcementFormInvalid: "Revise los campos marcados.",
    announcementValidationTitleRequired: "Ingrese un título.",
    announcementValidationMessageRequired: "Ingrese un mensaje.",
    announcementValidationAreaRequired: "Seleccione una zona.",
    announcementValidationStoreRequired: "Seleccione un punto de venta.",
    announcementValidationAreaInvalid: "La zona no existe en la lista actual.",
    announcementValidationStoreInvalid: "El punto no existe en la lista actual."
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
    navAdminPush: "Push",
    moreLangTitle: "Ngôn ngữ",
    moreLangLabel: "Chọn ngôn ngữ",
    adminFeatureConfigTitle: "Tính năng",
    regionalLeaderboardTitle: "Ranking Regional",
    regionalLeaderboardHint: "Kiểm soát việc dashboard điểm bán có hiển thị bảng xếp hạng khu vực hay không.",
    regionalLeaderboardToggleLabel: "Hiển thị bảng xếp hạng cho điểm bán",
    regionalLeaderboardToggleHint: "Khi bật, mỗi điểm bán sẽ thấy top 10 trong khu vực của mình.",
    regionalLeaderboardStateOn: "Đang bật",
    regionalLeaderboardStateOff: "Đang ẩn",
    adminFeatureConfigSave: "Lưu thay đổi",
    adminFeatureConfigSaving: "Đang lưu...",
    adminFeatureConfigLoading: "Đang tải cấu hình...",
    adminFeatureConfigLoadError: "Không thể tải cấu hình.",
    adminFeatureConfigSaveDone: "Đã lưu cấu hình.",
    adminFeatureConfigInvalid: "Không thể lưu cấu hình.",
    adminFeatureConfigNoUpdates: "Chưa có chỉnh sửa thủ công cho cấu hình này.",
    adminFeatureConfigUpdatedMeta: ({ user, date }) => `Cập nhật gần nhất${user ? ` bởi ${user}` : ""} · ${date}`,
    pushGroupTitle: "Thông báo",
    pushStatusUnsupported: "Trình duyệt này không hỗ trợ push notification.",
    pushStatusDisabled: "Máy chủ chưa bật push notification.",
    pushStatusDefault: "Bật thông báo để nhận announcement khẩn.",
    pushStatusDenied: "Quyền thông báo đang bị chặn trên trình duyệt này.",
    pushStatusSubscribed: "Thiết bị này đã bật thông báo.",
    pushStatusNotSubscribed: "Thiết bị này chưa đăng ký nhận thông báo.",
    pushHintDefault: "Bạn vẫn nhận được announcement ngay cả khi app đã đóng.",
    pushHintDenied: "Cần bật lại quyền thông báo trong cài đặt trình duyệt.",
    pushHintSubscribed: ({ count }) => `${count} thiết bị đang đăng ký cho điểm bán này.`,
    pushHintNotSubscribed: "Hãy cấp quyền và đồng bộ thiết bị này.",
    pushActionEnable: "Bật thông báo",
    pushActionDisable: "Tắt thông báo",
    pushActionSync: "Đồng bộ thiết bị",
    pushBadgeActive: "Đang bật",
    pushBadgeInactive: "Chưa bật",
    pushSubscribing: "Đang bật thông báo...",
    pushUnsubscribing: "Đang tắt thông báo...",
    pushSubscribedDone: "Đã bật thông báo.",
    pushUnsubscribedDone: "Đã tắt thông báo.",
    pushMessageReceived: "Đã nhận thông báo mới.",
    pushModalEyebrow: "Cảnh báo ngay",
    pushModalView: "Xem ngay",
    pushModalDismiss: "Đóng",
    pushModalTargetNow: "Thông báo cho điểm bán",
    pushModalAudioLocked: "Trình duyệt đang chặn âm thanh tự động. Giữ app hoạt động để nghe cảnh báo.",
    pushGateEyebrow: "Bắt buộc bật thông báo",
    pushGateTitle: "Bật thông báo để tiếp tục",
    pushGateMessage: "Điểm bán này phải luôn bật push notification để nhận announcement và cảnh báo vận hành.",
    pushGateDetails: "Hãy chấp nhận hộp thoại của trình duyệt để thiết bị nhận ngay thông báo khẩn, thay đổi vận hành và nhắc việc quan trọng kể cả khi app đã đóng.",
    pushGateStatusPending: "Đang chờ quyền từ trình duyệt",
    pushGateStatusPendingHint: "Bấm nút bên dưới và chấp nhận hộp thoại cấp quyền.",
    pushGateStatusDenied: "Thông báo đang bị chặn",
    pushGateStatusDeniedHint: "Hãy bật lại trong cài đặt trình duyệt rồi bấm \"Tôi đã bật xong\".",
    pushGateStatusSync: "Đang đồng bộ thiết bị này",
    pushGateStatusSyncHint: "Đang đăng ký thiết bị để nhận thông báo bắt buộc.",
    pushGateStatusUnsupported: "Trình duyệt này không hỗ trợ",
    pushGateStatusUnsupportedHint: "Hãy dùng Chrome Android hoặc bản PWA đã cài để tiếp tục.",
    pushGateStatusDisabled: "Máy chủ chưa bật push",
    pushGateStatusDisabledHint: "App chưa thể tiếp tục cho tới khi máy chủ bật push.",
    pushGatePrimary: "Bật ngay",
    pushGateRetry: "Tôi đã bật xong",
    pushGateEditorTitle: "Popup bắt buộc bật thông báo",
    pushGateEditorText: "Chỉnh nội dung mà điểm bán sẽ thấy trước khi chấp nhận nhận push notification.",
    pushGateEditorLangLabel: "Ngôn ngữ popup",
    pushGateEditorEyebrowLabel: "Nhãn phía trên",
    pushGateEditorTitleLabel: "Tiêu đề chính",
    pushGateEditorMessageLabel: "Nội dung chính",
    pushGateEditorDetailsLabel: "Nội dung bổ sung",
    pushGateEditorPendingLabel: "Trạng thái: chờ cấp quyền",
    pushGateEditorPendingHintLabel: "Hướng dẫn: chờ cấp quyền",
    pushGateEditorDeniedLabel: "Trạng thái: bị chặn",
    pushGateEditorDeniedHintLabel: "Hướng dẫn: bị chặn",
    pushGateEditorSyncLabel: "Trạng thái: đang đồng bộ",
    pushGateEditorSyncHintLabel: "Hướng dẫn: đang đồng bộ",
    pushGateEditorUnsupportedLabel: "Trạng thái: trình duyệt không hỗ trợ",
    pushGateEditorUnsupportedHintLabel: "Hướng dẫn: trình duyệt không hỗ trợ",
    pushGateEditorDisabledLabel: "Trạng thái: máy chủ chưa bật push",
    pushGateEditorDisabledHintLabel: "Hướng dẫn: máy chủ chưa bật push",
    pushGateEditorPrimaryLabel: "Nút chính",
    pushGateEditorSecondaryLabel: "Nút phụ",
    pushGateEditorSave: "Lưu nội dung",
    pushGateEditorSaving: "Đang lưu...",
    pushGateEditorReset: "Nạp nội dung gốc",
    pushGateEditorLoading: "Đang tải nội dung popup...",
    pushGateEditorLoadError: "Không thể tải nội dung popup.",
    pushGateEditorSaveDone: "Đã lưu nội dung popup.",
    pushGateEditorResetDone: "Đã nạp nội dung gốc cho ngôn ngữ này. Hãy lưu để áp dụng.",
    pushGateEditorInvalid: "Vui lòng kiểm tra các trường đang lỗi.",
    pushGateEditorNoUpdates: "Popup này chưa được chỉnh riêng.",
    pushGateEditorUpdatedMeta: ({ user, date }) => `Cập nhật gần nhất${user ? ` bởi ${user}` : ""} · ${date}`,
    pushGateEditorValidationRequired: ({ field }) => `Vui lòng nhập: ${field}.`,
    pushGateEditorValidationTooLong: ({ field, max }) => `${field} không được vượt quá ${max} ký tự.`,
    moreActionsTitle: "Hành động",
    moreInstall: "Cài app",
    navAnnouncements: "Thông báo",
    announcementSectionTitle: "Tin tức và Thông báo",
    announcementSectionText: "Gửi thông báo cho điểm bán. Có thể nhắm theo khu vực hoặc điểm bán cụ thể.",
    announcementTypeLabel: "Loại thông báo",
    announcementTypeLabels: {
      info: "Info",
      promo: "Khuyến mãi",
      alert: "Cảnh báo",
      urgent: "Khẩn",
      success: "Thành tích"
    },
    announcementTypeBadges: {
      info: "INFO",
      promo: "PROMO",
      alert: "CẢNH BÁO",
      urgent: "KHẨN",
      success: "THÀNH TÍCH"
    },
    announcementTitleLabel: "Tiêu đề",
    announcementTitlePlaceholder: "Ví dụ: Cuối tuần này nhân đôi doanh số!",
    announcementMessageLabel: "Nội dung",
    announcementMessagePlaceholder: "Nội dung thông báo gửi đến các điểm bán...",
    announcementTargetLabel: "Đối tượng nhận",
    announcementTargetOptions: {
      all: "Tất cả điểm bán",
      area: "Theo khu vực",
      store: "Điểm bán cụ thể"
    },
    announcementAreaLabel: "Khu vực",
    announcementAreaPlaceholder: "Ví dụ: Lima Norte",
    announcementStoreLabel: "Mã điểm bán",
    announcementStorePlaceholder: "CUSPS0001",
    announcementExpiresLabel: "Hiệu lực đến",
    announcementExpiresOptional: "(tuỳ chọn)",
    announcementPinnedLabel: "📌 Ghim thông báo này (luôn hiện đầu tiên)",
    announcementNotifyPushLabel: "🔔 Gửi push notification ngay",
    announcementNotifyPushHint: "Thông báo sẽ được gửi tới các thiết bị đã đăng ký của nhóm nhận đã chọn.",
    announcementPublish: "Đăng thông báo",
    announcementUpdate: "Lưu thay đổi",
    announcementPublishing: "Đang đăng...",
    announcementSaving: "Đang lưu...",
    announcementCancel: "Huỷ",
    announcementFilterLabel: "Hiển thị",
    announcementFilters: {
      all: "Tất cả",
      active: "Đang hoạt động",
      paused: "Đã tạm dừng",
      expired: "Đã hết hạn",
      pinned: "Đã ghim"
    },
    announcementLoading: "Đang tải thông báo...",
    announcementTargetsLoading: "Đang tải điểm bán và khu vực...",
    announcementTargetsError: "Không thể tải danh sách điểm bán và khu vực.",
    announcementEmpty: "Chưa có thông báo nào.",
    announcementEmptyFiltered: "Không có thông báo phù hợp bộ lọc.",
    announcementListMeta: ({ shown, total }) => `${shown}/${total} thông báo`,
    announcementTargetAllLabel: "Tất cả",
    announcementTargetAreaLabel: ({ area }) => `Khu vực: ${area}`,
    announcementTargetStoreLabel: ({ code }) => `Điểm bán: ${code}`,
    announcementNoExpiry: "Không hết hạn",
    announcementExpiry: ({ date }) => `Đến ${date}`,
    announcementCreatedMeta: ({ user, date }) => `${user ? `Bởi ${user} · ` : ""}${date}`,
    announcementStatusActive: "Đang hoạt động",
    announcementStatusPaused: "Tạm dừng",
    announcementStatusExpired: "Đã hết hạn",
    announcementPinnedStatus: "Đã ghim",
    announcementCreateDone: "Đã đăng thông báo",
    announcementUpdateDone: "Đã cập nhật thông báo",
    announcementDeleteDone: "Đã xoá thông báo",
    announcementPinDone: "Đã ghim thông báo",
    announcementUnpinDone: "Đã bỏ ghim thông báo",
    announcementPauseDone: "Đã tạm dừng thông báo",
    announcementActivateDone: "Đã kích hoạt thông báo",
    announcementDeleteConfirm: "Xoá thông báo này?",
    announcementPauseConfirm: "Tạm dừng thông báo này?",
    announcementActivateConfirm: "Kích hoạt lại thông báo này?",
    announcementCloseLabel: "Đóng thông báo",
    announcementDismissed: "Đã ẩn thông báo.",
    announcementStoreUpdatedHint: "Thông báo đã chỉnh sửa sẽ hiện lại.",
    announcementPushDisabled: "Thông báo đã lưu nhưng máy chủ chưa cấu hình push.",
    announcementPushNoSubscribers: "Thông báo đã lưu. Chưa có thiết bị nào đăng ký cho nhóm nhận này.",
    announcementPushSentSummary: ({ sent, matched }) => `Đã gửi push tới ${sent}/${matched} thiết bị.`,
    announcementPushPartialSummary: ({ sent, matched, failed }) => `Đã gửi push ${sent}/${matched}. Lỗi ${failed} thiết bị.`,
    announcementFormInvalid: "Vui lòng kiểm tra các trường đang lỗi.",
    announcementValidationTitleRequired: "Nhập tiêu đề.",
    announcementValidationMessageRequired: "Nhập nội dung.",
    announcementValidationAreaRequired: "Chọn khu vực.",
    announcementValidationStoreRequired: "Chọn điểm bán.",
    announcementValidationAreaInvalid: "Khu vực không có trong danh sách hiện tại.",
    announcementValidationStoreInvalid: "Điểm bán không có trong danh sách hiện tại."
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
  "Vui lòng nhập mã điểm bán.": { es: "Ingrese código.", vi: "Nhập mã điểm bán." },
  "Không thể tải danh sách thông báo.": { es: "No se pudo cargar anuncios.", vi: "Không thể tải danh sách thông báo." },
  "Không thể tải danh sách điểm bán.": { es: "No se pudieron cargar puntos y zonas.", vi: "Không thể tải danh sách điểm bán và khu vực." },
  "Dữ liệu thông báo không hợp lệ.": { es: "Datos de anuncio no válidos.", vi: "Dữ liệu thông báo không hợp lệ." },
  "Không thể lưu thông báo.": { es: "No se pudo guardar el anuncio.", vi: "Không thể lưu thông báo." },
  "Không thể cập nhật thông báo.": { es: "No se pudo actualizar el anuncio.", vi: "Không thể cập nhật thông báo." },
  "Không thể thay đổi ghim thông báo.": { es: "No se pudo cambiar el fijado.", vi: "Không thể thay đổi ghim thông báo." },
  "Không thể thay đổi trạng thái thông báo.": { es: "No se pudo cambiar el estado.", vi: "Không thể thay đổi trạng thái thông báo." },
  "Không thể xóa thông báo.": { es: "No se pudo eliminar el anuncio.", vi: "Không thể xóa thông báo." },
  "Thông báo không tồn tại.": { es: "El anuncio no existe.", vi: "Thông báo không tồn tại." },
  "Tiêu đề thông báo là bắt buộc.": { es: "El título es obligatorio.", vi: "Tiêu đề thông báo là bắt buộc." },
  "Tiêu đề thông báo không được vượt quá 80 ký tự.": { es: "El título no puede superar 80 caracteres.", vi: "Tiêu đề thông báo không được vượt quá 80 ký tự." },
  "Nội dung thông báo là bắt buộc.": { es: "El mensaje es obligatorio.", vi: "Nội dung thông báo là bắt buộc." },
  "Nội dung thông báo không được vượt quá 300 ký tự.": { es: "El mensaje no puede superar 300 caracteres.", vi: "Nội dung thông báo không được vượt quá 300 ký tự." },
  "Loại thông báo không hợp lệ.": { es: "El tipo de anuncio no es válido.", vi: "Loại thông báo không hợp lệ." },
  "Đối tượng nhận thông báo không hợp lệ.": { es: "El destinatario no es válido.", vi: "Đối tượng nhận thông báo không hợp lệ." },
  "Vui lòng chọn khu vực.": { es: "Seleccione una zona.", vi: "Vui lòng chọn khu vực." },
  "Khu vực không tồn tại trên hệ thống.": { es: "La zona no existe en el sistema.", vi: "Khu vực không tồn tại trên hệ thống." },
  "Vui lòng chọn điểm bán.": { es: "Seleccione un punto de venta.", vi: "Vui lòng chọn điểm bán." },
  "Điểm bán không tồn tại trên hệ thống.": { es: "El punto de venta no existe.", vi: "Điểm bán không tồn tại trên hệ thống." },
  "Ngày hết hạn không hợp lệ.": { es: "La fecha de vencimiento no es válida.", vi: "Ngày hết hạn không hợp lệ." },
  "Ngày hết hạn phải từ hôm nay trở đi.": { es: "La fecha de vencimiento debe ser desde hoy.", vi: "Ngày hết hạn phải từ hôm nay trở đi." },
  "Không thể tải cấu hình thông báo.": { es: "No se pudo cargar la configuración de notificaciones.", vi: "Không thể tải cấu hình thông báo." },
  "Không thể tải nội dung popup bật thông báo.": { es: "No se pudo cargar el contenido del popup.", vi: "Không thể tải nội dung popup." },
  "Không thể lưu nội dung popup bật thông báo.": { es: "No se pudo guardar el contenido del popup.", vi: "Không thể lưu nội dung popup." },
  "Dữ liệu popup bật thông báo không hợp lệ.": { es: "El contenido del popup no es válido.", vi: "Dữ liệu popup không hợp lệ." },
  "Ngôn ngữ popup không hợp lệ.": { es: "El idioma del popup no es válido.", vi: "Ngôn ngữ popup không hợp lệ." },
  "Không thể tải cấu hình ứng dụng.": { es: "No se pudo cargar la configuración.", vi: "Không thể tải cấu hình ứng dụng." },
  "Không thể lưu cấu hình ứng dụng.": { es: "No se pudo guardar la configuración.", vi: "Không thể lưu cấu hình ứng dụng." },
  "Dữ liệu cấu hình ứng dụng không hợp lệ.": { es: "La configuración no es válida.", vi: "Dữ liệu cấu hình ứng dụng không hợp lệ." },
  "Trạng thái hiển thị Ranking Regional là bắt buộc.": { es: "El estado del Ranking Regional es obligatorio.", vi: "Trạng thái hiển thị Ranking Regional là bắt buộc." },
  "Trạng thái hiển thị Ranking Regional không hợp lệ.": { es: "El estado del Ranking Regional no es válido.", vi: "Trạng thái hiển thị Ranking Regional không hợp lệ." },
  "Push notification chưa được cấu hình trên máy chủ.": { es: "Push no está configurado en el servidor.", vi: "Máy chủ chưa cấu hình push notification." },
  "Subscription push không hợp lệ.": { es: "La suscripción push no es válida.", vi: "Subscription push không hợp lệ." },
  "Không thể lưu đăng ký thông báo.": { es: "No se pudo guardar la suscripción.", vi: "Không thể lưu đăng ký thông báo." },
  "Endpoint push là bắt buộc.": { es: "El endpoint push es obligatorio.", vi: "Endpoint push là bắt buộc." },
  "Không thể hủy đăng ký thông báo.": { es: "No se pudo cancelar la suscripción.", vi: "Không thể hủy đăng ký thông báo." }
};

const PUSH_GATE_COPY_TRANSLATION_KEYS = {
  eyebrow: "pushGateEyebrow",
  title: "pushGateTitle",
  message: "pushGateMessage",
  details: "pushGateDetails",
  statusPending: "pushGateStatusPending",
  statusPendingHint: "pushGateStatusPendingHint",
  statusDenied: "pushGateStatusDenied",
  statusDeniedHint: "pushGateStatusDeniedHint",
  statusSync: "pushGateStatusSync",
  statusSyncHint: "pushGateStatusSyncHint",
  statusUnsupported: "pushGateStatusUnsupported",
  statusUnsupportedHint: "pushGateStatusUnsupportedHint",
  statusDisabled: "pushGateStatusDisabled",
  statusDisabledHint: "pushGateStatusDisabledHint",
  primary: "pushGatePrimary",
  secondary: "pushGateRetry"
};

const PUSH_GATE_EDITOR_FIELD_LABEL_KEYS = {
  eyebrow: "pushGateEditorEyebrowLabel",
  title: "pushGateEditorTitleLabel",
  message: "pushGateEditorMessageLabel",
  details: "pushGateEditorDetailsLabel",
  statusPending: "pushGateEditorPendingLabel",
  statusPendingHint: "pushGateEditorPendingHintLabel",
  statusDenied: "pushGateEditorDeniedLabel",
  statusDeniedHint: "pushGateEditorDeniedHintLabel",
  statusSync: "pushGateEditorSyncLabel",
  statusSyncHint: "pushGateEditorSyncHintLabel",
  statusUnsupported: "pushGateEditorUnsupportedLabel",
  statusUnsupportedHint: "pushGateEditorUnsupportedHintLabel",
  statusDisabled: "pushGateEditorDisabledLabel",
  statusDisabledHint: "pushGateEditorDisabledHintLabel",
  primary: "pushGateEditorPrimaryLabel",
  secondary: "pushGateEditorSecondaryLabel"
};

const PUSH_GATE_COPY_FIELD_LIMITS = {
  eyebrow: 60,
  title: 120,
  message: 500,
  details: 500,
  statusPending: 90,
  statusPendingHint: 220,
  statusDenied: 90,
  statusDeniedHint: 220,
  statusSync: 90,
  statusSyncHint: 220,
  statusUnsupported: 90,
  statusUnsupportedHint: 220,
  statusDisabled: 90,
  statusDisabledHint: 220,
  primary: 40,
  secondary: 40
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

function getAnnouncementLocaleValue(group, key, fallback = "") {
  return translations[currentLanguage][group]?.[key] ?? fallback;
}

function getTranslationValue(lang, key, params = {}) {
  const value = translations[lang]?.[key];
  return typeof value === "function" ? value(params) : (value ?? key);
}

function buildDefaultPushGateCopyConfig() {
  const config = {
    es: {},
    vi: {},
    updatedAt: null,
    updatedBy: "SYSTEM"
  };

  ["es", "vi"].forEach((lang) => {
    Object.entries(PUSH_GATE_COPY_TRANSLATION_KEYS).forEach(([field, key]) => {
      config[lang][field] = String(getTranslationValue(lang, key)).trim();
    });
  });

  return config;
}

function normalizePushGateCopyConfig(value) {
  const defaults = buildDefaultPushGateCopyConfig();
  const normalized = {
    es: {},
    vi: {},
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : defaults.updatedAt,
    updatedBy: String(value?.updatedBy || defaults.updatedBy).trim() || defaults.updatedBy
  };

  ["es", "vi"].forEach((lang) => {
    Object.keys(PUSH_GATE_COPY_TRANSLATION_KEYS).forEach((field) => {
      const source = value?.[lang]?.[field];
      normalized[lang][field] =
        source === undefined || source === null
          ? defaults[lang][field]
          : String(source).trim();
    });
  });

  return normalized;
}

function getPushGateCopyConfig() {
  if (!pushGateCopyConfig) {
    pushGateCopyConfig = buildDefaultPushGateCopyConfig();
  }
  pushGateCopyConfig = normalizePushGateCopyConfig(pushGateCopyConfig);
  return pushGateCopyConfig;
}

function getPushGateCopyLocale(lang = currentLanguage) {
  const locale = lang === "vi" ? "vi" : "es";
  return getPushGateCopyConfig()[locale];
}

function applyPushGateCopyConfig(value) {
  pushGateCopyConfig = normalizePushGateCopyConfig(value);
  renderPushGateState();
  renderPushGateEditorMeta();
}

function createDefaultAdminAppConfig() {
  return {
    regionalLeaderboardEnabled: true,
    updatedAt: null,
    updatedBy: "SYSTEM"
  };
}

function normalizeAdminAppConfig(value) {
  const defaults = createDefaultAdminAppConfig();
  return {
    regionalLeaderboardEnabled:
      value?.regionalLeaderboardEnabled === undefined
        ? defaults.regionalLeaderboardEnabled
        : Boolean(value.regionalLeaderboardEnabled),
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : defaults.updatedAt,
    updatedBy: String(value?.updatedBy || defaults.updatedBy).trim() || defaults.updatedBy
  };
}

function applyAdminAppConfig(value) {
  adminAppConfig = normalizeAdminAppConfig(value);
  renderAdminAppConfigValues();
}

function getAnnouncementTypeLabel(type) {
  return getAnnouncementLocaleValue("announcementTypeLabels", type, type);
}

function getAnnouncementTypeBadge(type) {
  return getAnnouncementLocaleValue(
    "announcementTypeBadges",
    type,
    String(type || "").toUpperCase()
  );
}

function getAnnouncementFilterOptionLabel(filter) {
  return getAnnouncementLocaleValue("announcementFilters", filter, filter);
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

function formatDateOnly(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(getLocale(), { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

function setTextById(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function createDefaultStorePushState() {
  return {
    supported: isPushSupported(),
    enabled: false,
    permission: getPushPermissionState(),
    subscribed: false,
    busy: false,
    publicKey: "",
    storeSubscriptions: 0,
    lastSyncedEndpoint: ""
  };
}

function resetAuthTransitionState() {
  authTransitionLocked = false;
  suppressAuthErrorsUntil = 0;
  lastAuthNoticeAt = 0;
}

function performLocalSignOut(options = {}) {
  const { notify = false } = options;

  latestDashboard = null;
  latestAdminDashboard = null;
  latestAdminAnnouncements = [];
  announcementTargetOptions = { areas: [], stores: [] };
  adminAnnouncementFilter = "all";
  selectedAdminStoreCode = "";
  adminStoreQuery = "";
  adminCurrentPage = 1;
  cachedAllStoreItems = null;
  if (storeSearchInput) {
    storeSearchInput.value = "";
  }
  if (adminAnnouncementsGrid) {
    adminAnnouncementsGrid.innerHTML = "";
  }
  resetAnnForm();
  foregroundPushAnnouncement = null;
  pendingPushAnnouncementPayload = null;
  pendingPushAnnouncementRef = null;
  closePushAnnouncementModal();
  closePushGateModal(true);
  storePushState = createDefaultStorePushState();
  pushGateCopyConfig = buildDefaultPushGateCopyConfig();
  pushGateEditorLanguage = currentLanguage === "vi" ? "vi" : "es";
  setPushGateEditorBusy(false);
  renderPushGateEditorValues();
  adminAppConfig = createDefaultAdminAppConfig();
  setAdminAppConfigBusy(false);
  setAdminAppConfigStatus("");
  renderAdminAppConfigValues();
  renderStorePushState();
  clearSession();
  authStatus.textContent = "";
  authStatus.classList.remove("is-error");
  showLogin();
  codeInput.focus();

  if (notify) {
    showToast(t("logoutDone"), "success");
  }
}

function handleSessionError(error, options = {}) {
  if (!error?.isSessionError) {
    return false;
  }

  const { showNotice = true } = options;
  if (!authTransitionLocked) {
    authTransitionLocked = true;
    performLocalSignOut({ notify: false });
  }

  if (
    showNotice &&
    Date.now() >= suppressAuthErrorsUntil &&
    Date.now() - lastAuthNoticeAt > 1500
  ) {
    lastAuthNoticeAt = Date.now();
    showToast(error.message || t("authInvalid"), "error");
  }

  return true;
}

function getPushPermissionState() {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

function isPushSupported() {
  return Boolean(
    window.isSecureContext &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(normalized);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  if (!serviceWorkerRegistrationPromise) {
    serviceWorkerRegistrationPromise = navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .catch(() => null);
  }

  return serviceWorkerRegistrationPromise;
}

function setStorePushBusy(isBusy) {
  storePushState.busy = isBusy;
  if (pushActionBtn) {
    pushActionBtn.disabled = isBusy || !storePushState.supported;
  }
  renderPushGateState();
}

function renderStorePushState() {
  if (!pushStatusText || !pushStatusHint || !pushActionText || !pushActionBadge || !pushActionBtn) {
    return;
  }

  const permission = getPushPermissionState();
  storePushState.supported = isPushSupported();
  storePushState.permission = permission;

  if (!storePushState.supported) {
    pushStatusText.textContent = t("pushStatusUnsupported");
    pushStatusHint.textContent = t("pushHintDenied");
    pushActionText.textContent = t("pushActionEnable");
    pushActionBadge.textContent = "";
    pushActionBtn.disabled = true;
    renderPushGateState();
    return;
  }

  if (!storePushState.enabled) {
    pushStatusText.textContent = t("pushStatusDisabled");
    pushStatusHint.textContent = t("pushHintNotSubscribed");
    pushActionText.textContent = t("pushActionEnable");
    pushActionBadge.textContent = "";
    pushActionBtn.disabled = true;
    renderPushGateState();
    return;
  }

  if (storePushState.busy) {
    pushActionText.textContent = storePushState.subscribed ? t("pushUnsubscribing") : t("pushSubscribing");
    pushActionBadge.textContent = storePushState.subscribed ? t("pushBadgeActive") : t("pushBadgeInactive");
    pushActionBtn.disabled = true;
    renderPushGateState();
    return;
  }

  if (permission === "denied") {
    pushStatusText.textContent = t("pushStatusDenied");
    pushStatusHint.textContent = t("pushHintDenied");
    pushActionText.textContent = t("pushActionEnable");
    pushActionBadge.textContent = t("pushBadgeInactive");
    pushActionBtn.disabled = false;
    renderPushGateState();
    return;
  }

  if (storePushState.subscribed) {
    pushStatusText.textContent = t("pushStatusSubscribed");
    pushStatusHint.textContent = t("pushHintSubscribed", {
      count: Number(storePushState.storeSubscriptions || 0)
    });
    pushActionText.textContent = t("pushActionSync");
    pushActionBadge.textContent = t("pushBadgeActive");
    pushActionBtn.disabled = false;
    renderPushGateState();
    return;
  }

  pushStatusText.textContent =
    permission === "granted" ? t("pushStatusNotSubscribed") : t("pushStatusDefault");
  pushStatusHint.textContent =
    permission === "granted" ? t("pushHintNotSubscribed") : t("pushHintDefault");
  pushActionText.textContent =
    permission === "granted" ? t("pushActionSync") : t("pushActionEnable");
  pushActionBadge.textContent = t("pushBadgeInactive");
  pushActionBtn.disabled = false;
  renderPushGateState();
}

async function syncStorePushSubscription(subscription, options = {}) {
  const payload = subscription?.toJSON ? subscription.toJSON() : subscription;
  const data = await apiFetch("/api/store/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription: payload })
  });
  storePushState.enabled = Boolean(data.enabled);
  storePushState.storeSubscriptions = Number(data.storeSubscriptions || 0);
  storePushState.subscribed = true;
  storePushState.lastSyncedEndpoint = String(payload?.endpoint || subscription?.endpoint || "").trim();
  renderStorePushState();
  if (!options.silent) {
    showToast(t("pushSubscribedDone"), "success");
  }
  return data;
}

async function loadStorePushStatus(options = {}) {
  const { syncExisting = false, silent = false } = options;
  storePushState.supported = isPushSupported();
  storePushState.permission = getPushPermissionState();

  if (getRole() !== "store" || !getToken()) {
    storePushState.enabled = false;
    storePushState.subscribed = false;
    storePushState.publicKey = "";
    storePushState.storeSubscriptions = 0;
    renderStorePushState();
    return;
  }

  if (!storePushState.supported) {
    renderStorePushState();
    return;
  }

  try {
    const status = await apiFetch("/api/store/push/status");
    storePushState.enabled = Boolean(status.enabled && status.publicKey);
    storePushState.publicKey = status.publicKey || "";
    storePushState.storeSubscriptions = Number(status.storeSubscriptions || 0);
    applyPushGateCopyConfig(status.gateCopy);

    const registration = await registerServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    storePushState.subscribed = Boolean(subscription);
    const endpoint = String(subscription?.endpoint || "").trim();
    if (!endpoint) {
      storePushState.lastSyncedEndpoint = "";
    }

    if (
      syncExisting &&
      storePushState.enabled &&
      storePushState.permission === "granted" &&
      subscription &&
      endpoint &&
      storePushState.lastSyncedEndpoint !== endpoint
    ) {
      await syncStorePushSubscription(subscription, { silent: true });
    }
  } catch (error) {
    if (handleSessionError(error, { showNotice: !silent })) {
      return;
    }
    storePushState.enabled = false;
    storePushState.publicKey = "";
    storePushState.subscribed = false;
    storePushState.lastSyncedEndpoint = "";
    if (!silent) {
      showToast(error.message || t("pushStatusDisabled"), "error");
    }
  } finally {
    renderStorePushState();
  }
}

async function subscribeStorePush() {
  if (!isPushSupported()) {
    renderStorePushState();
    return;
  }

  setStorePushBusy(true);
  try {
    if (!storePushState.enabled || !storePushState.publicKey) {
      await loadStorePushStatus({ silent: true });
    }

    if (!storePushState.enabled || !storePushState.publicKey) {
      throw new Error(localizeServerMessage("Push notification chưa được cấu hình trên máy chủ."));
    }

    let permission = getPushPermissionState();
    if (permission === "denied") {
      showToast(t("pushStatusDenied"), "error");
      renderStorePushState();
      return;
    }
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }
    storePushState.permission = permission;

    if (permission !== "granted") {
      showToast(t("pushStatusDenied"), "error");
      renderStorePushState();
      return;
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      renderStorePushState();
      return;
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(storePushState.publicKey)
      });
    }

    await syncStorePushSubscription(subscription);
  } catch (error) {
    if (handleSessionError(error)) {
      return;
    }
    showToast(error.message || t("pushStatusDisabled"), "error");
  } finally {
    setStorePushBusy(false);
    renderStorePushState();
  }
}

async function unsubscribeStorePush() {
  if (!isPushSupported()) {
    renderStorePushState();
    return;
  }

  setStorePushBusy(true);
  try {
    const registration = await registerServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    const endpoint = subscription?.endpoint || "";

    if (subscription) {
      await subscription.unsubscribe().catch(() => null);
    }

    if (endpoint) {
      const result = await apiFetch("/api/store/push/subscribe", {
        method: "DELETE",
        body: JSON.stringify({ endpoint })
      });
      storePushState.storeSubscriptions = Number(result.storeSubscriptions || 0);
    }

    storePushState.subscribed = false;
    storePushState.lastSyncedEndpoint = "";
    renderStorePushState();
    showToast(t("pushUnsubscribedDone"), "success");
  } catch (error) {
    if (handleSessionError(error)) {
      return;
    }
    showToast(error.message || t("pushStatusDisabled"), "error");
  } finally {
    setStorePushBusy(false);
    renderStorePushState();
  }
}

function showAnnouncementPushFeedback(pushResult) {
  if (!pushResult?.requested) {
    return;
  }

  if (pushResult.enabled === false) {
    showToast(t("announcementPushDisabled"), "info", 4500);
    return;
  }

  if (pushResult.skipped === "no-subscribers") {
    showToast(t("announcementPushNoSubscribers"), "info", 4500);
    return;
  }

  if (pushResult.failed > 0) {
    showToast(
      t("announcementPushPartialSummary", {
        sent: Number(pushResult.sent || 0),
        matched: Number(pushResult.matched || 0),
        failed: Number(pushResult.failed || 0)
      }),
      "info",
      4500
    );
    return;
  }

  if (Number(pushResult.sent || 0) > 0 || Number(pushResult.matched || 0) > 0) {
    showToast(
      t("announcementPushSentSummary", {
        sent: Number(pushResult.sent || 0),
        matched: Number(pushResult.matched || 0)
      }),
      "success",
      4000
    );
  }
}

function readPushAnnouncementRefFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const id = String(params.get("pushAnnouncement") || "").trim();
  const version = String(params.get("pushVersion") || "").trim();
  return id ? { id, version } : null;
}

function clearPushAnnouncementRefFromLocation() {
  const url = new URL(window.location.href);
  url.searchParams.delete("pushAnnouncement");
  url.searchParams.delete("pushVersion");
  const nextSearch = url.searchParams.toString();
  window.history.replaceState({}, "", `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`);
}

function primeNotificationAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return null;
  }

  if (!notificationAudioContext) {
    notificationAudioContext = new AudioCtor();
  }

  notificationAudioContext.resume().catch(() => null);
  return notificationAudioContext;
}

function isStorePushMandatorySatisfied() {
  return Boolean(
    getRole() === "store" &&
      getToken() &&
      storePushState.supported &&
      storePushState.enabled &&
      getPushPermissionState() === "granted" &&
      storePushState.subscribed
  );
}

function closePushGateModal(force = false) {
  if (!pushGateModal) {
    return;
  }
  if (!force && !isStorePushMandatorySatisfied()) {
    return;
  }
  pushGateModal.classList.add("hidden");
}

function renderPushGateState() {
  if (
    !pushGateModal ||
    !pushGateEyebrow ||
    !pushGateTitle ||
    !pushGateMessage ||
    !pushGateDetails ||
    !pushGateStatusTitle ||
    !pushGateStatusHint ||
    !pushGatePrimaryBtn ||
    !pushGateSecondaryBtn ||
    !pushGateLogoutBtn
  ) {
    return;
  }

  const copy = getPushGateCopyLocale();
  setTextById("pushGateEyebrow", copy.eyebrow);
  setTextById("pushGateTitle", copy.title);
  setTextById("pushGateMessage", copy.message);
  pushGateDetails.textContent = copy.details || "";
  pushGateDetails.classList.toggle("hidden", !copy.details);
  setTextById("pushGatePrimaryBtn", copy.primary);
  setTextById("pushGateSecondaryBtn", copy.secondary);
  setTextById("pushGateLogoutText", t("logoutBtn"));

  const permission = getPushPermissionState();
  let title = copy.statusPending;
  let hint = copy.statusPendingHint;

  if (!storePushState.supported) {
    title = copy.statusUnsupported;
    hint = copy.statusUnsupportedHint;
  } else if (!storePushState.enabled) {
    title = copy.statusDisabled;
    hint = copy.statusDisabledHint;
  } else if (storePushState.busy) {
    title = copy.statusSync;
    hint = copy.statusSyncHint;
  } else if (permission === "denied") {
    title = copy.statusDenied;
    hint = copy.statusDeniedHint;
  } else if (permission === "granted" && !storePushState.subscribed) {
    title = copy.statusSync;
    hint = copy.statusSyncHint;
  }

  pushGateStatusTitle.textContent = title;
  pushGateStatusHint.textContent = hint;

  const isSatisfied = isStorePushMandatorySatisfied();
  if (!getToken() || getRole() !== "store") {
    pushGateModal.classList.add("hidden");
    return;
  }

  pushGateModal.classList.toggle("hidden", isSatisfied);
  pushGatePrimaryBtn.disabled = storePushState.busy || !storePushState.supported || !storePushState.enabled;
  pushGateSecondaryBtn.disabled = storePushState.busy;
}

async function ensureStorePushMandatory(options = {}) {
  const { silent = false } = options;
  if (getRole() !== "store" || !getToken()) {
    closePushGateModal(true);
    return true;
  }

  await loadStorePushStatus({ syncExisting: true, silent });
  const satisfied = isStorePushMandatorySatisfied();
  renderPushGateState();
  if (!satisfied) {
    pushGateModal?.classList.remove("hidden");
  } else {
    closePushGateModal(true);
  }
  return satisfied;
}

function setPushGateEditorStatus(message = "", type = "") {
  if (!pushGateEditorStatus) {
    return;
  }
  pushGateEditorStatus.textContent = message || "";
  pushGateEditorStatus.classList.toggle("is-error", type === "error");
}

function clearPushGateEditorValidation() {
  Object.values(pushGateEditorFields).forEach((field) => field?.classList.remove("is-invalid"));
  setPushGateEditorStatus("");
}

function getPushGateEditorFieldLabel(field) {
  const key = PUSH_GATE_EDITOR_FIELD_LABEL_KEYS[field];
  return key ? t(key) : field;
}

function renderPushGateEditorMeta() {
  if (!pushGateEditorMeta) {
    return;
  }
  const config = getPushGateCopyConfig();
  if (!config.updatedAt) {
    pushGateEditorMeta.textContent = t("pushGateEditorNoUpdates");
    return;
  }
  pushGateEditorMeta.textContent = t("pushGateEditorUpdatedMeta", {
    user: config.updatedBy || "",
    date: formatTimestamp(config.updatedAt)
  });
}

function renderPushGateEditorControls() {
  setTextById("pushGateEditorTitle", t("pushGateEditorTitle"));
  setTextById("pushGateEditorText", t("pushGateEditorText"));
  setTextById("pushGateEditorLangLabel", t("pushGateEditorLangLabel"));
  setTextById("pushGateEditorEyebrowLabel", t("pushGateEditorEyebrowLabel"));
  setTextById("pushGateEditorTitleLabel", t("pushGateEditorTitleLabel"));
  setTextById("pushGateEditorMessageLabel", t("pushGateEditorMessageLabel"));
  setTextById("pushGateEditorDetailsLabel", t("pushGateEditorDetailsLabel"));
  setTextById("pushGateEditorPendingLabel", t("pushGateEditorPendingLabel"));
  setTextById("pushGateEditorPendingHintLabel", t("pushGateEditorPendingHintLabel"));
  setTextById("pushGateEditorDeniedLabel", t("pushGateEditorDeniedLabel"));
  setTextById("pushGateEditorDeniedHintLabel", t("pushGateEditorDeniedHintLabel"));
  setTextById("pushGateEditorSyncLabel", t("pushGateEditorSyncLabel"));
  setTextById("pushGateEditorSyncHintLabel", t("pushGateEditorSyncHintLabel"));
  setTextById("pushGateEditorUnsupportedLabel", t("pushGateEditorUnsupportedLabel"));
  setTextById("pushGateEditorUnsupportedHintLabel", t("pushGateEditorUnsupportedHintLabel"));
  setTextById("pushGateEditorDisabledLabel", t("pushGateEditorDisabledLabel"));
  setTextById("pushGateEditorDisabledHintLabel", t("pushGateEditorDisabledHintLabel"));
  setTextById("pushGateEditorPrimaryLabel", t("pushGateEditorPrimaryLabel"));
  setTextById("pushGateEditorSecondaryLabel", t("pushGateEditorSecondaryLabel"));

  if (pushGateEditorSaveBtn) {
    pushGateEditorSaveBtn.textContent = pushGateEditorBusy
      ? t("pushGateEditorSaving")
      : t("pushGateEditorSave");
  }
  if (pushGateEditorResetBtn) {
    pushGateEditorResetBtn.textContent = t("pushGateEditorReset");
  }
  pushGateEditorEsBtn?.classList.toggle("active", pushGateEditorLanguage === "es");
  pushGateEditorViBtn?.classList.toggle("active", pushGateEditorLanguage === "vi");
  renderPushGateEditorMeta();
}

function setAdminAppConfigStatus(message = "", type = "") {
  if (!adminFeatureConfigStatus) {
    return;
  }
  adminFeatureConfigStatus.textContent = message || "";
  adminFeatureConfigStatus.classList.toggle("is-error", type === "error");
}

function renderAdminAppConfigMeta() {
  if (!adminFeatureConfigMeta) {
    return;
  }
  if (!adminAppConfig.updatedAt) {
    adminFeatureConfigMeta.textContent = t("adminFeatureConfigNoUpdates");
    return;
  }
  adminFeatureConfigMeta.textContent = t("adminFeatureConfigUpdatedMeta", {
    user: adminAppConfig.updatedBy || "",
    date: formatTimestamp(adminAppConfig.updatedAt)
  });
}

function renderAdminAppConfigControls() {
  setTextById("adminFeatureConfigTitle", t("adminFeatureConfigTitle"));
  setTextById("regionalLeaderboardTitle", t("regionalLeaderboardTitle"));
  setTextById("regionalLeaderboardHint", t("regionalLeaderboardHint"));
  setTextById("regionalLeaderboardToggleLabel", t("regionalLeaderboardToggleLabel"));
  setTextById("regionalLeaderboardToggleHint", t("regionalLeaderboardToggleHint"));
  if (adminFeatureConfigSaveBtn) {
    adminFeatureConfigSaveBtn.textContent = adminAppConfigBusy
      ? t("adminFeatureConfigSaving")
      : t("adminFeatureConfigSave");
  }
}

function updateRegionalLeaderboardBadge(isEnabled) {
  if (!regionalLeaderboardStateBadge) {
    return;
  }
  regionalLeaderboardStateBadge.textContent = isEnabled
    ? t("regionalLeaderboardStateOn")
    : t("regionalLeaderboardStateOff");
  regionalLeaderboardStateBadge.classList.toggle("is-active", Boolean(isEnabled));
  regionalLeaderboardStateBadge.classList.toggle("is-inactive", !isEnabled);
}

function renderAdminAppConfigValues() {
  if (regionalLeaderboardEnabledInput) {
    regionalLeaderboardEnabledInput.checked = Boolean(adminAppConfig.regionalLeaderboardEnabled);
  }
  updateRegionalLeaderboardBadge(Boolean(adminAppConfig.regionalLeaderboardEnabled));
  renderAdminAppConfigMeta();
  renderAdminAppConfigControls();
}

function setAdminAppConfigBusy(isBusy) {
  adminAppConfigBusy = isBusy;
  if (regionalLeaderboardEnabledInput) {
    regionalLeaderboardEnabledInput.disabled = isBusy;
  }
  if (adminFeatureConfigSaveBtn) {
    adminFeatureConfigSaveBtn.disabled = isBusy;
  }
  renderAdminAppConfigControls();
}

function renderPushGateEditorValues() {
  const locale = getPushGateCopyLocale(pushGateEditorLanguage);
  Object.entries(pushGateEditorFields).forEach(([field, input]) => {
    if (input) {
      input.value = locale[field] || "";
      input.classList.remove("is-invalid");
    }
  });
  setPushGateEditorStatus("");
  renderPushGateEditorControls();
}

function setPushGateEditorBusy(isBusy) {
  pushGateEditorBusy = isBusy;
  if (pushGateEditorSaveBtn) {
    pushGateEditorSaveBtn.disabled = isBusy;
  }
  if (pushGateEditorResetBtn) {
    pushGateEditorResetBtn.disabled = isBusy;
  }
  if (pushGateEditorEsBtn) {
    pushGateEditorEsBtn.disabled = isBusy;
  }
  if (pushGateEditorViBtn) {
    pushGateEditorViBtn.disabled = isBusy;
  }
  renderPushGateEditorControls();
}

function validatePushGateEditorForm() {
  clearPushGateEditorValidation();

  const values = {};
  const errors = {};

  Object.entries(pushGateEditorFields).forEach(([field, input]) => {
    const value = String(input?.value || "").trim();
    const maxLength = PUSH_GATE_COPY_FIELD_LIMITS[field] || 500;
    const label = getPushGateEditorFieldLabel(field);
    values[field] = value;

    if (field !== "details" && !value) {
      errors[field] = t("pushGateEditorValidationRequired", { field: label });
    } else if (value.length > maxLength) {
      errors[field] = t("pushGateEditorValidationTooLong", { field: label, max: maxLength });
    }
  });

  Object.keys(errors).forEach((field) => {
    pushGateEditorFields[field]?.classList.add("is-invalid");
  });

  if (Object.keys(errors).length > 0) {
    setPushGateEditorStatus(
      Object.values(errors)[0] || t("pushGateEditorInvalid"),
      "error"
    );
  }

  return {
    isValid: Object.keys(errors).length === 0,
    values
  };
}

async function loadAdminPushGateCopyConfig(options = {}) {
  const { forceRefresh = false, silent = false } = options;
  if (getRole() !== "admin" || !getToken()) {
    return;
  }

  if (!silent) {
    setPushGateEditorStatus(t("pushGateEditorLoading"));
  }

  try {
    const params = forceRefresh ? `?refresh=1&t=${Date.now()}` : "";
    const data = await apiFetch(`/api/admin/push-gate-copy${params}`);
    applyPushGateCopyConfig(data);
    renderPushGateEditorValues();
  } catch (error) {
    if (handleSessionError(error, { showNotice: !silent })) {
      return;
    }
    setPushGateEditorStatus(error.message || t("pushGateEditorLoadError"), "error");
    if (!silent) {
      showToast(error.message || t("pushGateEditorLoadError"), "error");
    }
  }
}

function resetPushGateEditorValuesToDefault() {
  const defaults = buildDefaultPushGateCopyConfig()[pushGateEditorLanguage];
  Object.entries(pushGateEditorFields).forEach(([field, input]) => {
    if (input) {
      input.value = defaults[field] || "";
      input.classList.remove("is-invalid");
    }
  });
  setPushGateEditorStatus(t("pushGateEditorResetDone"));
}

async function saveAdminPushGateCopyConfig() {
  const validation = validatePushGateEditorForm();
  if (!validation.isValid) {
    return;
  }

  setPushGateEditorBusy(true);
  try {
    const data = await apiFetch(`/api/admin/push-gate-copy/${pushGateEditorLanguage}`, {
      method: "PUT",
      body: JSON.stringify(validation.values)
    });
    applyPushGateCopyConfig(data);
    renderPushGateEditorValues();
    showToast(t("pushGateEditorSaveDone"), "success");
  } catch (error) {
    if (handleSessionError(error)) {
      return;
    }
    if (error.fieldErrors) {
      Object.keys(error.fieldErrors).forEach((field) => {
        pushGateEditorFields[field]?.classList.add("is-invalid");
      });
    }
    setPushGateEditorStatus(error.message || t("pushGateEditorInvalid"), "error");
    showToast(error.message || t("pushGateEditorInvalid"), "error");
  } finally {
    setPushGateEditorBusy(false);
  }
}

async function loadAdminAppConfig(options = {}) {
  const { silent = false } = options;
  if (getRole() !== "admin" || !getToken()) {
    return;
  }

  try {
    if (!silent) {
      setAdminAppConfigStatus(t("adminFeatureConfigLoading"));
    }
    const data = await apiFetch("/api/admin/app-config");
    applyAdminAppConfig(data);
    setAdminAppConfigStatus("");
  } catch (error) {
    if (handleSessionError(error, { showNotice: !silent })) {
      return;
    }
    setAdminAppConfigStatus(error.message || t("adminFeatureConfigLoadError"), "error");
    if (!silent) {
      showToast(error.message || t("adminFeatureConfigLoadError"), "error");
    }
  }
}

async function saveAdminAppConfig() {
  if (!regionalLeaderboardEnabledInput) {
    return;
  }

  setAdminAppConfigBusy(true);
  try {
    const data = await apiFetch("/api/admin/app-config", {
      method: "PUT",
      body: JSON.stringify({
        regionalLeaderboardEnabled: Boolean(regionalLeaderboardEnabledInput.checked)
      })
    });
    applyAdminAppConfig(data);
    setAdminAppConfigStatus("");
    showToast(t("adminFeatureConfigSaveDone"), "success");
  } catch (error) {
    if (handleSessionError(error)) {
      return;
    }
    setAdminAppConfigStatus(error.message || t("adminFeatureConfigInvalid"), "error");
    showToast(error.message || t("adminFeatureConfigInvalid"), "error");
  } finally {
    setAdminAppConfigBusy(false);
  }
}

/* ---------- 5. Toast System ---------- */
function showToast(message, type = "info", duration = 3000) {
  const signature = `${type}::${String(message || "").trim()}`;
  if (signature === lastToastSignature && Date.now() - lastToastAt < 1200) {
    return;
  }
  lastToastSignature = signature;
  lastToastAt = Date.now();

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

function prepareStoreDashboardLoading(store = {}) {
  latestDashboard = null;
  storeName.textContent = store.name || t("defaultStoreName");
  storeMeta.textContent = [store.code || "", store.area || ""].filter(Boolean).join(" • ");
  totalReward.textContent = "S/ 0";
  totalRewardMeta.textContent = "";
  todayTotal.textContent = "0";
  todayDate.textContent = "";
  cumulativeTotal.textContent = "0";
  cumulativeMeta.textContent = "";
  achievedReward.textContent = t("achievedRewardEmpty");
  achievedLevel.textContent = t("achievedRewardEmptyNote");
  achCardReached.classList.remove("is-achieved");
  nextReward.textContent = "S/ 0";
  nextLevel.textContent = "";
  updatedAt.textContent = "";
  dashboardStatus.textContent = t("dashboardLoading");
  storeAnnouncements.classList.add("hidden");
  annCarouselStop();
  nudgeBanner.classList.add("hidden");
  leaderboardSection.style.display = "none";
  levelsGrid.innerHTML = "";
  categoriesGrid.innerHTML = "";
  historyGrid.innerHTML = `<div class="history-empty">${t("dashboardLoading")}</div>`;
}

function prepareAdminDashboardLoading(admin = {}) {
  latestAdminDashboard = null;
  cachedAllStoreItems = null;
  adminNameEl.textContent = admin.name || t("defaultAdminName");
  adminMeta.textContent = [admin.username || "", t("adminDashboardLoading")].filter(Boolean).join(" • ");
  adminTotalReward.textContent = "S/ 0";
  adminTotalRewardMeta.textContent = "";
  adminStoresCount.textContent = "0";
  adminStoresMeta.textContent = t("adminDashboardLoading");
  adminTodayTotal.textContent = "0";
  adminTodayMeta.textContent = t("adminDashboardLoading");
  adminCumulativeTotal.textContent = "0";
  adminCumulativeMeta.textContent = "";
  adminAggregateCategoriesGrid.innerHTML = `<div class="empty-state">${t("adminDashboardLoading")}</div>`;
  adminAggregateLevelsGrid.innerHTML = `<div class="empty-state">${t("adminDashboardLoading")}</div>`;
  adminStoresTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px">${t("adminDashboardLoading")}</td></tr>`;
  adminPaginationInfo.textContent = "";
  adminPrevPageBtn.disabled = true;
  adminNextPageBtn.disabled = true;
  showAdminStorePromptMsg(t("adminDashboardLoading"));
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
  setTextById("navAdminAnnouncements", t("navAnnouncements"));
  setTextById("navAdminPush", t("navAdminPush"));
  setTextById("navAdminMore", t("navMore"));

  // More panel
  setTextById("moreLangGroupTitle", t("moreLangTitle"));
  setTextById("moreLangLabel", t("moreLangLabel"));
  setTextById("pushGroupTitle", t("pushGroupTitle"));
  setTextById("moreActionsTitle", t("moreActionsTitle"));
  setTextById("moreInstallText", t("moreInstall"));
  setTextById("adminMoreLangTitle", t("moreLangTitle"));
  setTextById("adminMoreLangLabel", t("moreLangLabel"));
  renderAdminAppConfigValues();
  setTextById("adminMoreActionsTitle", t("moreActionsTitle"));
  renderPushGateEditorControls();

  // Announcement admin
  setTextById("adminAnnouncementSectionTitle", t("announcementSectionTitle"));
  setTextById("adminAnnouncementSectionText", t("announcementSectionText"));
  setTextById("annTypeLabel", t("announcementTypeLabel"));
  setTextById("annTitleLabel", t("announcementTitleLabel"));
  setTextById("annMessageLabel", t("announcementMessageLabel"));
  setTextById("annTargetLabel", t("announcementTargetLabel"));
  setTextById("annAreaLabel", t("announcementAreaLabel"));
  setTextById("annStoreCodeLabel", t("announcementStoreLabel"));
  setTextById("annExpiresLabel", t("announcementExpiresLabel"));
  setTextById("annExpiresOptional", t("announcementExpiresOptional"));
  setTextById("annPinnedLabel", t("announcementPinnedLabel"));
  setTextById("annNotifyPushLabel", t("announcementNotifyPushLabel"));
  setTextById("annNotifyPushHint", t("announcementNotifyPushHint"));
  setTextById("annFilterLabel", t("announcementFilterLabel"));
  setTextById("annCancelEditBtn", t("announcementCancel"));
  setTextById("pushModalEyebrow", t("pushModalEyebrow"));
  setTextById("pushModalViewBtn", t("pushModalView"));
  setTextById("pushModalDismissBtn", t("pushModalDismiss"));
  if (annTitleInput) annTitleInput.placeholder = t("announcementTitlePlaceholder");
  if (annMessageInput) annMessageInput.placeholder = t("announcementMessagePlaceholder");
  if (annAreaInput) annAreaInput.placeholder = t("announcementAreaPlaceholder");
  if (annStoreCodeInput) annStoreCodeInput.placeholder = t("announcementStorePlaceholder");
  if (annDismissBtn) annDismissBtn.setAttribute("aria-label", t("announcementCloseLabel"));
  if (annTypeSelector) {
    annTypeSelector.querySelectorAll(".ann-type-btn").forEach((btn) => {
      btn.textContent = `${btn.dataset.emoji || ""} ${getAnnouncementTypeLabel(btn.dataset.type)}`.trim();
    });
  }
  if (annTargetSelect) {
    annTargetSelect.querySelectorAll("option").forEach((option) => {
      option.textContent = translations[currentLanguage].announcementTargetOptions?.[option.value] || option.value;
    });
  }
  if (annFilterSelect) {
    annFilterSelect.innerHTML = ["all", "active", "paused", "expired", "pinned"]
      .map((filter) => `<option value="${filter}">${getAnnouncementFilterOptionLabel(filter)}</option>`)
      .join("");
    annFilterSelect.value = adminAnnouncementFilter;
  }
  setAnnouncementFormBusy(false);
  renderStorePushState();
  if (foregroundPushAnnouncement) {
    renderPushAnnouncementModal(foregroundPushAnnouncement);
  }

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
  if (latestAdminAnnouncements.length > 0 || adminAnnouncementsGrid?.children.length) {
    renderAdminAnnouncementsList();
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
  dashboardStatus.textContent = "";
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

  // 1. Announcements — Carousel
  if (data.announcements && data.announcements.length > 0) {
    renderAnnCarousel(data.announcements);
    storeAnnouncements.classList.remove("hidden");
  } else {
    storeAnnouncements.classList.add("hidden");
    annCarouselStop();
  }

  // 2. Nudge Banner (Gamification)
  nudgeBanner.classList.add("hidden");
  if (data.achievements.nextLevel) {
    const missingLines = data.achievements.nextLevel.missingRequirements;
    const isClose = missingLines.some(m => m.remaining > 0 && m.remaining <= 10);
    if (isClose) {
      nudgeBanner.classList.remove("hidden");
      nudgeText.textContent = `¡Faltan muy pocas líneas para el ${getLevelLabel(data.achievements.nextLevel.label)}! Sigue así.`;
    }
  }

  // 3. Regional Leaderboard
  if (data.leaderboard && data.leaderboard.top10) {
    leaderboardSection.style.display = "block";
    const { top10, myRank, totalStores } = data.leaderboard;
    leaderboardMeta.textContent = `Tu Posición: #${myRank} de ${totalStores} puntos en tu zona.`;
    leaderboardGrid.innerHTML = "";
    top10.forEach((s) => {
      const isMe = s.code === data.store.code;
      const el = document.createElement("div");
      el.className = `level-card ${isMe ? 'is-reached is-current' : ''}`.trim();
      el.innerHTML = `
        <div class="lc-head">
          <span>#${s.rank} ${s.name} ${isMe ? '(Tú)' : ''}</span>
          <strong>${formatCount(s.total)} líneas</strong>
        </div>
      `;
      leaderboardGrid.appendChild(el);
    });
  } else {
    leaderboardSection.style.display = "none";
  }

  levelsGrid.innerHTML = "";
  data.levels.forEach((lv, i) => levelsGrid.appendChild(buildLevelCard(lv, i)));

  categoriesGrid.innerHTML = "";
  data.categories.forEach((cat, i) => categoriesGrid.appendChild(buildCategoryCard(cat, i)));

  renderHistory(historyGrid, data.history, data.today.date);
  maybeOpenPendingPushAnnouncement(data.announcements || []);
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
  if (!resp.ok) {
    const error = new Error(localizeServerMessage(data.error || t("unsupportedRequest")));
    error.status = resp.status;
    error.isSessionError =
      Boolean(token) &&
      !String(url).startsWith("/api/auth/login") &&
      [401, 403].includes(resp.status);
    if (data.fieldErrors && typeof data.fieldErrors === "object") {
      error.fieldErrors = Object.fromEntries(
        Object.entries(data.fieldErrors).map(([key, value]) => [key, localizeServerMessage(String(value))])
      );
    }
    throw error;
  }
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
    const error = new Error(msg);
    error.status = resp.status;
    error.isSessionError =
      Boolean(token) &&
      !String(url).startsWith("/api/auth/login") &&
      [401, 403].includes(resp.status);
    throw error;
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
    ensureStorePushMandatory({ silent: true });
    if (forceRefresh) showToast(t("dashboardSynced"), "success");
  } catch (err) {
    if (handleSessionError(err)) {
      return;
    }
    showToast(err.message || t("unsupportedRequest"), "error");
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
    if (handleSessionError(err)) {
      return;
    }
    showToast(err.message || t("unsupportedRequest"), "error");
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
    if (handleSessionError(err)) {
      return;
    }
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
    if (handleSessionError(err)) {
      return;
    }
    storeSelector.innerHTML = "";
    showAdminStorePromptMsg(err.message || t("adminNoStoreMatch"));
  }
}

async function handleLogout() {
  const token = getToken();
  authTransitionLocked = true;
  suppressAuthErrorsUntil = Date.now() + 2500;
  performLocalSignOut({ notify: true });

  if (!token) {
    return;
  }
  if (!logoutRequestPromise) {
    logoutRequestPromise = fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      keepalive: true,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(() => null).finally(() => {
      logoutRequestPromise = null;
    });
  }
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
    if (handleSessionError(err)) {
      return;
    }
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
    resetAuthTransitionState();
    setToken(data.token);
    setRole(data.role || "store");
    passwordInput.value = "";
    authStatus.textContent = "";

    if (data.role === "admin") {
      adminCurrentPage = 1;
      adminStoreQuery = "";
      storeSearchInput.value = "";
      if (data.dashboard) {
        renderAdminDashboard(data.dashboard);
      } else {
        prepareAdminDashboardLoading(data.admin);
      }
      showAdminApp();
      loadAdminPushGateCopyConfig({ silent: true });
      loadAdminAppConfig({ silent: true });
      if (!data.dashboard) {
        loadAdminDashboard();
      }
    } else {
      prepareStoreDashboardLoading(data.store);
      showStoreApp();
      loadStoreDashboard();
      ensureStorePushMandatory({ silent: true });
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
if (pushActionBtn) {
  pushActionBtn.addEventListener("click", () => {
    subscribeStorePush();
  });
}
if (pushGatePrimaryBtn) {
  pushGatePrimaryBtn.addEventListener("click", () => {
    subscribeStorePush();
  });
}
if (pushGateSecondaryBtn) {
  pushGateSecondaryBtn.addEventListener("click", () => {
    ensureStorePushMandatory();
  });
}
if (pushGateLogoutBtn) {
  pushGateLogoutBtn.addEventListener("click", handleLogout);
}
if (pushGateEditorEsBtn) {
  pushGateEditorEsBtn.addEventListener("click", () => {
    pushGateEditorLanguage = "es";
    renderPushGateEditorValues();
  });
}
if (pushGateEditorViBtn) {
  pushGateEditorViBtn.addEventListener("click", () => {
    pushGateEditorLanguage = "vi";
    renderPushGateEditorValues();
  });
}
if (pushGateEditorResetBtn) {
  pushGateEditorResetBtn.addEventListener("click", resetPushGateEditorValuesToDefault);
}
if (pushGateEditorForm) {
  pushGateEditorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveAdminPushGateCopyConfig();
  });
}
if (adminFeatureConfigForm) {
  adminFeatureConfigForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveAdminAppConfig();
  });
}
if (regionalLeaderboardEnabledInput) {
  regionalLeaderboardEnabledInput.addEventListener("change", () => {
    updateRegionalLeaderboardBadge(Boolean(regionalLeaderboardEnabledInput.checked));
    setAdminAppConfigStatus("");
  });
}
adminRefreshBtn.addEventListener("click", () => {
  loadAdminDashboard(true);
  if (adminStoreQuery.trim()) loadAdminStoreSearch(true);
  if (activeAdminTab === "adminAnnouncementsTab") {
    loadAnnouncementTargets(true);
    loadAdminAnnouncements(true);
  }
  if (activeAdminTab === "adminPushTab") {
    loadAdminPushGateCopyConfig({ forceRefresh: true });
  }
  if (activeAdminTab === "adminMoreTab") {
    loadAdminAppConfig();
  }
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

/* ---------- New Features: Simulator, Announcements ---------- */

/* --- Announcement Carousel --- */
const ANN_TYPE_META = {
  info:    { border: "#3b82f6", bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  promo:   { border: "#8b5cf6", bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  alert:   { border: "#f59e0b", bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  urgent:  { border: "#ef4444", bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
  success: { border: "#10b981", bg: "rgba(16,185,129,0.12)", color: "#34d399" }
};

function playForegroundAnnouncementSound() {
  const audioContext = primeNotificationAudio();
  if (!audioContext || audioContext.state !== "running") {
    window.__lastPushSoundState = {
      played: false,
      blocked: true,
      at: Date.now()
    };
    return false;
  }

  const steps = [
    { frequency: 880, duration: 0.11, gap: 0.05 },
    { frequency: 1174, duration: 0.14, gap: 0.05 },
    { frequency: 880, duration: 0.12, gap: 0 }
  ];
  let cursor = audioContext.currentTime + 0.02;

  steps.forEach((step) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(step.frequency, cursor);
    gainNode.gain.setValueAtTime(0.0001, cursor);
    gainNode.gain.exponentialRampToValueAtTime(0.18, cursor + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, cursor + step.duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(cursor);
    oscillator.stop(cursor + step.duration);
    cursor += step.duration + step.gap;
  });

  window.__lastPushSoundState = {
    played: true,
    blocked: false,
    at: Date.now()
  };
  return true;
}

function triggerForegroundAnnouncementCue(options = {}) {
  const shouldPlaySound = options.playSound !== false;
  let soundPlayed = false;

  if (shouldPlaySound) {
    soundPlayed = playForegroundAnnouncementSound();
    if (!soundPlayed) {
      showToast(t("pushModalAudioLocked"), "info", 4200);
    }
  }

  if (navigator.vibrate) {
    navigator.vibrate([240, 120, 240, 120, 320]);
  }

  return { soundPlayed };
}

function getAnnouncementTargetSummary(announcement) {
  if (!announcement) {
    return t("pushModalTargetNow");
  }
  if (announcement.target === "store") {
    return t("announcementTargetStoreLabel", { code: announcement.targetStore || "-" });
  }
  if (announcement.target === "area") {
    return t("announcementTargetAreaLabel", { area: announcement.targetArea || "-" });
  }
  return t("announcementTargetAllLabel");
}

function closePushAnnouncementModal() {
  if (!pushAnnouncementModal) {
    return;
  }
  pushAnnouncementModal.classList.add("hidden");
}

function renderPushAnnouncementModal(announcement) {
  if (!pushAnnouncementModal || !announcement) {
    return;
  }

  const meta = ANN_TYPE_META[announcement.type] || ANN_TYPE_META.info;
  const emoji = announcement.emoji || (announcement.type === "urgent" ? "🚨" : "📢");
  if (pushModalEyebrow) pushModalEyebrow.textContent = t("pushModalEyebrow");
  if (pushModalTitle) pushModalTitle.textContent = announcement.title || t("pushModalTargetNow");
  if (pushModalMessage) pushModalMessage.textContent = announcement.message || "";
  if (pushModalTarget) pushModalTarget.textContent = getAnnouncementTargetSummary(announcement);
  if (pushModalTime) {
    pushModalTime.textContent = formatTimestamp(announcement.updatedAt || announcement.createdAt || new Date().toISOString());
  }
  if (pushModalTypeBadge) {
    pushModalTypeBadge.textContent = `${emoji} ${getAnnouncementTypeBadge(announcement.type)}`;
    pushModalTypeBadge.style.background = meta.bg;
    pushModalTypeBadge.style.color = meta.color;
  }
  if (pushModalViewBtn) pushModalViewBtn.textContent = t("pushModalView");
  if (pushModalDismissBtn) pushModalDismissBtn.textContent = t("pushModalDismiss");
}

function openStoreAnnouncementModal(announcement, options = {}) {
  if (!announcement || !pushAnnouncementModal) {
    return;
  }

  const currentKey = announcement.version || `${announcement.id || ""}:${announcement.updatedAt || announcement.createdAt || ""}`;
  const activeKey = foregroundPushAnnouncement?.version ||
    `${foregroundPushAnnouncement?.id || ""}:${foregroundPushAnnouncement?.updatedAt || foregroundPushAnnouncement?.createdAt || ""}`;
  if (!pushAnnouncementModal.classList.contains("hidden") && currentKey && activeKey === currentKey) {
    return;
  }

  foregroundPushAnnouncement = announcement;
  renderPushAnnouncementModal(announcement);
  showStoreApp();
  switchTab($("storeNav"), storeApp, "storeHomeTab");
  activeStoreTab = "storeHomeTab";
  pushAnnouncementModal.classList.remove("hidden");
  const cue = triggerForegroundAnnouncementCue(options);
  window.__lastForegroundAnnouncementAlert = {
    key: currentKey,
    shownAt: Date.now(),
    soundPlayed: cue.soundPlayed,
    title: announcement.title || ""
  };
}

function maybeOpenPendingPushAnnouncement(announcements = []) {
  if (!pendingPushAnnouncementRef) {
    return;
  }

  const match = (Array.isArray(announcements) ? announcements : []).find((announcement) => {
    if (announcement.id !== pendingPushAnnouncementRef.id) {
      return false;
    }
    if (!pendingPushAnnouncementRef.version) {
      return true;
    }
    return (announcement.version || announcement.updatedAt || "") === pendingPushAnnouncementRef.version;
  });

  if (!match) {
    return;
  }

  pendingPushAnnouncementRef = null;
  clearPushAnnouncementRefFromLocation();
  openStoreAnnouncementModal(match, { playSound: true });
}

function handleIncomingPushAnnouncement(payload, options = {}) {
  const announcement = payload?.announcement || null;
  const shouldForceOpen = options.forceOpen === true;
  if (!announcement) {
    if (getRole() === "store" && getToken()) {
      loadStoreDashboard();
    }
    return;
  }

  if (document.visibilityState !== "visible" && !shouldForceOpen) {
    pendingPushAnnouncementPayload = payload;
    return;
  }

  if (shouldForceOpen) {
    showStoreApp();
  }
  openStoreAnnouncementModal(announcement, { playSound: payload?.playSound !== false });
  if (getRole() === "store" && getToken()) {
    loadStoreDashboard();
  }
}

let annCurrentSlide = 0;
let annTotal = 0;
let annTimer = null;
let annVisibleItems = [];
let annDismissedKeys = (() => {
  try {
    const parsed = JSON.parse(localStorage.getItem("ann-dismissed") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
})();

function getAnnouncementDismissKey(announcement) {
  return announcement?.version || `${announcement?.id || ""}:${announcement?.updatedAt || announcement?.createdAt || ""}`;
}

function isAnnouncementExpiredClient(announcement) {
  if (!announcement?.expiresAt) {
    return false;
  }

  const expiresAt = new Date(announcement.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

function annCarouselStop() {
  if (annTimer) { clearInterval(annTimer); annTimer = null; }
}

function renderAnnCarousel(list) {
  annCarouselStop();
  const active = list.filter((announcement) => !annDismissedKeys.includes(getAnnouncementDismissKey(announcement)));
  annVisibleItems = active;
  if (!active.length) {
    annCarousel.innerHTML = "";
    annDots.innerHTML = "";
    storeAnnouncements.classList.add("hidden");
    return;
  }

  annTotal = active.length;
  annCurrentSlide = 0;

  // Build slides
  annCarousel.innerHTML = active.map((a, i) => {
    const meta = ANN_TYPE_META[a.type] || ANN_TYPE_META.info;
    const emoji = a.emoji || (a.type === "promo" ? "🎉" : a.type === "alert" ? "⚠️" : a.type === "urgent" ? "🚨" : a.type === "success" ? "🏆" : "📢");
    return `<div class="ann-slide${i === 0 ? " active" : ""}" style="border-left-color:${meta.border}" data-index="${i}" data-announcement-key="${getAnnouncementDismissKey(a)}">
      <span class="ann-type-badge" style="background:${meta.bg};color:${meta.color}">${emoji} ${getAnnouncementTypeBadge(a.type)}</span>
      <div class="ann-slide-body">
        <strong class="ann-slide-title">${a.title}</strong>
        <p class="ann-slide-msg">${a.message}</p>
      </div>
    </div>`;
  }).join("");

  // Build dots
  if (annTotal > 1) {
    annDots.innerHTML = active.map((_, i) =>
      `<span class="ann-dot${i === 0 ? " active" : ""}" data-index="${i}"></span>`
    ).join("");
    annDots.style.display = "flex";
    annDots.querySelectorAll(".ann-dot").forEach(dot => {
      dot.addEventListener("click", () => goToSlide(Number(dot.dataset.index)));
    });
  } else {
    annDots.style.display = "none";
    annDots.innerHTML = "";
  }

  // Auto-scroll every 5s
  if (annTotal > 1) {
    annTimer = setInterval(() => goToSlide((annCurrentSlide + 1) % annTotal), 5000);
  }
}

function goToSlide(index) {
  const slides = annCarousel.querySelectorAll(".ann-slide");
  const dots = annDots.querySelectorAll(".ann-dot");
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
  annCurrentSlide = index;
}

if (annDismissBtn) {
  annDismissBtn.addEventListener("click", () => {
    const currentAnnouncement = annVisibleItems[annCurrentSlide];
    if (!currentAnnouncement) {
      return;
    }
    annDismissedKeys = Array.from(new Set([...annDismissedKeys, getAnnouncementDismissKey(currentAnnouncement)]));
    localStorage.setItem("ann-dismissed", JSON.stringify(annDismissedKeys));
    renderAnnCarousel(latestDashboard?.announcements || []);
    if ((latestDashboard?.announcements || []).length > 0) {
      showToast(t("announcementDismissed"), "success", 1800);
    }
  });
}

/* --- Admin Announcement Form --- */

// Type selector
const annTypeSelector = $("annTypeSelector");
if (annTypeSelector) {
  annTypeSelector.querySelectorAll(".ann-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      annTypeSelector.querySelectorAll(".ann-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setAnnouncementFieldError("type", "");
    });
  });
}

// Char counter
if (annMessageInput) {
  annMessageInput.addEventListener("input", () => {
    if (annCharCount) annCharCount.textContent = `${annMessageInput.value.length}/300`;
    setAnnouncementFieldError("message", "");
  });
}

if (annTitleInput) {
  annTitleInput.addEventListener("input", () => {
    setAnnouncementFieldError("title", "");
  });
}

if (annAreaInput) {
  annAreaInput.addEventListener("input", () => {
    setAnnouncementFieldError("targetArea", "");
  });
}

if (annStoreCodeInput) {
  annStoreCodeInput.addEventListener("input", () => {
    setAnnouncementFieldError("targetStore", "");
  });
}

if (annExpiresInput) {
  annExpiresInput.addEventListener("input", () => {
    setAnnouncementFieldError("expiresAt", "");
  });
}

// Target conditional fields
if (annTargetSelect) {
  annTargetSelect.addEventListener("change", () => {
    updateAnnouncementTargetVisibility();
    setAnnouncementFieldError("target", "");
    setAnnouncementFieldError("targetArea", "");
    setAnnouncementFieldError("targetStore", "");
  });
}

if (annFilterSelect) {
  annFilterSelect.addEventListener("change", () => {
    adminAnnouncementFilter = annFilterSelect.value || "all";
    renderAdminAnnouncementsList();
  });
}

function setAnnouncementFormStatus(message = "", type = "") {
  if (!annFormStatus) {
    return;
  }
  annFormStatus.textContent = message;
  annFormStatus.classList.toggle("is-error", type === "error");
}

function setAnnouncementFieldError(field, message = "") {
  const fieldMap = {
    type: [null, annTypeError],
    title: [annTitleInput, annTitleError],
    message: [annMessageInput, annMessageError],
    target: [annTargetSelect, annTargetError],
    targetArea: [annAreaInput, annAreaError],
    targetStore: [annStoreCodeInput, annStoreCodeError],
    expiresAt: [annExpiresInput, annExpiresError]
  };
  const [input, errorEl] = fieldMap[field] || [];
  if (input) {
    input.classList.toggle("is-invalid", Boolean(message));
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.toggle("hidden", !message);
  }
}

function clearAnnouncementFieldErrors() {
  ["type", "title", "message", "target", "targetArea", "targetStore", "expiresAt"].forEach((field) =>
    setAnnouncementFieldError(field, "")
  );
  setAnnouncementFormStatus("");
}

function updateAnnouncementTargetVisibility() {
  const target = annTargetSelect?.value || "all";
  annAreaGroup?.classList.toggle("hidden", target !== "area");
  annStoreGroup?.classList.toggle("hidden", target !== "store");
}

function syncAnnouncementTargetSuggestions() {
  if (annAreaSuggestions) {
    annAreaSuggestions.innerHTML = announcementTargetOptions.areas
      .map((area) => `<option value="${area}"></option>`)
      .join("");
  }

  if (annStoreSuggestions) {
    annStoreSuggestions.innerHTML = announcementTargetOptions.stores
      .map((store) => `<option value="${store.code}" label="${[store.name, store.area].filter(Boolean).join(" • ")}"></option>`)
      .join("");
  }
}

function getAnnouncementCanonicalArea(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const matched = announcementTargetOptions.areas.find(
    (area) => area.toLowerCase() === raw.toLowerCase()
  );
  return matched || raw;
}

function getAnnouncementCanonicalStore(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) {
    return "";
  }

  const matched = announcementTargetOptions.stores.find((store) => store.code === raw);
  return matched?.code || raw;
}

function validateAnnouncementForm() {
  clearAnnouncementFieldErrors();

  const title = annTitleInput.value.trim();
  const message = annMessageInput.value.trim();
  const target = annTargetSelect?.value || "all";
  const area = getAnnouncementCanonicalArea(annAreaInput?.value || "");
  const storeCode = getAnnouncementCanonicalStore(annStoreCodeInput?.value || "");
  const errors = {};

  if (!title) {
    errors.title = t("announcementValidationTitleRequired");
  }

  if (!message) {
    errors.message = t("announcementValidationMessageRequired");
  }

  if (target === "area") {
    if (!area) {
      errors.targetArea = t("announcementValidationAreaRequired");
    } else if (
      announcementTargetOptions.areas.length > 0 &&
      !announcementTargetOptions.areas.some((item) => item.toLowerCase() === area.toLowerCase())
    ) {
      errors.targetArea = t("announcementValidationAreaInvalid");
    }
  }

  if (target === "store") {
    if (!storeCode) {
      errors.targetStore = t("announcementValidationStoreRequired");
    } else if (
      announcementTargetOptions.stores.length > 0 &&
      !announcementTargetOptions.stores.some((store) => store.code === storeCode)
    ) {
      errors.targetStore = t("announcementValidationStoreInvalid");
    }
  }

  Object.entries(errors).forEach(([field, value]) => setAnnouncementFieldError(field, value));
  if (Object.keys(errors).length > 0) {
    setAnnouncementFormStatus(t("announcementFormInvalid"), "error");
  }

  return {
    isValid: Object.keys(errors).length === 0,
    values: {
      title,
      message,
      type: getSelectedAnnType(),
      emoji: getSelectedAnnEmoji(),
      target,
      targetArea: target === "area" ? area : null,
      targetStore: target === "store" ? storeCode : null,
      pinned: annPinnedInput ? annPinnedInput.checked : false,
      notifyPush: annNotifyPushInput ? annNotifyPushInput.checked : true,
      expiresAt: annExpiresInput?.value || null
    }
  };
}

function setAnnouncementFormBusy(isBusy) {
  if (!annSubmitBtn) {
    return;
  }

  annSubmitBtn.disabled = isBusy;
  const isEditing = Boolean(annEditingId?.value);
  annSubmitBtn.textContent = isBusy
    ? t(isEditing ? "announcementSaving" : "announcementPublishing")
    : t(isEditing ? "announcementUpdate" : "announcementPublish");
}

async function loadAnnouncementTargets(forceRefresh = false) {
  try {
    if (forceRefresh) {
      setAnnouncementFormStatus(t("announcementTargetsLoading"));
    }
    const params = forceRefresh ? `?refresh=1&t=${Date.now()}` : "";
    const data = await apiFetch(`/api/admin/announcement-targets${params}`);
    announcementTargetOptions = {
      areas: Array.isArray(data.areas) ? data.areas : [],
      stores: Array.isArray(data.stores) ? data.stores : []
    };
    syncAnnouncementTargetSuggestions();
    setAnnouncementFormStatus("");
  } catch (err) {
    if (handleSessionError(err, { showNotice: forceRefresh })) {
      return;
    }
    setAnnouncementFormStatus("", "error");
    showToast(err.message || t("announcementTargetsError"), "error");
  }
}

// Cancel edit
if (annCancelEditBtn) {
  annCancelEditBtn.addEventListener("click", () => {
    resetAnnForm();
  });
}

function resetAnnForm() {
  adminAnnouncementForm.reset();
  annEditingId.value = "";
  clearAnnouncementFieldErrors();
  updateAnnouncementTargetVisibility();
  annCancelEditBtn.classList.add("hidden");
  if (annNotifyPushInput) annNotifyPushInput.checked = true;
  if (annCharCount) annCharCount.textContent = "0/300";
  if (annTypeSelector) {
    annTypeSelector.querySelectorAll(".ann-type-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  }
  setAnnouncementFormBusy(false);
}

function getSelectedAnnType() {
  if (!annTypeSelector) return "info";
  const active = annTypeSelector.querySelector(".ann-type-btn.active");
  return active ? active.dataset.type : "info";
}

function getSelectedAnnEmoji() {
  if (!annTypeSelector) return "";
  const active = annTypeSelector.querySelector(".ann-type-btn.active");
  return active ? active.dataset.emoji : "";
}

if (adminAnnouncementForm) {
  adminAnnouncementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const validation = validateAnnouncementForm();
    if (!validation.isValid) return;
    const editingId = annEditingId ? annEditingId.value : "";
    setAnnouncementFormBusy(true);
    try {
      let result;
      if (editingId) {
        result = await apiFetch("/api/admin/announcements/" + editingId, {
          method: "PUT",
          body: JSON.stringify(validation.values)
        });
        showToast(t("announcementUpdateDone"), "success");
      } else {
        result = await apiFetch("/api/admin/announcements", {
          method: "POST",
          body: JSON.stringify(validation.values)
        });
        showToast(t("announcementCreateDone"), "success");
      }
      showAnnouncementPushFeedback(result?.pushResult);
      resetAnnForm();
      await loadAdminAnnouncements();
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, value]) => setAnnouncementFieldError(field, value));
        setAnnouncementFormStatus(err.message || t("announcementFormInvalid"), "error");
      }
      showToast(err.message, "error");
    } finally {
      setAnnouncementFormBusy(false);
    }
  });
}

function getAnnouncementFilteredList() {
  switch (adminAnnouncementFilter) {
    case "active":
      return latestAdminAnnouncements.filter((announcement) => announcement.active !== false && !isAnnouncementExpiredClient(announcement));
    case "paused":
      return latestAdminAnnouncements.filter((announcement) => announcement.active === false);
    case "expired":
      return latestAdminAnnouncements.filter((announcement) => isAnnouncementExpiredClient(announcement));
    case "pinned":
      return latestAdminAnnouncements.filter((announcement) => announcement.pinned);
    default:
      return latestAdminAnnouncements;
  }
}

function renderAdminAnnouncementsList() {
  if (!adminAnnouncementsGrid) {
    return;
  }

  const filtered = getAnnouncementFilteredList();
  if (annListMeta) {
    annListMeta.textContent = t("announcementListMeta", {
      shown: filtered.length,
      total: latestAdminAnnouncements.length
    });
  }

  adminAnnouncementsGrid.innerHTML = "";
  if (!latestAdminAnnouncements.length) {
    adminAnnouncementsGrid.innerHTML = `<div class="empty-state">${t("announcementEmpty")}</div>`;
    return;
  }

  if (!filtered.length) {
    adminAnnouncementsGrid.innerHTML = `<div class="empty-state">${t("announcementEmptyFiltered")}</div>`;
    return;
  }

  filtered.forEach((announcement) => {
    const meta = ANN_TYPE_META[announcement.type] || ANN_TYPE_META.info;
    const emoji = announcement.emoji || "📢";
    const isExpired = isAnnouncementExpiredClient(announcement);
    const statusBadge = isExpired
      ? `<span class="ann-status-badge" style="background:rgba(239,68,68,0.15);color:#f87171">🔴 ${t("announcementStatusExpired")}</span>`
      : announcement.active !== false
        ? `<span class="ann-status-badge" style="background:rgba(16,185,129,0.15);color:#34d399">✅ ${t("announcementStatusActive")}</span>`
        : `<span class="ann-status-badge" style="background:rgba(100,100,100,0.15);color:#888">⏸ ${t("announcementStatusPaused")}</span>`;
    const pinnedBadge = announcement.pinned
      ? `<span class="ann-status-badge" style="background:rgba(245,158,11,0.15);color:#fbbf24">📌 ${t("announcementPinnedStatus")}</span>`
      : "";
    const targetLabel = announcement.target === "area"
      ? t("announcementTargetAreaLabel", { area: announcement.targetArea || "-" })
      : announcement.target === "store"
        ? t("announcementTargetStoreLabel", { code: announcement.targetStore || "-" })
        : t("announcementTargetAllLabel");
    const expiryLabel = announcement.expiresAt
      ? t("announcementExpiry", { date: formatDateOnly(announcement.expiresAt) })
      : t("announcementNoExpiry");
    const createdAt = formatTimestamp(announcement.createdAt || announcement.updatedAt);

    const card = document.createElement("div");
    card.className = "ann-admin-card";
    card.style.borderLeftColor = meta.border;
    card.innerHTML = `
      <div class="ann-admin-top">
        <div class="ann-admin-badges">
          <span class="ann-type-badge" style="background:${meta.bg};color:${meta.color}">${emoji} ${getAnnouncementTypeBadge(announcement.type)}</span>
          ${pinnedBadge}
          ${statusBadge}
        </div>
        <div class="ann-admin-actions">
          <button class="btn-icon ann-pin-btn" data-id="${announcement.id}" title="${announcement.pinned ? t("announcementUnpinDone") : t("announcementPinDone")}">${announcement.pinned ? "📌" : "📍"}</button>
          <button class="btn-icon ann-toggle-btn" data-id="${announcement.id}" title="${announcement.active !== false ? t("announcementPauseDone") : t("announcementActivateDone")}">${announcement.active !== false ? "⏸" : "▶️"}</button>
          <button class="btn-icon ann-edit-btn" data-id="${announcement.id}" title="${t("announcementUpdate")}">✏️</button>
          <button class="btn-icon ann-del-btn" data-id="${announcement.id}" title="${t("announcementDeleteDone")}">🗑️</button>
        </div>
      </div>
      <strong class="ann-admin-title">${announcement.title}</strong>
      <p class="ann-admin-msg">${announcement.message}</p>
      <div class="ann-admin-meta">${targetLabel} · ${expiryLabel}</div>
      <div class="ann-admin-meta" style="margin-top:2px;opacity:.6">${t("announcementCreatedMeta", { user: announcement.createdBy || "", date: createdAt })}</div>
    `;
    adminAnnouncementsGrid.appendChild(card);
  });

  adminAnnouncementsGrid.querySelectorAll(".ann-del-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm(t("announcementDeleteConfirm"))) {
        return;
      }
      button.disabled = true;
      try {
        await apiFetch("/api/admin/announcements/" + button.dataset.id, { method: "DELETE" });
        showToast(t("announcementDeleteDone"), "success");
        await loadAdminAnnouncements();
      } catch (err) {
        if (handleSessionError(err)) {
          return;
        }
        showToast(err.message, "error");
      } finally {
        button.disabled = false;
      }
    });
  });

  adminAnnouncementsGrid.querySelectorAll(".ann-pin-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const result = await apiFetch("/api/admin/announcements/" + button.dataset.id + "/pin", { method: "PATCH" });
        showToast(result.pinned ? t("announcementPinDone") : t("announcementUnpinDone"), "success");
        await loadAdminAnnouncements();
      } catch (err) {
        if (handleSessionError(err)) {
          return;
        }
        showToast(err.message, "error");
      } finally {
        button.disabled = false;
      }
    });
  });

  adminAnnouncementsGrid.querySelectorAll(".ann-toggle-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const announcement = latestAdminAnnouncements.find((item) => item.id === button.dataset.id);
      const confirmMessage = announcement?.active !== false
        ? t("announcementPauseConfirm")
        : t("announcementActivateConfirm");
      if (!window.confirm(confirmMessage)) {
        return;
      }
      button.disabled = true;
      try {
        const result = await apiFetch("/api/admin/announcements/" + button.dataset.id + "/toggle", { method: "PATCH" });
        showToast(result.active ? t("announcementActivateDone") : t("announcementPauseDone"), "success");
        await loadAdminAnnouncements();
      } catch (err) {
        if (handleSessionError(err)) {
          return;
        }
        showToast(err.message, "error");
      } finally {
        button.disabled = false;
      }
    });
  });

  adminAnnouncementsGrid.querySelectorAll(".ann-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const announcement = latestAdminAnnouncements.find((item) => item.id === button.dataset.id);
      if (!announcement) {
        return;
      }
      editAnnouncement(announcement);
    });
  });
}

async function loadAdminAnnouncements(forceRefresh = false) {
  try {
    adminAnnouncementsGrid.innerHTML = `<div class="empty-state">${t("announcementLoading")}</div>`;
    if (annListMeta) annListMeta.textContent = t("announcementListMeta", { shown: 0, total: 0 });
    const params = forceRefresh ? `?refresh=1&t=${Date.now()}` : "";
    latestAdminAnnouncements = await apiFetch(`/api/admin/announcements${params}`);
    renderAdminAnnouncementsList();
  } catch (err) {
    if (handleSessionError(err, { showNotice: forceRefresh })) {
      return;
    }
    latestAdminAnnouncements = [];
    if (annListMeta) annListMeta.textContent = t("announcementListMeta", { shown: 0, total: 0 });
    adminAnnouncementsGrid.innerHTML = `<div class="empty-state">${err.message || t("announcementEmpty")}</div>`;
  }
}

function editAnnouncement(ann) {
  annTitleInput.value = ann.title || "";
  annMessageInput.value = ann.message || "";
  if (annCharCount) annCharCount.textContent = `${annMessageInput.value.length}/300`;
  if (annAreaInput) annAreaInput.value = "";
  if (annStoreCodeInput) annStoreCodeInput.value = "";
  if (annTargetSelect) {
    annTargetSelect.value = ann.target || "all";
    if (ann.target === "area" && annAreaInput) annAreaInput.value = ann.targetArea || "";
    if (ann.target === "store" && annStoreCodeInput) annStoreCodeInput.value = ann.targetStore || "";
  }
  if (annExpiresInput) annExpiresInput.value = ann.expiresAt ? ann.expiresAt.substring(0, 10) : "";
  if (annPinnedInput) annPinnedInput.checked = Boolean(ann.pinned);
  if (annNotifyPushInput) annNotifyPushInput.checked = false;
  if (annEditingId) annEditingId.value = ann.id;
  clearAnnouncementFieldErrors();
  updateAnnouncementTargetVisibility();
  if (annTypeSelector) {
    annTypeSelector.querySelectorAll(".ann-type-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.type === (ann.type || "info"));
    });
  }
  setAnnouncementFormBusy(false);
  annCancelEditBtn.classList.remove("hidden");
  adminAnnouncementForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Intercept admin generic nav clicks to load announcements specifically if selected
document.querySelectorAll("#adminNav .nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    if (tabId === "adminAnnouncementsTab") {
      loadAnnouncementTargets();
      loadAdminAnnouncements();
    }
    if (tabId === "adminPushTab") {
      loadAdminPushGateCopyConfig({ silent: true });
    }
    if (tabId === "adminMoreTab") {
      loadAdminAppConfig({ silent: true });
    }
  });
});

function renderSimulator() {
  if (!latestDashboard || !latestDashboard.rules) return;
  
  simulatorInputs.innerHTML = "";
  const { categories, levels } = latestDashboard.rules;
  const currentCumulatives = {};
  latestDashboard.categories.forEach(c => {
    currentCumulatives[c.id] = c.cumulative;
  });

  // Render inputs for each category
  latestDashboard.categories.forEach(cat => {
    const el = document.createElement("div");
    el.className = "form-group";
    el.style.marginBottom = "10px";
    el.innerHTML = `
      <label style="font-size:12px; color:#a1aab5">${cat.label} (Actual: ${cat.cumulative})</label>
      <input type="number" min="0" data-cat="${cat.id}" class="sim-input" placeholder="+0 adicionales" style="padding:8px" />
    `;
    simulatorInputs.appendChild(el);
  });

  const calculateSimulator = () => {
    let projectedCategoryReward = 0;
    const projectedCumulativeMap = { ...currentCumulatives };
    
    // Read inputs
    document.querySelectorAll(".sim-input").forEach(inp => {
       const id = inp.getAttribute("data-cat");
       const add = Number(inp.value) || 0;
       projectedCumulativeMap[id] += add;
    });

    // Calc Category Rewards
    categories.forEach(catRules => {
       const projVal = projectedCumulativeMap[catRules.id] || 0;
       if (projVal >= catRules.target && catRules.target > 0) {
          projectedCategoryReward += catRules.reward;
       }
    });

    // Calc Level Rewards
    let projectedLevelReward = 0;
    const sortedLevels = [...levels].sort((a,b) => a.order - b.order || a.label.localeCompare(b.label));
    let achievedLevel = null;
    
    for (const lvl of sortedLevels) {
       let reached = true;
       // A level is reached if ALL required targets are met
       for (const req of lvl.requirements) {
           if ((projectedCumulativeMap[req.id] || 0) < req.target) {
               reached = false;
               break;
           }
       }
       if (reached) {
           achievedLevel = lvl;
       }
    }
    if (achievedLevel) projectedLevelReward = achievedLevel.reward;

    simulatorTotalReward.textContent = formatCurrency(projectedCategoryReward + projectedLevelReward);
  };

  document.querySelectorAll(".sim-input").forEach(inp => {
    inp.addEventListener("input", calculateSimulator);
  });
  calculateSimulator();
}

openSimulatorBtn.addEventListener("click", () => {
    renderSimulator();
    simulatorModal.classList.remove("hidden");
});

closeSimulatorBtn.addEventListener("click", () => {
    simulatorModal.classList.add("hidden");
});

if (pushModalDismissBtn) {
  pushModalDismissBtn.addEventListener("click", closePushAnnouncementModal);
}

if (closePushModalBtn) {
  closePushModalBtn.addEventListener("click", closePushAnnouncementModal);
}

if (pushModalViewBtn) {
  pushModalViewBtn.addEventListener("click", () => {
    closePushAnnouncementModal();
    showStoreApp();
    switchTab($("storeNav"), storeApp, "storeHomeTab");
    activeStoreTab = "storeHomeTab";
    storeContent?.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (pushAnnouncementModal) {
  pushAnnouncementModal.addEventListener("click", (event) => {
    if (event.target === pushAnnouncementModal) {
      closePushAnnouncementModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && pushAnnouncementModal && !pushAnnouncementModal.classList.contains("hidden")) {
    closePushAnnouncementModal();
  }
});

["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, primeNotificationAudio, { passive: eventName !== "keydown" });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && pendingPushAnnouncementPayload && getRole() === "store" && getToken()) {
    const payload = pendingPushAnnouncementPayload;
    pendingPushAnnouncementPayload = null;
    handleIncomingPushAnnouncement(payload, { forceOpen: true });
  }
});


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
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (getRole() !== "store" || !getToken()) {
      return;
    }
    if (event.data?.type === "announcement-push") {
      showToast(t("pushMessageReceived"), "success", 2500);
      handleIncomingPushAnnouncement(event.data.payload || {}, { forceOpen: false });
    }
    if (event.data?.type === "announcement-open") {
      handleIncomingPushAnnouncement(event.data.payload || {}, { forceOpen: true });
    }
  });
  window.addEventListener("load", () => {
    registerServiceWorker().catch(() => null);
  });
}

/* ---------- 20. Init ---------- */
if (adminAnnouncementForm) {
  resetAnnForm();
}
pendingPushAnnouncementRef = readPushAnnouncementRefFromLocation();
updateAnnouncementTargetVisibility();
applyStaticTranslations();
renderPushGateEditorValues();
renderAdminAppConfigValues();

if (getToken()) {
  if (getRole() === "admin") {
    prepareAdminDashboardLoading();
    showAdminApp();
    adminCurrentPage = 1;
    loadAdminPushGateCopyConfig({ silent: true });
    loadAdminAppConfig({ silent: true });
    loadAdminDashboard();
  } else {
    prepareStoreDashboardLoading();
    showStoreApp();
    loadStoreDashboard();
    ensureStorePushMandatory({ silent: true });
  }
} else {
  showLogin();
  codeInput.focus();
}

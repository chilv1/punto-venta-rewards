const crypto = require("crypto");
const path = require("path");
const fs = require("fs").promises;
const express = require("express");
const XLSX = require("xlsx");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const timezone = (process.env.APP_TIMEZONE || "America/Lima").trim();
const spreadsheetId = (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "").trim();
const googleClientEmail = (process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "").trim();
const googlePrivateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").trim();
const storesRange = (process.env.GOOGLE_SHEETS_STORES_RANGE || "Stores!A:L").trim();
const levelTargetsRange = (process.env.GOOGLE_SHEETS_LEVEL_TARGETS_RANGE || "LevelTargets!A:I").trim();
const resultsRange = (process.env.GOOGLE_SHEETS_RESULTS_RANGE || "DailyResults!A:G").trim();
const sessionSecret = (process.env.SESSION_SECRET || "change-this-secret").trim();
const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24);
const sheetsCacheTtlMs = Number(process.env.GOOGLE_SHEETS_CACHE_TTL_MS || 60 * 1000);
const defaultRewards = [50, 100, 150];
const adminAccountsJson = (process.env.ADMIN_ACCOUNTS_JSON || "").trim();
const adminUsername = (process.env.ADMIN_USERNAME || "").trim();
const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
const adminName = (process.env.ADMIN_NAME || "").trim();

const SUBSCRIPTION_TYPES = [
  {
    id: "prepaid_new_line",
    label: "Trả trước New Line",
    shortLabel: "Pre New Line",
    storeKeys: [
      "target_prepaid_new_line",
      "prepaid_new_line_target",
      "tra_truoc_new_line_target",
      "chi_tieu_tra_truoc_new_line"
    ],
    resultKeys: [
      "prepaid_new_line",
      "tra_truoc_new_line",
      "tb_tra_truoc_new_line",
      "prepago_new_line"
    ],
    rewardKeys: [
      "reward_prepaid_new_line",
      "prepaid_new_line_reward",
      "thuong_tra_truoc_new_line"
    ],
    levelKeys: [
      "target_prepaid_new_line",
      "prepaid_new_line_target",
      "target_pre_new_line"
    ]
  },
  {
    id: "prepaid_portabilidad",
    label: "Trả trước Portabilidad",
    shortLabel: "Pre Porta",
    storeKeys: [
      "target_prepaid_portabilidad",
      "prepaid_portabilidad_target",
      "tra_truoc_portabilidad_target",
      "chi_tieu_tra_truoc_portabilidad"
    ],
    resultKeys: [
      "prepaid_portabilidad",
      "tra_truoc_portabilidad",
      "tb_tra_truoc_portabilidad",
      "prepago_portabilidad"
    ],
    rewardKeys: [
      "reward_prepaid_portabilidad",
      "prepaid_portabilidad_reward",
      "thuong_tra_truoc_portabilidad"
    ],
    levelKeys: [
      "target_prepaid_portabilidad",
      "prepaid_portabilidad_target",
      "target_pre_porta"
    ]
  },
  {
    id: "postpaid_new_line",
    label: "Trả sau New Line",
    shortLabel: "Post New Line",
    storeKeys: [
      "target_postpaid_new_line",
      "postpaid_new_line_target",
      "tra_sau_new_line_target",
      "chi_tieu_tra_sau_new_line"
    ],
    resultKeys: [
      "postpaid_new_line",
      "tra_sau_new_line",
      "tb_tra_sau_new_line",
      "postpago_new_line"
    ],
    rewardKeys: [
      "reward_postpaid_new_line",
      "postpaid_new_line_reward",
      "thuong_tra_sau_new_line"
    ],
    levelKeys: [
      "target_postpaid_new_line",
      "postpaid_new_line_target",
      "target_post_new_line"
    ]
  },
  {
    id: "postpaid_portabilidad",
    label: "Trả sau Portabilidad",
    shortLabel: "Post Porta",
    storeKeys: [
      "target_postpaid_portabilidad",
      "postpaid_portabilidad_target",
      "tra_sau_portabilidad_target",
      "chi_tieu_tra_sau_portabilidad"
    ],
    resultKeys: [
      "postpaid_portabilidad",
      "tra_sau_portabilidad",
      "tb_tra_sau_portabilidad",
      "postpago_portabilidad"
    ],
    rewardKeys: [
      "reward_postpaid_portabilidad",
      "postpaid_portabilidad_reward",
      "thuong_tra_sau_portabilidad"
    ],
    levelKeys: [
      "target_postpaid_portabilidad",
      "postpaid_portabilidad_target",
      "target_post_porta"
    ]
  }
];

const sessions = new Map();
const sheetCache = new Map();
let googleTokenCache = null;
let adminDashboardCache = null;

const ANNOUNCEMENT_TYPES = new Set(["info", "promo", "alert", "urgent", "success"]);
const ANNOUNCEMENT_TARGETS = new Set(["all", "area", "store"]);

// --- Announcements State ---
const ANNOUNCEMENTS_FILE = path.join(__dirname, "data", "announcements.json");

function getAnnouncementTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
}

function getAnnouncementTimeZoneOffsetMs(date, timeZone) {
  const parts = getAnnouncementTimeZoneParts(date, timeZone);
  const zonedUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  const actualUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );

  return zonedUtc - actualUtc;
}

function zonedDateInputToIso(value, timeZone, options = {}) {
  const match = String(value || "")
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = options.endOfDay ? 23 : 0;
  const minute = options.endOfDay ? 59 : 0;
  const second = options.endOfDay ? 59 : 0;
  const millisecond = options.endOfDay ? 999 : 0;

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  const initialOffset = getAnnouncementTimeZoneOffsetMs(utcGuess, timeZone);
  let timestamp = utcGuess.getTime() - initialOffset;
  const correctedOffset = getAnnouncementTimeZoneOffsetMs(new Date(timestamp), timeZone);

  if (correctedOffset !== initialOffset) {
    timestamp = utcGuess.getTime() - correctedOffset;
  }

  const normalizedParts = getAnnouncementTimeZoneParts(new Date(timestamp), timeZone);
  if (
    normalizedParts.year !== year ||
    normalizedParts.month !== month ||
    normalizedParts.day !== day
  ) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function parseAnnouncementTimestamp(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeAnnouncementRecord(record = {}) {
  const createdAt =
    parseAnnouncementTimestamp(record.createdAt || record.date) || new Date().toISOString();
  const updatedAt =
    parseAnnouncementTimestamp(record.updatedAt || record.createdAt || record.date) || createdAt;
  const type = String(record.type || "info")
    .trim()
    .toLowerCase();
  const target = String(record.target || "all")
    .trim()
    .toLowerCase();
  const normalized = {
    id: String(record.id || crypto.randomUUID()).trim() || crypto.randomUUID(),
    title: String(record.title || "").trim(),
    message: String(record.message || "").trim(),
    type: ANNOUNCEMENT_TYPES.has(type) ? type : "info",
    emoji: String(record.emoji || "").trim(),
    target: ANNOUNCEMENT_TARGETS.has(target) ? target : "all",
    targetArea: record.targetArea ? String(record.targetArea).trim() : null,
    targetStore: record.targetStore ? String(record.targetStore).trim().toUpperCase() : null,
    pinned: Boolean(record.pinned),
    active: record.active === false ? false : true,
    expiresAt: parseAnnouncementTimestamp(record.expiresAt),
    createdAt,
    updatedAt,
    createdBy: String(record.createdBy || "ADMIN").trim() || "ADMIN"
  };

  if (normalized.target !== "area") {
    normalized.targetArea = null;
  }
  if (normalized.target !== "store") {
    normalized.targetStore = null;
  }

  return {
    ...normalized,
    version: `${normalized.id}:${normalized.updatedAt}`
  };
}

function serializeAnnouncementRecord(record) {
  return {
    id: record.id,
    title: record.title,
    message: record.message,
    type: record.type,
    emoji: record.emoji,
    target: record.target,
    targetArea: record.targetArea,
    targetStore: record.targetStore,
    pinned: Boolean(record.pinned),
    active: record.active === false ? false : true,
    expiresAt: record.expiresAt || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy
  };
}

function getAnnouncementUpdatedTime(record) {
  const value = Date.parse(record.updatedAt || record.createdAt || 0);
  return Number.isFinite(value) ? value : 0;
}

function sortAnnouncements(records) {
  return [...records].sort(
    (left, right) =>
      Number(Boolean(right.pinned)) - Number(Boolean(left.pinned)) ||
      Number(right.active !== false) - Number(left.active !== false) ||
      getAnnouncementUpdatedTime(right) - getAnnouncementUpdatedTime(left)
  );
}

function isAnnouncementExpired(record, referenceDate = new Date()) {
  if (!record.expiresAt) {
    return false;
  }

  const expiresAt = Date.parse(record.expiresAt);
  return Number.isFinite(expiresAt) ? expiresAt < referenceDate.getTime() : false;
}

function getAnnouncementTargetMetadata(stores) {
  const areas = Array.from(
    new Set(
      stores
        .map((store) => String(store.area || "").trim())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  const storeItems = stores
    .map((store) => ({
      code: store.code,
      name: store.name,
      area: store.area
    }))
    .sort((left, right) => left.code.localeCompare(right.code));

  return {
    areas,
    stores: storeItems
  };
}

function validateAnnouncementPayload(body, stores, options = {}) {
  const { existing = null, createdBy = "ADMIN" } = options;
  const errors = {};
  const title = String(body?.title ?? existing?.title ?? "")
    .trim();
  const message = String(body?.message ?? existing?.message ?? "")
    .trim();
  const type = String(body?.type ?? existing?.type ?? "info")
    .trim()
    .toLowerCase();
  const emoji = String(body?.emoji ?? existing?.emoji ?? "")
    .trim();
  const target = String(body?.target ?? existing?.target ?? "all")
    .trim()
    .toLowerCase();
  const targetMetadata = getAnnouncementTargetMetadata(stores);
  const validStoreCodes = new Set(targetMetadata.stores.map((store) => store.code));
  const validAreas = new Set(targetMetadata.areas);
  const rawTargetArea = body?.targetArea !== undefined ? body.targetArea : existing?.targetArea;
  const rawTargetStore = body?.targetStore !== undefined ? body.targetStore : existing?.targetStore;
  let targetArea = rawTargetArea ? String(rawTargetArea).trim() : null;
  let targetStore = rawTargetStore ? String(rawTargetStore).trim().toUpperCase() : null;

  if (!title) {
    errors.title = "Tiêu đề thông báo là bắt buộc.";
  } else if (title.length > 80) {
    errors.title = "Tiêu đề thông báo không được vượt quá 80 ký tự.";
  }

  if (!message) {
    errors.message = "Nội dung thông báo là bắt buộc.";
  } else if (message.length > 300) {
    errors.message = "Nội dung thông báo không được vượt quá 300 ký tự.";
  }

  if (!ANNOUNCEMENT_TYPES.has(type)) {
    errors.type = "Loại thông báo không hợp lệ.";
  }

  if (!ANNOUNCEMENT_TARGETS.has(target)) {
    errors.target = "Đối tượng nhận thông báo không hợp lệ.";
  }

  if (target === "area") {
    if (!targetArea) {
      errors.targetArea = "Vui lòng chọn khu vực.";
    } else if (!validAreas.has(targetArea)) {
      errors.targetArea = "Khu vực không tồn tại trên hệ thống.";
    }
    targetStore = null;
  } else if (target === "store") {
    if (!targetStore) {
      errors.targetStore = "Vui lòng chọn điểm bán.";
    } else if (!validStoreCodes.has(targetStore)) {
      errors.targetStore = "Điểm bán không tồn tại trên hệ thống.";
    }
    targetArea = null;
  } else {
    targetArea = null;
    targetStore = null;
  }

  let expiresAt = existing?.expiresAt || null;
  if (body?.expiresAt !== undefined) {
    const rawExpiresAt = String(body.expiresAt || "").trim();
    if (!rawExpiresAt) {
      expiresAt = null;
    } else {
      expiresAt = zonedDateInputToIso(rawExpiresAt, timezone, { endOfDay: true });
      if (!expiresAt) {
        errors.expiresAt = "Ngày hết hạn không hợp lệ.";
      } else if (rawExpiresAt < getTodayKey()) {
        errors.expiresAt = "Ngày hết hạn phải từ hôm nay trở đi.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, value: null };
  }

  return {
    errors: null,
    value: normalizeAnnouncementRecord({
      id: existing?.id || crypto.randomUUID(),
      title,
      message,
      type,
      emoji,
      target,
      targetArea,
      targetStore,
      pinned: body?.pinned !== undefined ? Boolean(body.pinned) : existing?.pinned || false,
      active: existing ? (body?.active !== undefined ? Boolean(body.active) : existing.active !== false) : true,
      expiresAt,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: existing?.createdBy || createdBy
    })
  };
}

async function loadAnnouncements() {
  try {
    const data = await fs.readFile(ANNOUNCEMENTS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return sortAnnouncements(
      (Array.isArray(parsed) ? parsed : []).map((record) => normalizeAnnouncementRecord(record))
    );
  } catch (err) {
    if (err.code === "ENOENT") {
      const now = new Date().toISOString();
      return sortAnnouncements([
        normalizeAnnouncementRecord({
          id: crypto.randomUUID(),
          title: "¡Bienvenido a Novedades!",
          message: "Sigue tus resultados diarios y mantente atento a nuestras promociones.",
          type: "info",
          target: "all",
          pinned: false,
          active: true,
          createdAt: now,
          updatedAt: now,
          createdBy: "SYSTEM"
        })
      ]);
    }
    return [];
  }
}
async function saveAnnouncements(announcements) {
  try {
    const normalized = sortAnnouncements(
      (Array.isArray(announcements) ? announcements : []).map((record) =>
        normalizeAnnouncementRecord(record)
      )
    ).slice(0, 50);
    await fs.mkdir(path.dirname(ANNOUNCEMENTS_FILE), { recursive: true });
    await fs.writeFile(
      ANNOUNCEMENTS_FILE,
      JSON.stringify(normalized.map(serializeAnnouncementRecord), null, 2),
      "utf-8"
    );
    return normalized;
  } catch (err) {
    console.error("Error saving announcements:", err);
    throw err;
  }
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signJwtAssertion() {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: googleClientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: nowInSeconds + 3600,
    iat: nowInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(googlePrivateKey.replace(/\\n/g, "\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${unsignedToken}.${signature}`;
}

function isSheetsConfigured() {
  const placeholderValues = [
    "your_spreadsheet_id",
    "service-account@project-id.iam.gserviceaccount.com",
    "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
  ];

  return Boolean(
    spreadsheetId &&
      googleClientEmail &&
      googlePrivateKey &&
      !placeholderValues.includes(spreadsheetId) &&
      !placeholderValues.includes(googleClientEmail) &&
      !placeholderValues.includes(googlePrivateKey)
  );
}

async function getGoogleAccessToken() {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets is not configured. Please set the required environment variables.");
  }

  if (googleTokenCache && googleTokenCache.expiresAt > Date.now() + 60 * 1000) {
    return googleTokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: signJwtAssertion()
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to authenticate with Google.");
  }

  googleTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000
  };

  return googleTokenCache.accessToken;
}

function normalizeHeader(value, index) {
  const base = String(value || `column_${index + 1}`)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || `column_${index + 1}`;
}

function rowsToObjects(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  const headers = values[0].map(normalizeHeader);
  return values
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? "";
      });
      return record;
    });
}

async function fetchRange(range, options = {}) {
  const { force = false } = options;
  if (!force) {
    const cached = sheetCache.get(range);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.rows;
    }
  } else {
    sheetCache.delete(range);
  }

  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Unable to read Google Sheets data.");
  }

  const rows = rowsToObjects(data.values || []);
  sheetCache.set(range, {
    rows,
    expiresAt: Date.now() + sheetsCacheTtlMs
  });
  return rows;
}

function pick(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function parseAmount(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    return fallback;
  }

  const normalized = raw.replace(/[^\d,.-]/g, "");
  if (!normalized) {
    return fallback;
  }

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");
  let numeric = normalized;

  if (hasComma && hasDot) {
    numeric = normalized.replace(/,/g, "");
  } else if (hasComma) {
    numeric = normalized.replace(",", ".");
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOrder(value, fallback = 999) {
  const parsed = parseAmount(value, fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function datePartsToKey(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function parseSheetDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return datePartsToKey(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = Math.round((value - 25569) * 86400 * 1000);
    return datePartsToKey(new Date(millis));
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return raw;
  }

  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return datePartsToKey(parsed);
  }

  return "";
}

function getTodayKey() {
  return datePartsToKey(new Date());
}

function getCurrentMonthKey() {
  return getTodayKey().slice(0, 7);
}

function createEmptyTypeMap() {
  return Object.fromEntries(SUBSCRIPTION_TYPES.map((type) => [type.id, 0]));
}

function sanitizeStore(storeRow) {
  return {
    code: String(pick(storeRow, ["code", "store_code", "point_code", "cusps_code"])).trim().toUpperCase(),
    password: String(pick(storeRow, ["password", "pass", "mat_khau"])).trim(),
    name: String(pick(storeRow, ["name", "store_name", "point_name", "ten_diem_ban"]) || "").trim(),
    area: String(pick(storeRow, ["area", "region", "zona", "khu_vuc"]) || "").trim(),
    targets: SUBSCRIPTION_TYPES.map((type) => ({
      id: type.id,
      label: type.label,
      shortLabel: type.shortLabel,
      target: parseAmount(pick(storeRow, type.storeKeys)),
      reward: parseAmount(pick(storeRow, type.rewardKeys))
    }))
  };
}

function sanitizeAdmin(admin) {
  return {
    username: String(admin?.username || "")
      .trim()
      .toUpperCase(),
    password: String(admin?.password || "").trim(),
    name: String(admin?.name || "").trim()
  };
}

function getConfiguredAdmins() {
  if (adminAccountsJson) {
    try {
      const parsed = JSON.parse(adminAccountsJson);
      if (Array.isArray(parsed)) {
        return parsed
          .map(sanitizeAdmin)
          .filter((admin) => admin.username && admin.password);
      }
    } catch (error) {
      console.error("Invalid ADMIN_ACCOUNTS_JSON:", error);
    }
  }

  if (adminUsername && adminPassword) {
    return [
      sanitizeAdmin({
        username: adminUsername,
        password: adminPassword,
        name: adminName
      })
    ];
  }

  return [];
}

function normalizeLevelTargets(levelRow) {
  const levelCode = String(
    pick(levelRow, ["level_code", "level_id", "code", "muc_code"])
  ).trim();
  const order = parseOrder(
    pick(levelRow, ["level_order", "order", "level_no", "muc_thu_tu"]),
    levelCode.match(/\d+/)?.[0] || 999
  );

  const requirements = SUBSCRIPTION_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
    shortLabel: type.shortLabel,
    target: parseAmount(pick(levelRow, type.levelKeys))
  }));

  return {
    storeCode: String(
      pick(levelRow, ["store_code", "code", "point_code", "cusps_code"])
    ).trim().toUpperCase(),
    levelCode: levelCode || `LEVEL_${order}`,
    label: String(pick(levelRow, ["level_name", "label", "muc_name"]) || `Mức ${order}`).trim(),
    order,
    reward: parseAmount(
      pick(levelRow, ["reward", "reward_pen", "level_reward", "thuong"]),
      defaultRewards[Math.max(0, Math.min(defaultRewards.length - 1, order - 1))]
    ),
    requirements
  };
}

function getFallbackLevelsFromStoreRow(storeRow) {
  const legacyLevels = [1, 2, 3]
    .map((level, index) => {
      const target = parseAmount(
        pick(storeRow, [
          `level_${level}_target`,
          `target_level_${level}`,
          `muc_${level}`,
          `chi_tieu_muc_${level}`
        ])
      );
      if (target <= 0) {
        return null;
      }
      return {
        storeCode: String(pick(storeRow, ["code"])).trim().toUpperCase(),
        levelCode: `M${level}`,
        label: `Mức ${level}`,
        order: level,
        reward: parseAmount(
          pick(storeRow, [
            `level_${level}_reward`,
            `reward_level_${level}`,
            `thuong_muc_${level}`,
            `muc_${level}_reward`
          ]),
          defaultRewards[index]
        ),
        requirements: SUBSCRIPTION_TYPES.map((type) => ({
          id: type.id,
          label: type.label,
          shortLabel: type.shortLabel,
          target
        }))
      };
    })
    .filter(Boolean);

  return legacyLevels;
}

async function getDataSnapshot(options = {}) {
  const { force = false } = options;
  if (force) { adminDashboardCache = null; }
  const [storeRows, levelTargetRows, dailyResults] = await Promise.all([
    fetchRange(storesRange, { force }),
    fetchRange(levelTargetsRange, { force }),
    fetchRange(resultsRange, { force })
  ]);

  const rawStores = storeRows.map(sanitizeStore).filter((store) => store.code);
  const normalizedLevelRows = levelTargetRows
    .map(normalizeLevelTargets)
    .filter((row) => row.storeCode && row.requirements.some((item) => item.target > 0));

  const levelsByStore = new Map();
  normalizedLevelRows.forEach((row) => {
    if (!levelsByStore.has(row.storeCode)) {
      levelsByStore.set(row.storeCode, []);
    }
    levelsByStore.get(row.storeCode).push(row);
  });

  const stores = rawStores.map((store, index) => {
    const dynamicLevels = levelsByStore.get(store.code) || [];
    const levels = (dynamicLevels.length ? dynamicLevels : getFallbackLevelsFromStoreRow(storeRows[index]))
      .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
    return {
      ...store,
      levels
    };
  });

  // Pre-index dailyResults by store code for O(1) lookup per store
  const resultsByStore = new Map();
  const todayKey = getTodayKey();
  const currentMonthKey = getCurrentMonthKey();
  for (const row of dailyResults) {
    const rowCode = String(pick(row, ["store_code", "code", "point_code", "cusps_code"]))
      .trim()
      .toUpperCase();
    if (!rowCode) continue;
    const dateKey = parseSheetDate(pick(row, ["date", "business_date", "ngay"]));
    if (!dateKey || dateKey > todayKey || !dateKey.startsWith(currentMonthKey)) continue;
    if (!resultsByStore.has(rowCode)) {
      resultsByStore.set(rowCode, []);
    }
    resultsByStore.get(rowCode).push({ row, dateKey });
  }

  return {
    stores,
    dailyResults,
    resultsByStore
  };
}

function buildLevelStatus(level, cumulativeMap) {
  const requirements = level.requirements.map((requirement) => {
    const actual = cumulativeMap[requirement.id] || 0;
    return {
      ...requirement,
      actual,
      remaining: Math.max(0, requirement.target - actual),
      reached: requirement.target > 0 ? actual >= requirement.target : true,
      progress: requirement.target > 0 ? Math.min(100, (actual / requirement.target) * 100) : 100
    };
  });

  const activeRequirements = requirements.filter((item) => item.target > 0);
  const reached =
    activeRequirements.length > 0 && activeRequirements.every((item) => item.reached);
  const progress =
    activeRequirements.length > 0
      ? Math.min(...activeRequirements.map((item) => item.progress))
      : 0;

  return {
    id: level.levelCode,
    label: level.label,
    reward: level.reward,
    order: level.order,
    requirements,
    reached,
    progress,
    missingRequirements: activeRequirements
      .filter((item) => !item.reached)
      .map((item) => ({
        id: item.id,
        label: item.label,
        shortLabel: item.shortLabel,
        remaining: item.remaining
      }))
  };
}

function buildDashboardForStore(store, dailyResults, resultsByStore) {
  const todayKey = getTodayKey();
  const currentMonthKey = getCurrentMonthKey();
  const historyMap = new Map();
  const cumulativeMap = createEmptyTypeMap();
  const targetMap = Object.fromEntries(store.targets.map((item) => [item.id, item.target]));

  // Use pre-indexed results if available, otherwise fall back to full scan
  const storeResults = resultsByStore
    ? (resultsByStore.get(store.code) || [])
    : null;

  if (storeResults) {
    // Fast path: pre-indexed, pre-filtered results
    for (const { row, dateKey } of storeResults) {
      const entry = historyMap.get(dateKey) || createEmptyTypeMap();
      for (const type of SUBSCRIPTION_TYPES) {
        const amount = parseAmount(pick(row, type.resultKeys));
        entry[type.id] += amount;
        cumulativeMap[type.id] += amount;
      }
      historyMap.set(dateKey, entry);
    }
  } else {
    // Fallback: full scan (for single-store detail calls)
    for (const row of dailyResults) {
      const rowCode = String(pick(row, ["store_code", "code", "point_code", "cusps_code"]))
        .trim()
        .toUpperCase();
      if (rowCode !== store.code) continue;
      const dateKey = parseSheetDate(pick(row, ["date", "business_date", "ngay"]));
      if (!dateKey || dateKey > todayKey || !dateKey.startsWith(currentMonthKey)) continue;
      const entry = historyMap.get(dateKey) || createEmptyTypeMap();
      for (const type of SUBSCRIPTION_TYPES) {
        const amount = parseAmount(pick(row, type.resultKeys));
        entry[type.id] += amount;
        cumulativeMap[type.id] += amount;
      }
      historyMap.set(dateKey, entry);
    }
  }

  const history = Array.from(historyMap.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-7)
    .map(([date, values]) => ({
      date,
      total: Object.values(values).reduce((sum, value) => sum + value, 0),
      breakdown: SUBSCRIPTION_TYPES.map((type) => ({
        id: type.id,
        shortLabel: type.shortLabel,
        value: values[type.id] || 0
      }))
    }));

  const todayValues = historyMap.get(todayKey) || createEmptyTypeMap();
  const dailyTotal = Object.values(todayValues).reduce((sum, value) => sum + value, 0);
  const cumulativeTotal = Object.values(cumulativeMap).reduce((sum, value) => sum + value, 0);
  const totalTarget = Object.values(targetMap).reduce((sum, value) => sum + value, 0);

  const categories = SUBSCRIPTION_TYPES.map((type) => {
    const storeTarget = store.targets.find((item) => item.id === type.id) || {};
    const target = targetMap[type.id] || 0;
    const daily = todayValues[type.id] || 0;
    const cumulative = cumulativeMap[type.id] || 0;
    return {
      id: type.id,
      label: type.label,
      shortLabel: type.shortLabel,
      target,
      reward: storeTarget.reward || 0,
      daily,
      cumulative,
      progress: target > 0 ? Math.min(100, (cumulative / target) * 100) : 0,
      remaining: Math.max(0, target - cumulative),
      reached: target > 0 ? cumulative >= target : false
    };
  });

  const levels = store.levels
    .map((level) => buildLevelStatus(level, cumulativeMap))
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));

  const achievedLevel = [...levels].reverse().find((level) => level.reached) || null;
  const nextLevel = levels.find((level) => !level.reached) || null;
  const levelReward = achievedLevel?.reward || 0;
  const categoryRewardTotal = categories
    .filter((category) => category.reached && category.reward > 0)
    .reduce((sum, category) => sum + category.reward, 0);
  const totalReward = levelReward + categoryRewardTotal;

  return {
    store: {
      code: store.code,
      name: store.name || `Điểm bán ${store.code}`,
      area: store.area
    },
    today: {
      date: todayKey,
      total: dailyTotal,
      breakdown: categories.map((item) => ({
        id: item.id,
        label: item.label,
        shortLabel: item.shortLabel,
        value: item.daily
      }))
    },
    cumulative: {
      total: cumulativeTotal,
      target: totalTarget,
      progress: totalTarget > 0 ? Math.min(100, (cumulativeTotal / totalTarget) * 100) : 0,
      remaining: Math.max(0, totalTarget - cumulativeTotal)
    },
    rewardSummary: {
      total: totalReward,
      levelReward,
      categoryRewardTotal,
      monthKey: currentMonthKey,
      categories: categories
        .filter((category) => category.reached && category.reward > 0)
        .map((category) => ({
          id: category.id,
          label: category.label,
          reward: category.reward
        }))
    },
    achievements: {
      achievedLevel: achievedLevel
        ? {
            id: achievedLevel.id,
            label: achievedLevel.label,
            reward: achievedLevel.reward
          }
        : null,
      nextLevel: nextLevel
        ? {
            id: nextLevel.id,
            label: nextLevel.label,
            reward: nextLevel.reward,
            missingRequirements: nextLevel.missingRequirements
          }
        : null
    },
    levels,
    categories,
    history,
    updatedAt: new Date().toISOString(),
    rules: {
      levels: store.levels,
      categories: store.targets
    }
  };
}

function sumBy(items, getValue) {
  return items.reduce((sum, item) => sum + Number(getValue(item) || 0), 0);
}

function normalizeAdminPageSize(value) {
  const parsed = Number.parseInt(String(value || "20"), 10);
  if (parsed === 30) {
    return 30;
  }
  return 20;
}

function normalizeAdminPage(value) {
  const parsed = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildStoreDashboardSummary(storeDashboard) {
  return {
    code: storeDashboard.store.code,
    name: storeDashboard.store.name,
    area: storeDashboard.store.area,
    todayTotal: storeDashboard.today.total,
    cumulativeTotal: storeDashboard.cumulative.total,
    cumulativeTarget: storeDashboard.cumulative.target,
    cumulativeProgress: storeDashboard.cumulative.progress,
    totalReward: storeDashboard.rewardSummary.total,
    levelReward: storeDashboard.rewardSummary.levelReward,
    categoryReward: storeDashboard.rewardSummary.categoryRewardTotal,
    achievedLevel: storeDashboard.achievements.achievedLevel
      ? {
          label: storeDashboard.achievements.achievedLevel.label,
          reward: storeDashboard.achievements.achievedLevel.reward
        }
      : null,
    nextLevel: storeDashboard.achievements.nextLevel
      ? {
          label: storeDashboard.achievements.nextLevel.label,
          reward: storeDashboard.achievements.nextLevel.reward
        }
      : null
  };
}

function paginateItems(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      startIndex
    }
  };
}

function buildAggregateCategories(storeDashboards) {
  return SUBSCRIPTION_TYPES.map((type) => {
    const categories = storeDashboards
      .map((dashboard) => dashboard.categories.find((item) => item.id === type.id))
      .filter(Boolean);

    const daily = sumBy(categories, (item) => item.daily);
    const cumulative = sumBy(categories, (item) => item.cumulative);
    const target = sumBy(categories, (item) => item.target);
    const rewardEarned = sumBy(
      categories.filter((item) => item.reached && item.reward > 0),
      (item) => item.reward
    );

    return {
      id: type.id,
      label: type.label,
      shortLabel: type.shortLabel,
      daily,
      cumulative,
      target,
      remaining: Math.max(0, target - cumulative),
      progress: target > 0 ? Math.min(100, (cumulative / target) * 100) : 0,
      reachedStores: categories.filter((item) => item.reached).length,
      rewardEarned
    };
  });
}

function buildAggregateLevels(storeDashboards) {
  const levelMap = new Map();

  for (const dashboard of storeDashboards) {
    for (const level of dashboard.levels) {
      const mapKey = `${level.order}::${level.label}`;
      if (!levelMap.has(mapKey)) {
        levelMap.set(mapKey, {
          id: level.id,
          label: level.label,
          order: level.order,
          reward: level.reward,
          storesWithLevel: 0,
          reachedStores: 0,
          rewardEarned: 0,
          requirements: SUBSCRIPTION_TYPES.map((type) => ({
            id: type.id,
            label: type.label,
            shortLabel: type.shortLabel,
            actual: 0,
            target: 0,
            remaining: 0,
            progress: 0,
            reached: false
          }))
        });
      }

      const aggregate = levelMap.get(mapKey);
      aggregate.storesWithLevel += 1;
      if (level.reached) {
        aggregate.reachedStores += 1;
        aggregate.rewardEarned += level.reward;
      }

      for (const requirement of level.requirements) {
        const aggregateRequirement = aggregate.requirements.find((item) => item.id === requirement.id);
        if (!aggregateRequirement) {
          continue;
        }
        aggregateRequirement.actual += Number(requirement.actual || 0);
        aggregateRequirement.target += Number(requirement.target || 0);
      }
    }
  }

  return Array.from(levelMap.values())
    .map((level) => {
      const requirements = level.requirements.map((requirement) => {
        const progress =
          requirement.target > 0 ? Math.min(100, (requirement.actual / requirement.target) * 100) : 0;
        return {
          ...requirement,
          remaining: Math.max(0, requirement.target - requirement.actual),
          progress,
          reached: requirement.target > 0 ? requirement.actual >= requirement.target : false
        };
      });

      const activeRequirements = requirements.filter((item) => item.target > 0);
      return {
        ...level,
        requirements,
        progress:
          activeRequirements.length > 0
            ? Math.min(...activeRequirements.map((item) => item.progress))
            : 0
      };
    })
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
}

function buildAdminOverview(storeDashboards, admin) {
  const aggregateCategories = buildAggregateCategories(storeDashboards);
  const aggregateLevels = buildAggregateLevels(storeDashboards);
  const storesCount = storeDashboards.length;
  const todayTotal = sumBy(storeDashboards, (item) => item.today.total);
  const cumulativeTotal = sumBy(storeDashboards, (item) => item.cumulative.total);
  const cumulativeTarget = sumBy(storeDashboards, (item) => item.cumulative.target);
  const totalReward = sumBy(storeDashboards, (item) => item.rewardSummary.total);
  const levelRewardTotal = sumBy(storeDashboards, (item) => item.rewardSummary.levelReward);
  const categoryRewardTotal = sumBy(storeDashboards, (item) => item.rewardSummary.categoryRewardTotal);

  return {
    admin: {
      username: admin.username,
      name: admin.name || admin.username
    },
    summary: {
      storesCount,
      todayTotal,
      cumulativeTotal,
      cumulativeTarget,
      progress: cumulativeTarget > 0 ? Math.min(100, (cumulativeTotal / cumulativeTarget) * 100) : 0,
      totalReward,
      levelRewardTotal,
      categoryRewardTotal,
      monthKey: getCurrentMonthKey()
    },
    aggregateCategories,
    aggregateLevels,
    updatedAt: new Date().toISOString()
  };
}

function buildAdminStoresPage(storeDashboards, options = {}) {
  const page = normalizeAdminPage(options.page);
  const pageSize = normalizeAdminPageSize(options.pageSize);
  const storeItems = storeDashboards.map(buildStoreDashboardSummary);
  const { items, pagination } = paginateItems(storeItems, page, pageSize);
  return {
    items,
    pagination
  };
}

function buildAdminStoreSearch(storeDashboards, options = {}) {
  const page = normalizeAdminPage(options.page);
  const pageSize = normalizeAdminPageSize(options.pageSize);
  const query = String(options.query || "")
    .trim()
    .toUpperCase();

  const filtered = query
    ? storeDashboards.filter((item) => item.store.code.toUpperCase().includes(query))
    : [];
  const storeItems = filtered.map(buildStoreDashboardSummary);
  const { items, pagination } = paginateItems(storeItems, page, pageSize);

  // Include the first matching store's full detail to avoid a second API call
  const firstDetail = filtered.length > 0 ? filtered[0] : null;

  return {
    query,
    items,
    pagination,
    firstDetail
  };
}

function buildAdminDashboard(stores, dailyResults, admin, options = {}, resultsByStore) {
  const storeDashboards = stores
    .map((store) => buildDashboardForStore(store, dailyResults, resultsByStore))
    .sort((left, right) => left.store.code.localeCompare(right.store.code));

  const allStoreItems = storeDashboards.map(buildStoreDashboardSummary);

  return {
    ...buildAdminOverview(storeDashboards, admin),
    allStoreItems,
    storesPage: buildAdminStoresPage(storeDashboards, options),
    _storeDashboards: storeDashboards
  };
}

function buildAdminStoreDetail(stores, dailyResults, code, resultsByStore) {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();
  const store = stores.find((item) => item.code === normalizedCode);
  if (!store) {
    return null;
  }
  return buildDashboardForStore(store, dailyResults, resultsByStore);
}

function buildAdminExportWorkbook(adminDashboard) {
  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    {
      admin: adminDashboard.admin.name,
      month: adminDashboard.summary.monthKey,
      stores_count: adminDashboard.summary.storesCount,
      today_total: adminDashboard.summary.todayTotal,
      cumulative_total: adminDashboard.summary.cumulativeTotal,
      cumulative_target: adminDashboard.summary.cumulativeTarget,
      cumulative_progress_percent: Math.round(adminDashboard.summary.progress),
      total_reward_pen: adminDashboard.summary.totalReward,
      total_level_reward_pen: adminDashboard.summary.levelRewardTotal,
      total_category_reward_pen: adminDashboard.summary.categoryRewardTotal
    }
  ];

  const storeRows = adminDashboard.storeDashboards.map((storeDashboard) => ({
    code: storeDashboard.store.code,
    name: storeDashboard.store.name,
    area: storeDashboard.store.area,
    today_total: storeDashboard.today.total,
    cumulative_total: storeDashboard.cumulative.total,
    cumulative_target: storeDashboard.cumulative.target,
    cumulative_progress_percent: Math.round(storeDashboard.cumulative.progress),
    total_reward_pen: storeDashboard.rewardSummary.total,
    level_reward_pen: storeDashboard.rewardSummary.levelReward,
    category_reward_pen: storeDashboard.rewardSummary.categoryRewardTotal,
    achieved_level: storeDashboard.achievements.achievedLevel?.label || "",
    achieved_level_reward_pen: storeDashboard.achievements.achievedLevel?.reward || 0,
    next_level: storeDashboard.achievements.nextLevel?.label || ""
  }));

  const categoryRows = adminDashboard.storeDashboards.flatMap((storeDashboard) =>
    storeDashboard.categories.map((category) => ({
      store_code: storeDashboard.store.code,
      store_name: storeDashboard.store.name,
      category_id: category.id,
      category_label: category.label,
      daily: category.daily,
      cumulative: category.cumulative,
      target: category.target,
      remaining: category.remaining,
      progress_percent: Math.round(category.progress),
      reached: category.reached ? "YES" : "NO",
      reward_pen: category.reward
    }))
  );

  const levelRows = adminDashboard.storeDashboards.flatMap((storeDashboard) =>
    storeDashboard.levels.map((level) => ({
      store_code: storeDashboard.store.code,
      store_name: storeDashboard.store.name,
      level_code: level.id,
      level_label: level.label,
      level_order: level.order,
      reward_pen: level.reward,
      progress_percent: Math.round(level.progress),
      reached: level.reached ? "YES" : "NO",
      prepaid_new_line_actual: level.requirements.find((item) => item.id === "prepaid_new_line")?.actual || 0,
      prepaid_new_line_target: level.requirements.find((item) => item.id === "prepaid_new_line")?.target || 0,
      prepaid_portabilidad_actual:
        level.requirements.find((item) => item.id === "prepaid_portabilidad")?.actual || 0,
      prepaid_portabilidad_target:
        level.requirements.find((item) => item.id === "prepaid_portabilidad")?.target || 0,
      postpaid_new_line_actual: level.requirements.find((item) => item.id === "postpaid_new_line")?.actual || 0,
      postpaid_new_line_target: level.requirements.find((item) => item.id === "postpaid_new_line")?.target || 0,
      postpaid_portabilidad_actual:
        level.requirements.find((item) => item.id === "postpaid_portabilidad")?.actual || 0,
      postpaid_portabilidad_target:
        level.requirements.find((item) => item.id === "postpaid_portabilidad")?.target || 0
    }))
  );

  const aggregateCategoryRows = adminDashboard.aggregateCategories.map((category) => ({
    category_id: category.id,
    category_label: category.label,
    daily: category.daily,
    cumulative: category.cumulative,
    target: category.target,
    remaining: category.remaining,
    progress_percent: Math.round(category.progress),
    reached_stores: category.reachedStores,
    reward_earned_pen: category.rewardEarned
  }));

  const aggregateLevelRows = adminDashboard.aggregateLevels.map((level) => ({
    level_label: level.label,
    level_order: level.order,
    reward_pen: level.reward,
    progress_percent: Math.round(level.progress),
    stores_with_level: level.storesWithLevel,
    reached_stores: level.reachedStores,
    reward_earned_pen: level.rewardEarned,
    prepaid_new_line_actual: level.requirements.find((item) => item.id === "prepaid_new_line")?.actual || 0,
    prepaid_new_line_target: level.requirements.find((item) => item.id === "prepaid_new_line")?.target || 0,
    prepaid_portabilidad_actual:
      level.requirements.find((item) => item.id === "prepaid_portabilidad")?.actual || 0,
    prepaid_portabilidad_target:
      level.requirements.find((item) => item.id === "prepaid_portabilidad")?.target || 0,
    postpaid_new_line_actual: level.requirements.find((item) => item.id === "postpaid_new_line")?.actual || 0,
    postpaid_new_line_target: level.requirements.find((item) => item.id === "postpaid_new_line")?.target || 0,
    postpaid_portabilidad_actual:
      level.requirements.find((item) => item.id === "postpaid_portabilidad")?.actual || 0,
    postpaid_portabilidad_target:
      level.requirements.find((item) => item.id === "postpaid_portabilidad")?.target || 0
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(storeRows), "Stores");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoryRows), "Categories");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(levelRows), "Levels");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(aggregateCategoryRows),
    "AggregateCategories"
  );
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(aggregateLevelRows), "AggregateLevels");

  return workbook;
}

function buildAdminExportData(stores, dailyResults, admin, resultsByStore) {
  const storeDashboards = stores
    .map((store) => buildDashboardForStore(store, dailyResults, resultsByStore))
    .sort((left, right) => left.store.code.localeCompare(right.store.code));

  return {
    ...buildAdminOverview(storeDashboards, admin),
    storeDashboards
  };
}

function createSession(payload) {
  const raw = `${payload.role}:${payload.code || payload.username}:${Date.now()}:${crypto.randomUUID()}:${sessionSecret}`;
  const token = crypto.createHash("sha256").update(raw).digest("hex");
  sessions.set(token, {
    ...payload,
    expiresAt: Date.now() + sessionTtlMs
  });
  return token;
}

function getSessionToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function authenticate(req, res, next) {
  const token = getSessionToken(req);
  if (!token) {
    return jsonError(res, 401, "Vui lòng đăng nhập.");
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return jsonError(res, 401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  req.session = session;
  req.sessionToken = token;
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session?.role !== role) {
      return jsonError(res, 403, "Bạn không có quyền truy cập khu vực này.");
    }
    return next();
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    googleSheetsConfigured: isSheetsConfigured(),
    adminConfigured: getConfiguredAdmins().length > 0,
    schema: "subscription-metrics-v5-admin-env"
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const password = String(req.body?.password || "").trim();

    if (!code || !password) {
      return jsonError(res, 400, "Vui lòng nhập mã điểm bán và mật khẩu.");
    }

    // Check admin credentials first (from env config — no Sheets fetch needed)
    const admins = getConfiguredAdmins();
    const admin = admins.find((item) => item.username === code && item.password === password);

    if (admin) {
      const token = createSession({
        role: "admin",
        username: admin.username,
        name: admin.name
      });

      return res.json({
        token,
        role: "admin",
        admin: { username: admin.username, name: admin.name || admin.username }
      });
    }

    // Store login needs Sheets data to verify credentials
    const { stores, dailyResults, resultsByStore } = await getDataSnapshot();
    const store = stores.find((item) => item.code === code && item.password === password);

    if (!store) {
      return jsonError(res, 401, "Sai mã điểm bán hoặc mật khẩu.");
    }

    const token = createSession({
      role: "store",
      code: store.code
    });
    
    const dashboardPayload = await buildStoreDashboardPayload(store, stores, dailyResults, resultsByStore);
    
    return res.json({
      token,
      role: "store",
      dashboard: dashboardPayload
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonError(res, 500, error.message || "Không thể đăng nhập lúc này.");
  }
});

async function buildStoreDashboardPayload(store, stores, dailyResults, resultsByStore) {
  // Ensure admin cache is valid so we have fast access to all store score totals
  let cachedDashboards;
  if (adminDashboardCache && adminDashboardCache.expiresAt > Date.now()) {
      cachedDashboards = adminDashboardCache.storeDashboards;
  } else {
      const built = buildAdminDashboard(stores, dailyResults, { username: 'system' }, { page: 1, pageSize: 20 }, resultsByStore);
      const { _storeDashboards, ...response } = built;
      adminDashboardCache = {
          storeDashboards: _storeDashboards,
          overview: response,
          expiresAt: Date.now() + sheetsCacheTtlMs
      };
      cachedDashboards = _storeDashboards;
  }

  let leaderboard = null;
  if (store.area) {
     const areaDashboards = cachedDashboards.filter(d => d.store.area === store.area);
     const sortedArea = areaDashboards.sort((a, b) => b.cumulative.total - a.cumulative.total);
     const top10 = sortedArea.slice(0, 10).map((d, index) => ({
        rank: index + 1,
        code: d.store.code,
        name: d.store.name,
        total: d.cumulative.total
     }));
     const myRank = sortedArea.findIndex(d => d.store.code === store.code) + 1;
     leaderboard = { top10, myRank, totalStores: sortedArea.length };
  }
  
  const allAnnouncements = await loadAnnouncements();
  const announcements = allAnnouncements.filter((announcement) => {
    if (announcement.active === false || isAnnouncementExpired(announcement)) {
      return false;
    }
    if (announcement.target === "area") {
      return announcement.targetArea === store.area;
    }
    if (announcement.target === "store") {
      return announcement.targetStore === store.code;
    }
    return true;
  });

  const dashboard = buildDashboardForStore(store, dailyResults, resultsByStore);

  return {
      ...dashboard,
      announcements,
      leaderboard
  };
}

app.get("/api/dashboard", authenticate, requireRole("store"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const { stores, dailyResults, resultsByStore } = await getDataSnapshot({ force });
    const store = stores.find((item) => item.code === req.session.code);

    if (!store) {
      sessions.delete(req.sessionToken);
      return jsonError(res, 404, "Điểm bán không còn tồn tại trên hệ thống.");
    }

    const payload = await buildStoreDashboardPayload(store, stores, dailyResults, resultsByStore);
    return res.json(payload);
  } catch (error) {
    console.error("Dashboard error:", error);
    return jsonError(res, 500, error.message || "Không thể tải dashboard.");
  }
});

app.post("/api/auth/logout", authenticate, (req, res) => {
  sessions.delete(req.sessionToken);
  return res.json({ ok: true });
});

app.get("/api/admin/dashboard", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    const { stores, dailyResults, resultsByStore } = await getDataSnapshot({ force });

    // Cache the expensive computation (all store dashboards)
    if (!adminDashboardCache || force) {
      const built = buildAdminDashboard(stores, dailyResults, req.session, { page, pageSize }, resultsByStore);
      const { _storeDashboards, ...response } = built;
      adminDashboardCache = {
        storeDashboards: _storeDashboards,
        overview: response,
        expiresAt: Date.now() + sheetsCacheTtlMs
      };
      return res.json(response);
    }

    if (adminDashboardCache.expiresAt > Date.now()) {
      // Re-paginate from cached storeDashboards
      const repaged = {
        ...adminDashboardCache.overview,
        storesPage: buildAdminStoresPage(adminDashboardCache.storeDashboards, { page, pageSize })
      };
      return res.json(repaged);
    }

    // Cache expired
    adminDashboardCache = null;
    const built = buildAdminDashboard(stores, dailyResults, req.session, { page, pageSize }, resultsByStore);
    const { _storeDashboards, ...response } = built;
    adminDashboardCache = {
      storeDashboards: _storeDashboards,
      overview: response,
      expiresAt: Date.now() + sheetsCacheTtlMs
    };
    return res.json(response);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return jsonError(res, 500, error.message || "Không thể tải dashboard quản trị.");
  }
});

app.get("/api/admin/stores", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const query = String(req.query.query || "").trim().toUpperCase();
    const { stores, dailyResults, resultsByStore } = await getDataSnapshot({ force });

    // Filter stores FIRST by code, then only build dashboards for matching stores
    const matchingStores = query
      ? stores.filter((store) => store.code.toUpperCase().includes(query))
      : [];

    const storeDashboards = matchingStores
      .map((store) => buildDashboardForStore(store, dailyResults, resultsByStore))
      .sort((left, right) => left.store.code.localeCompare(right.store.code));

    return res.json(
      buildAdminStoreSearch(storeDashboards, {
        query: req.query.query,
        page: req.query.page,
        pageSize: req.query.pageSize
      })
    );
  } catch (error) {
    console.error("Admin stores search error:", error);
    return jsonError(res, 500, error.message || "Không thể tìm kiếm điểm bán.");
  }
});

app.get("/api/admin/store", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const code = String(req.query.code || "")
      .trim()
      .toUpperCase();
    if (!code) {
      return jsonError(res, 400, "Vui lòng nhập mã điểm bán.");
    }

    const { stores, dailyResults, resultsByStore } = await getDataSnapshot({ force });
    const detail = buildAdminStoreDetail(stores, dailyResults, code, resultsByStore);
    if (!detail) {
      return jsonError(res, 404, "Điểm bán không còn tồn tại trên hệ thống.");
    }

    return res.json(detail);
  } catch (error) {
    console.error("Admin store detail error:", error);
    return jsonError(res, 500, error.message || "Không thể tải chi tiết điểm bán.");
  }
});

app.get("/api/admin/export", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const { stores, dailyResults, resultsByStore } = await getDataSnapshot({ force });
    const adminDashboard = buildAdminExportData(stores, dailyResults, req.session, resultsByStore);
    const workbook = buildAdminExportWorkbook(adminDashboard);
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"pdv-admin-report-${adminDashboard.summary.monthKey}.xlsx\"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  } catch (error) {
    console.error("Admin export error:", error);
    return jsonError(res, 500, error.message || "Không thể xuất file Excel.");
  }
});

// --- Announcements API ---

app.get("/api/announcements", async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const storeCode = String(req.query.store || "").trim().toUpperCase();
    const area = String(req.query.area || "").trim();
    const filtered = list.filter((announcement) => {
      if (announcement.active === false || isAnnouncementExpired(announcement)) {
        return false;
      }
      if (announcement.target === "area") {
        return announcement.targetArea === area;
      }
      if (announcement.target === "store") {
        return announcement.targetStore === storeCode;
      }
      return true;
    });
    res.json(filtered);
  } catch (err) {
    console.error("Announcements error:", err);
    res.json([]);
  }
});

app.get("/api/admin/announcements", authenticate, requireRole("admin"), async (_req, res) => {
  try {
    return res.json(await loadAnnouncements());
  } catch (err) {
    console.error("Admin announcements error:", err);
    return jsonError(res, 500, "Không thể tải danh sách thông báo.");
  }
});

app.get("/api/admin/announcement-targets", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const { stores } = await getDataSnapshot({ force });
    return res.json(getAnnouncementTargetMetadata(stores));
  } catch (err) {
    console.error("Announcement target metadata error:", err);
    return jsonError(res, 500, "Không thể tải danh sách điểm bán.");
  }
});

app.post("/api/admin/announcements", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const { stores } = await getDataSnapshot();
    const { errors, value } = validateAnnouncementPayload(req.body, stores, {
      createdBy: req.session.username || "ADMIN"
    });

    if (errors) {
      return res.status(400).json({
        error: "Dữ liệu thông báo không hợp lệ.",
        fieldErrors: errors
      });
    }

    const saved = await saveAnnouncements([value, ...list]);
    return res.status(201).json(saved.find((record) => record.id === value.id) || value);
  } catch (err) {
    console.error("Create announcement error:", err);
    return jsonError(res, 500, "Không thể lưu thông báo.");
  }
});

app.put("/api/admin/announcements/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const index = list.findIndex((announcement) => announcement.id === req.params.id);

    if (index === -1) {
      return jsonError(res, 404, "Thông báo không tồn tại.");
    }

    const { stores } = await getDataSnapshot();
    const { errors, value } = validateAnnouncementPayload(req.body, stores, {
      existing: list[index],
      createdBy: list[index].createdBy || req.session.username || "ADMIN"
    });

    if (errors) {
      return res.status(400).json({
        error: "Dữ liệu thông báo không hợp lệ.",
        fieldErrors: errors
      });
    }

    const nextList = [...list];
    nextList[index] = value;
    const saved = await saveAnnouncements(nextList);
    return res.json(saved.find((record) => record.id === value.id) || value);
  } catch (err) {
    console.error("Update announcement error:", err);
    return jsonError(res, 500, "Không thể cập nhật thông báo.");
  }
});

app.patch("/api/admin/announcements/:id/pin", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const index = list.findIndex((announcement) => announcement.id === req.params.id);
    if (index === -1) return jsonError(res, 404, "Thông báo không tồn tại.");
    list[index].pinned = !list[index].pinned;
    list[index].updatedAt = new Date().toISOString();
    const saved = await saveAnnouncements(list);
    const item = saved.find((record) => record.id === req.params.id);
    res.json({ ok: true, pinned: item?.pinned || false, item });
  } catch (err) {
    console.error("Toggle announcement pin error:", err);
    return jsonError(res, 500, "Không thể thay đổi ghim thông báo.");
  }
});

app.patch("/api/admin/announcements/:id/toggle", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const index = list.findIndex((announcement) => announcement.id === req.params.id);
    if (index === -1) return jsonError(res, 404, "Thông báo không tồn tại.");
    list[index].active = list[index].active === false ? true : false;
    list[index].updatedAt = new Date().toISOString();
    const saved = await saveAnnouncements(list);
    const item = saved.find((record) => record.id === req.params.id);
    res.json({ ok: true, active: item?.active !== false, item });
  } catch (err) {
    console.error("Toggle announcement status error:", err);
    return jsonError(res, 500, "Không thể thay đổi trạng thái thông báo.");
  }
});

app.delete("/api/admin/announcements/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const list = await loadAnnouncements();
    const id = req.params.id;
    if (!list.some((announcement) => announcement.id === id)) {
      return jsonError(res, 404, "Thông báo không tồn tại.");
    }
    const filtered = list.filter(a => a.id !== id);
    await saveAnnouncements(filtered);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete announcement error:", err);
    return jsonError(res, 500, "Không thể xóa thông báo.");
  }
});

app.use((error, _req, res, _next) => {
  console.error("Unexpected error:", error);
  return jsonError(res, 500, "Có lỗi hệ thống.");
});

app.listen(port, () => {
  console.log(`Sales program app running on http://localhost:${port}`);
});

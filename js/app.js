import {
  deleteArchivePrice,
  deleteArchiveWithdrawal,
  deleteSupply,
  deleteVendor,
  deleteWithdrawal,
  fetchDentalStock,
  insertArchivePrice,
  insertArchiveWithdrawal,
  insertReport,
  insertSupply,
  insertVendor,
  insertWithdrawal,
  insertWithdrawalLog,
  loadProcurementData,
  loginUser,
  updateSupply,
  updateVendor,
} from "./supabaseClient.js";

const KEY = "anwar-khaybar-procurement";
const BACKUP_KEY = "anwar-khaybar-procurement-backup";

const ACCOUNTS = [
  { username: "يوسف الجهني", letter: "ي", color: "#0d6e6e" },
  { username: "احمد الجيزاوي", letter: "أ", color: "#0b2c3d" },
  { username: "الإدارة", letter: "إ", color: "#c9a227" },
  { username: "خدمة العملاء", letter: "خ", color: "#1b8a5a" },
];

const CLINICS = [
  { id: "ahmed", ar: "عيادة دكتور أحمد", en: "Dr. Ahmed clinic", letter: "أ", color: "#0d6e6e" },
  { id: "faten", ar: "عيادة دكتورة فاتن", en: "Dr. Faten clinic", letter: "ف", color: "#0b2c3d" },
  { id: "sara", ar: "عيادة دكتورة سارة", en: "Dr. Sarah clinic", letter: "س", color: "#c9a227" },
];

const I18N = {
  ar: {
    hospitalName: "مستشفى أنوار خيبر",
    sidebarTitle: "متابعة الموردين ومسحوبات عيادات الأسنان",
    loginSubtitle: "متابعة الموردين ومسحوبات العيادات",
    chooseAccount: "اختر الحساب",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    settings: "إعدادات",
    clinicReport: "تقرير العيادة",
    dashboard: "لوحة التحكم",
    hospitalData: "بيانات المستشفى",
    supabaseConnected: "تم الاتصال بقاعدة البيانات",
    supabaseNoTables: "الاتصال ناجح، لكن لم يتم العثور على جداول مطابقة بعد.",
    supabaseError: "تعذر الاتصال بقاعدة البيانات",
    dbSaveError: "تعذر حفظ البيانات في قاعدة البيانات",
    dbLoadError: "تعذر قراءة البيانات من قاعدة البيانات",
    savedReports: "التقارير المحفوظة",
    saveReport: "حفظ التقرير",
    reportSaved: "تم حفظ التقرير",
    withdrawals: "مسحوبات العيادات",
    supplies: "مستلزمات",
    dentalSupplies: "مستلزمات الأسنان",
    emergencySupplies: "مستلزمات الطوارئ",
    warehouse: "المستودع",
    warehouseHint: "كميات مستلزمات الأسنان المتاحة. أي سحب من العيادات يخصم من هذه الكمية.",
    stockQty: "الكمية في المستودع (علب)",
    boxes: "علب",
    saveStock: "حفظ الكمية",
    lowStockTitle: "تنبيه: منتجات على وشك النفاد",
    lowStockItem: "الكمية المتبقية من {name} هي {qty} علب، والمنتج على وشك النفاد.",
    insufficientStock: "الكمية المتاحة في المستودع لا تكفي لهذا السحب.",
    stockRequired: "حدّد الكمية المتاحة في المستودع قبل تسجيل السحب.",
    archive: "أرشيف",
    archiveWithdrawals: "ملفات السحوبات",
    archivePrices: "سجل الأسعار",
    archiveCharts: "الرسوم البيانية",
    searchItems: "ابحث عن صنف...",
    chartByVendor: "تغيّر الأسعار لكل مورد",
    chartCompare: "مقارنة أسعار الموردين",
    back: "رجوع",
    yearFile: "سنة",
    monthFile: "شهر",
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    weeklyReport: "التقرير الأسبوعي",
    monthlyReport: "التقرير الشهري",
    yearlyReport: "التقرير السنوي",
    close: "إغلاق",
    noData: "لا توجد بيانات",
    currency: "ر.س",
    print: "طباعة",
    savePdf: "حفظ PDF",
    loginError: "بيانات الدخول غير صحيحة",
    loginServerError: "تعذر التحقق من كلمة المرور. نفّذ ملف sql/secure_login.sql مرة واحدة في Supabase.",
    medicalSupplies: "مستلزمات الأسنان",
    vendors: "الموردون",
    addItem: "إضافة صنف",
    saveItem: "حفظ الصنف",
    itemName: "اسم الصنف",
    unitSize: "الحجم أو الوحدة",
    itemType: "النوع",
    vendor: "المورد",
    price: "السعر",
    bestPrices: "أفضل الأسعار",
    bestVendor: "أفضل مورد",
    lastUpdate: "تاريخ آخر تحديث",
    addVendor: "إضافة مورد",
    saveVendor: "حفظ المورد",
    vendorName: "اسم المورد",
    contactPerson: "الشخص المسؤول",
    phone: "رقم الجوال",
    email: "البريد الإلكتروني",
    emailOptional: "البريد الإلكتروني (اختياري)",
    confirmDeleteVendor: "هل تريد حذف هذا المورد؟",
    confirmDeleteItem: "هل تريد حذف هذا المنتج؟",
    confirmDeleteWithdrawal: "هل تريد حذف هذا المسحوب؟",
    confirmDeleteArchive: "هل تريد حذف هذا السجل من أرشيف السحوبات؟",
    confirmDeleteArchiveFile: "هل تريد حذف كل سجلات هذا الملف من الأرشيف؟",
    confirmDeletePrice: "هل تريد حذف هذا السجل من سجل الأسعار؟",
    deleteVendor: "حذف",
    vendorNotes: "ملاحظات",
    selectVendor: "اختر المورد",
    priceDiffs: "فروق الأسعار",
    sharedItems: "مقارنة الأصناف لدى أكثر من مورد",
    cheapest: "الأرخص",
    updatePrice: "تحديث السعر",
    edit: "تعديل",
    savePrice: "حفظ السعر",
    none: "لا يوجد",
    noSharedItems: "لا توجد أصناف مشتركة بين أكثر من مورد بعد.",
    date: "التاريخ",
    quantity: "الكمية",
    requester: "الطالب",
    addWithdrawal: "إضافة مسحوب",
    selectProduct: "اختر المنتج",
    clinicTotals: "إجمالي كل العيادات",
    clinic: "العيادة",
    lines: "عدد المسحوبات",
    amount: "الإجمالي",
    reportTitle: "تقرير",
    reportWeekly: "أسبوعي",
    reportMonthly: "شهري",
    reportYearly: "سنوي",
    clinicTotal: "إجمالي العيادة",
    grandTotal: "الإجمالي النهائي",
    productsCount: "عدد الأصناف",
    vendorsCount: "عدد الموردين",
    withdrawalsCount: "عدد المسحوبات",
    withdrawalsAmount: "إجمالي المسحوبات",
    lineTotal: "الإجمالي",
    unitPrice: "سعر الوحدة",
  },
  en: {
    hospitalName: "Anwar Khaybar Hospital",
    sidebarTitle: "Suppliers and dental clinic withdrawals",
    loginSubtitle: "Suppliers and clinic withdrawals tracking",
    chooseAccount: "Choose an account",
    username: "Username",
    password: "Password",
    login: "Sign in",
    logout: "Log out",
    settings: "Settings",
    clinicReport: "Clinic report",
    dashboard: "Dashboard",
    hospitalData: "Hospital data",
    supabaseConnected: "Connected to the database",
    supabaseNoTables: "Connected, but no matching tables were found yet.",
    supabaseError: "Could not connect to the database",
    dbSaveError: "Could not save data to the database",
    dbLoadError: "Could not read data from the database",
    savedReports: "Saved reports",
    saveReport: "Save report",
    reportSaved: "Report saved",
    withdrawals: "Clinic withdrawals",
    supplies: "Supplies",
    dentalSupplies: "Dental supplies",
    emergencySupplies: "Emergency supplies",
    warehouse: "Warehouse",
    warehouseHint: "Available dental supply quantities. Clinic withdrawals are deducted from this stock.",
    stockQty: "Warehouse quantity (boxes)",
    boxes: "boxes",
    saveStock: "Save quantity",
    lowStockTitle: "Alert: items are running low",
    lowStockItem: "{name} has {qty} boxes left and is about to run out.",
    insufficientStock: "The warehouse does not have enough of this item for the withdrawal.",
    stockRequired: "Set the available warehouse quantity before recording a withdrawal.",
    archive: "Archive",
    archiveWithdrawals: "Withdrawal files",
    archivePrices: "Price history",
    archiveCharts: "Charts",
    searchItems: "Search items...",
    chartByVendor: "Price changes per supplier",
    chartCompare: "Supplier price comparison",
    back: "Back",
    yearFile: "Year",
    monthFile: "Month",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weeklyReport: "Weekly report",
    monthlyReport: "Monthly report",
    yearlyReport: "Yearly report",
    close: "Close",
    noData: "No data",
    currency: "SAR",
    print: "Print",
    savePdf: "Save PDF",
    loginError: "Invalid login details",
    loginServerError: "Could not verify the password. Run sql/secure_login.sql once in Supabase.",
    medicalSupplies: "Dental supplies",
    vendors: "Suppliers",
    addItem: "Add item",
    saveItem: "Save item",
    itemName: "Item name",
    unitSize: "Size / unit",
    itemType: "Type",
    vendor: "Supplier",
    price: "Price",
    bestPrices: "Best prices",
    bestVendor: "Best supplier",
    lastUpdate: "Last update",
    addVendor: "Add supplier",
    saveVendor: "Save supplier",
    vendorName: "Supplier name",
    contactPerson: "Contact person",
    phone: "Mobile",
    email: "Email",
    emailOptional: "Email (optional)",
    confirmDeleteVendor: "Delete this supplier?",
    confirmDeleteItem: "Delete this product?",
    confirmDeleteWithdrawal: "Delete this withdrawal?",
    confirmDeleteArchive: "Delete this record from the withdrawal archive?",
    confirmDeleteArchiveFile: "Delete every record in this archive file?",
    confirmDeletePrice: "Delete this record from the price log?",
    deleteVendor: "Delete",
    vendorNotes: "Notes",
    selectVendor: "Select supplier",
    priceDiffs: "Price differences",
    sharedItems: "Compare items offered by more than one supplier",
    cheapest: "Cheapest",
    updatePrice: "Update price",
    edit: "Edit",
    savePrice: "Save price",
    none: "None",
    noSharedItems: "No items are offered by more than one supplier yet.",
    date: "Date",
    quantity: "Quantity",
    requester: "Requester",
    addWithdrawal: "Add withdrawal",
    selectProduct: "Select product",
    clinicTotals: "All clinics total",
    clinic: "Clinic",
    lines: "Withdrawals count",
    amount: "Total",
    reportTitle: "Report",
    reportWeekly: "Weekly",
    reportMonthly: "Monthly",
    reportYearly: "Yearly",
    clinicTotal: "Clinic total",
    grandTotal: "Final total",
    productsCount: "Items count",
    vendorsCount: "Suppliers count",
    withdrawalsCount: "Withdrawals count",
    withdrawalsAmount: "Withdrawals total",
    lineTotal: "Line total",
    unitPrice: "Unit price",
  },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

function clinicName(id) {
  const c = CLINICS.find((x) => x.id === id);
  if (!c) return id;
  return state.lang === "ar" ? c.ar : c.en;
}

function seed() {
  return {
    session: null,
    lang: "ar",
    suppliers: [],
    supplyItems: [],
    withdrawals: [],
    reports: [],
    withdrawalArchive: [],
    priceHistory: [],
  };
}

function defaultCatalog() {
  const t = todayISO();
  return [
   
  ];
}

function defaultWithdrawals() {
  const t = todayISO();
  return [
    
  ];
}

function itemsFromPriceHistory(history) {
  const byId = new Map();
  (history || [])
    .slice()
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .forEach((p) => {
      const id = p.itemId || p.id || uid("si");
      byId.set(id, {
        id,
        category: "medical",
        itemName: p.itemName || "",
        unit: p.unit || "",
        type: p.type || "",
        supplierId: p.supplierId || "",
        price: Number(p.price) || 0,
        updatedAt: p.date || todayISO(),
      });
    });
  return [...byId.values()].filter((item) => item.itemName);
}

function readBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeBackup(data) {
  if (!data) return;
  const prev = readBackup() || {};
  const snapshot = {
    supplyItems: data.supplyItems?.length ? data.supplyItems : prev.supplyItems || [],
    withdrawals: data.withdrawals?.length ? data.withdrawals : prev.withdrawals || [],
    withdrawalArchive: data.withdrawalArchive?.length ? data.withdrawalArchive : prev.withdrawalArchive || [],
    priceHistory: data.priceHistory?.length ? data.priceHistory : prev.priceHistory || [],
    suppliers: data.suppliers?.length ? data.suppliers : prev.suppliers || [],
  };
  localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
}

function vendorsFromItems(items, current) {
  const list = (current || []).slice();
  const ids = new Set(list.map((s) => String(s.id)));
  const names = new Set(list.map((s) => (s.name || "").trim().toLowerCase()).filter(Boolean));
  (items || []).forEach((item) => {
    const name = (item.supplierName || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (names.has(key)) return;
    names.add(key);
    const id = item.supplierId && !ids.has(String(item.supplierId)) ? item.supplierId : uid("s");
    ids.add(String(id));
    list.push({ id, name, contact: "", phone: "", email: "", notes: "" });
  });
  return list;
}

function restoreSuppliers(data) {
  if (!Array.isArray(data.suppliers)) data.suppliers = [];
  if (!data.suppliers.length) {
    const backup = readBackup() || {};
    if (Array.isArray(backup.suppliers) && backup.suppliers.length) data.suppliers = backup.suppliers;
  }
  data.suppliers = vendorsFromItems(data.supplyItems, data.suppliers);
  return data;
}

function recoverMissing(data) {
  if (data.initialized) return data;
  const backup = readBackup() || {};
  if (!data.suppliers.length && Array.isArray(backup.suppliers) && backup.suppliers.length) {
    data.suppliers = backup.suppliers;
  }
  if (!data.priceHistory.length && Array.isArray(backup.priceHistory) && backup.priceHistory.length) {
    data.priceHistory = backup.priceHistory;
  }
  if (!data.supplyItems.length) {
    if (Array.isArray(backup.supplyItems) && backup.supplyItems.length) data.supplyItems = backup.supplyItems;
    else {
      const fromHistory = itemsFromPriceHistory(data.priceHistory);
      data.supplyItems = fromHistory.length ? fromHistory : defaultCatalog();
    }
  }
  if (!data.withdrawals.length) {
    if (Array.isArray(backup.withdrawals) && backup.withdrawals.length) data.withdrawals = backup.withdrawals;
    else if (Array.isArray(data.withdrawalArchive) && data.withdrawalArchive.length) data.withdrawals = data.withdrawalArchive.slice();
    else if (Array.isArray(backup.withdrawalArchive) && backup.withdrawalArchive.length) data.withdrawals = backup.withdrawalArchive.slice();
    else data.withdrawals = defaultWithdrawals();
  }
  if (!data.withdrawalArchive.length) data.withdrawalArchive = data.withdrawals.slice();
  if (!data.priceHistory.length && data.supplyItems.length) {
    data.priceHistory = data.supplyItems.map((item) => ({
      id: uid("ph"),
      itemId: item.id,
      itemName: item.itemName,
      type: item.type,
      unit: item.unit,
      supplierId: item.supplierId,
      price: itemPrice(item),
      date: item.updatedAt || todayISO(),
    }));
  }
  data.initialized = true;
  return data;
}

function load() {
  const raw = localStorage.getItem(KEY);
  const data = raw ? JSON.parse(raw) : seed();
  if (!data.lang || !I18N[data.lang]) data.lang = "ar";
  if (!Array.isArray(data.suppliers)) data.suppliers = [];
  const demoVendors = ["شركة النور الطبية", "مؤسسة الحياة للمستلزمات", "إمداد الطوارئ"];
  data.suppliers = data.suppliers.filter((s) => !demoVendors.includes(s.name) && !["s1", "s2", "s3"].includes(s.id));
  if (!Array.isArray(data.supplyItems)) data.supplyItems = [];
  if (!Array.isArray(data.withdrawals)) data.withdrawals = [];
  if (!Array.isArray(data.reports)) data.reports = [];
  data.supplyItems.forEach((item) => {
    if (item.price == null && item.bestPrice != null) item.price = item.bestPrice;
  });
  if (!Array.isArray(data.withdrawalArchive)) data.withdrawalArchive = [];
  if (!Array.isArray(data.priceHistory)) data.priceHistory = [];
  if (!Array.isArray(data.deletedWithdrawalIds)) data.deletedWithdrawalIds = [];
  if (!Array.isArray(data.deletedSupplyIds)) data.deletedSupplyIds = [];
  if (!Array.isArray(data.deletedArchiveWithdrawalIds)) data.deletedArchiveWithdrawalIds = [];
  if (!Array.isArray(data.deletedArchivePriceIds)) data.deletedArchivePriceIds = [];
  if (!Array.isArray(data.deletedArchivePriceKeys)) data.deletedArchivePriceKeys = [];
  recoverMissing(data);
  restoreSuppliers(data);
  save(data);
  return data;
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  writeBackup(data);
}

let state = load();

function t(key) {
  return (I18N[state.lang] || I18N.ar)[key] || key;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.getElementById("lang-btn").textContent = state.lang === "ar" ? "English" : "العربية";
  document.getElementById("login-lang-btn").textContent = state.lang === "ar" ? "English" : "العربية";
  document.title = t("hospitalName");
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  renderLoginIcons();
}

function renderLoginIcons() {
  const selected = document.getElementById("login-user").value;
  document.getElementById("user-icons").innerHTML = ACCOUNTS.map(
    (u) => `<button class="user-tile ${u.username === selected ? "selected" : ""}" type="button" data-user="${u.username}">
      <span class="icon" style="background:${u.color}">${u.letter}</span>
      <small>${u.username}</small>
    </button>`
  ).join("");
}

function selectLoginUser(username) {
  document.getElementById("login-user").value = username;
  document.getElementById("selected-user-label").textContent = username;
  document.getElementById("login-pass-box").hidden = false;
  document.getElementById("login-pass").value = "";
  document.getElementById("login-pass").focus();
  renderLoginIcons();
}

function showApp(loggedIn) {
  document.getElementById("login-screen").style.display = loggedIn ? "none" : "grid";
  document.getElementById("app").classList.toggle("visible", loggedIn);
}

function supplierById(id) {
  return state.suppliers.find((s) => s.id === id);
}

function table(headers, rows) {
  if (!rows.length) return `<p class="empty">${t("noData")}</p>`;
  return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

function itemNameKey(name) {
  return (name || "").trim().toLowerCase();
}

function itemPrice(item) {
  return Number(item.price != null ? item.price : item.bestPrice) || 0;
}

function isEmergency(item) {
  return item?.category === "emergency";
}

function isDental(item) {
  return Boolean(item) && !isEmergency(item);
}

function trackedStock(item) {
  if (!item || item.stock == null || item.stock === "") return null;
  const value = Number(item.stock);
  return Number.isFinite(value) ? value : null;
}

function lowStockItems() {
  return state.supplyItems.filter((item) => {
    if (!isDental(item)) return false;
    const stock = trackedStock(item);
    return stock != null && stock < 6;
  });
}

function bestOffer(name, item) {
  const pool = item && isEmergency(item) ? state.supplyItems.filter(isEmergency) : state.supplyItems.filter(isDental);
  const same = pool.filter((i) => itemNameKey(i.itemName) === itemNameKey(name));
  if (!same.length) return null;
  return same.reduce((a, b) => (itemPrice(a) <= itemPrice(b) ? a : b));
}

function allProducts() {
  return state.supplyItems.slice().sort((a, b) => a.itemName.localeCompare(b.itemName, "ar"));
}

function productOptions() {
  return `<option value="">${t("selectProduct")}</option>` + allProducts()
    .map((p) => {
      const stock = isDental(p) ? trackedStock(p) : null;
      const note = isDental(p) ? ` — ${stock == null ? "—" : stock} ${t("boxes")}` : ` — ${t("emergencySupplies")}`;
      return `<option value="${p.id}">${p.itemName}${note}</option>`;
    })
    .join("");
}

function fillSelects() {
  const sOpts = `<option value="">${t("selectVendor")}</option>` + state.suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  document.querySelectorAll(".supplier-select").forEach((sel) => {
    const current = sel.value;
    sel.innerHTML = sOpts;
    if (current) sel.value = current;
  });
  document.querySelectorAll(".product-select").forEach((sel) => {
    const current = sel.value;
    sel.innerHTML = productOptions();
    if (current) sel.value = current;
  });
}

function persist() {
  save(state);
  renderAll();
}

function notifyDbError(message) {
  alert(`${t("dbSaveError")}${message ? `: ${message}` : ""}`);
}

function stockErrorMessage(error) {
  const msg = String(error || "");
  if (/insufficient_stock/i.test(msg)) return t("insufficientStock");
  if (/stock_required/i.test(msg)) return t("stockRequired");
  return "";
}

function sameRecord(left, right) {
  const ids = [left?.id, left?.sourceId].filter((value) => value != null && value !== "").map(String);
  return ids.some((id) => id === String(right?.id || "") || id === String(right?.sourceId || ""));
}

function priceArchiveKey(row) {
  return [
    String(row.itemId || ""),
    String(row.itemName || "").trim().toLowerCase(),
    String(row.supplierId || ""),
    Number(row.price) || 0,
    row.date || "",
  ].join("|");
}

function priceEntryFromItem(item) {
  return {
    itemId: item.id,
    itemName: item.itemName,
    type: item.type,
    unit: item.unit,
    supplierId: item.supplierId,
    supplierName: supplierById(item.supplierId)?.name || item.supplierName || "",
    price: itemPrice(item),
    date: item.updatedAt || todayISO(),
  };
}

async function logPrice(item) {
  if (!Array.isArray(state.priceHistory)) state.priceHistory = [];
  const entry = priceEntryFromItem(item);
  const saved = await insertArchivePrice(entry);
  if (saved.error || !saved.row) {
    notifyDbError(saved.error);
    return;
  }
  state.priceHistory.unshift(saved.row);
}

async function syncAllProductsToPriceArchive() {
  if (!Array.isArray(state.priceHistory)) state.priceHistory = [];
  const keys = new Set((state.priceHistory || []).map(priceArchiveKey));
  for (const item of state.supplyItems || []) {
    const entry = priceEntryFromItem(item);
    if (keys.has(priceArchiveKey(entry))) continue;
    if ((state.deletedArchivePriceKeys || []).includes(priceArchiveKey(entry))) continue;
    const saved = await insertArchivePrice(entry);
    if (saved.error || !saved.row) {
      notifyDbError(saved.error);
      continue;
    }
    state.priceHistory.unshift(saved.row);
    keys.add(priceArchiveKey(entry));
    keys.add(priceArchiveKey(saved.row));
  }
}

function chartHistory() {
  const history = (state.priceHistory || []).slice();
  (state.supplyItems || []).forEach((item) => {
    const date = item.updatedAt || todayISO();
    const price = itemPrice(item);
    const exists = history.some(
      (p) =>
        String(p.itemId || "") === String(item.id) &&
        Number(p.price) === price &&
        (p.date || "") === date
    );
    if (exists) return;
    history.push({
      id: "live-" + item.id,
      itemId: item.id,
      itemName: item.itemName,
      type: item.type,
      unit: item.unit,
      supplierId: item.supplierId,
      supplierName: supplierById(item.supplierId)?.name || item.supplierName || "",
      price,
      date,
    });
  });
  return history;
}

function chartVendors() {
  const list = (state.suppliers || []).slice();
  const ids = new Set(list.map((s) => String(s.id)));
  chartHistory().forEach((p) => {
    if (!p.supplierId || ids.has(String(p.supplierId))) return;
    ids.add(String(p.supplierId));
    list.push({ id: p.supplierId, name: p.supplierName || p.supplierId });
  });
  return list;
}

function chartsTabVisible() {
  return (
    document.getElementById("app")?.classList.contains("visible") &&
    document.getElementById("page-archive")?.classList.contains("active") &&
    document.getElementById("archive-charts")?.classList.contains("active")
  );
}

async function archiveWithdrawal(row) {
  if (!Array.isArray(state.withdrawalArchive)) state.withdrawalArchive = [];
  const saved = await insertArchiveWithdrawal({ ...row, sourceId: row.id });
  if (saved.error || !saved.row) {
    notifyDbError(saved.error);
    return;
  }
  state.withdrawalArchive.unshift(saved.row);
}

function monthLabel(monthNum) {
  return (I18N[state.lang].months || I18N.ar.months)[monthNum - 1] || monthNum;
}

let archiveYear = null;
let archiveMonth = null;
let vendorChart;
let compareChart;

function supplyRows(items, includeStock) {
  return items.map((item) => {
    const best = bestOffer(item.itemName, item);
    const isBest = best && best.id === item.id;
    const stock = trackedStock(item);
    const stockCell = includeStock ? `<td class="${stock != null && stock < 6 ? "stock-low" : ""}">${stock == null ? "—" : stock + " " + t("boxes")}</td>` : "";
    return `<tr>
      <td>${item.itemName}</td>
      <td>${item.unit}</td>
      <td>${item.type}</td>
      <td>${supplierById(item.supplierId)?.name || ""}</td>
      <td>${itemPrice(item)} ${t("currency")}${isBest ? ` <span class="badge badge-best">${t("cheapest")}</span>` : ""}</td>
      <td>${best ? itemPrice(best) + " " + t("currency") : ""}</td>
      <td>${best ? supplierById(best.supplierId)?.name || "" : ""}</td>
      ${stockCell}
      <td>${item.updatedAt || ""}</td>
      <td>
        <button class="btn btn-sm btn-navy" type="button" data-edit-item="${item.id}">${t("edit")}</button>
        <button class="btn btn-sm btn-danger" type="button" data-del-item="${item.id}">${t("deleteVendor")}</button>
      </td>
    </tr>`;
  });
}

function supplyItemHeaders(includeStock) {
  const headers = [t("itemName"), t("unitSize"), t("itemType"), t("vendor"), t("price"), t("bestPrices"), t("bestVendor")];
  if (includeStock) headers.push(t("stockQty"));
  headers.push(t("lastUpdate"), "");
  return headers;
}

function renderSupplyCategory() {
  const dentalTable = document.getElementById("table-dental");
  const emergencyTable = document.getElementById("table-emergency");
  if (dentalTable) dentalTable.innerHTML = table(supplyItemHeaders(true), supplyRows(state.supplyItems.filter(isDental), true));
  if (emergencyTable) emergencyTable.innerHTML = table(supplyItemHeaders(false), supplyRows(state.supplyItems.filter(isEmergency), false));
}

function renderStockAlerts() {
  const box = document.getElementById("stock-alerts");
  if (!box) return;
  const low = lowStockItems();
  if (!low.length) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  box.hidden = false;
  box.innerHTML = `<div class="stock-alert"><strong>${t("lowStockTitle")}</strong><ul>${low
    .map((item) => `<li>${t("lowStockItem").replace("{name}", item.itemName).replace("{qty}", trackedStock(item))}</li>`)
    .join("")}</ul></div>`;
}

function renderWarehouse() {
  const box = document.getElementById("warehouse-table");
  if (!box) return;
  const items = state.supplyItems.filter(isDental);
  const rows = items.map((item) => {
    const stock = trackedStock(item);
    return `<tr>
      <td>${item.itemName}</td>
      <td>${item.unit}</td>
      <td>${item.type}</td>
      <td class="${stock != null && stock < 6 ? "stock-low" : ""}">${stock == null ? "—" : stock + " " + t("boxes")}</td>
      <td>
        <input data-stock-input="${item.id}" type="number" min="0" step="1" value="${stock == null ? "" : stock}" style="max-width:110px" />
      </td>
      <td><button class="btn btn-sm btn-primary" type="button" data-save-stock="${item.id}">${t("saveStock")}</button></td>
    </tr>`;
  });
  box.innerHTML = `<h3>${t("warehouse")}</h3>${table([t("itemName"), t("unitSize"), t("itemType"), t("stockQty"), t("saveStock"), ""], rows)}`;
}

function renderPriceDiffs() {
  const groups = {};
  state.supplyItems.filter(isDental).forEach((item) => {
    const key = itemNameKey(item.itemName);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  const shared = Object.values(groups).filter((list) => new Set(list.map((i) => i.supplierId)).size > 1);
  let html = `<div class="card table-wrap"><h3>${t("sharedItems")}</h3>`;
  if (!shared.length) {
    html += `<p class="empty">${t("noSharedItems")}</p></div>`;
  } else {
    html += shared
      .map((list) => {
        const name = list[0].itemName;
        const min = Math.min(...list.map(itemPrice));
        const rows = list
          .slice()
          .sort((a, b) => itemPrice(a) - itemPrice(b))
          .map((item) => {
            const cheap = itemPrice(item) === min;
            return `<tr>
              <td>${supplierById(item.supplierId)?.name || ""}</td>
              <td>${item.unit}</td>
              <td>${itemPrice(item)} ${t("currency")} ${cheap ? `<span class="badge badge-best">${t("cheapest")}</span>` : ""}</td>
              <td>${item.updatedAt || ""}</td>
              <td>
                <button class="btn btn-sm btn-navy" type="button" data-edit-item="${item.id}">${t("edit")}</button>
                <button class="btn btn-sm btn-danger" type="button" data-del-item="${item.id}">${t("deleteVendor")}</button>
              </td>
            </tr>`;
          });
        return `<h4>${name}</h4>${table([t("vendor"), t("unitSize"), t("price"), t("lastUpdate"), ""], rows)}`;
      })
      .join("");
    html += "</div>";
  }
  html += state.suppliers
    .map((s) => {
      const items = state.supplyItems.filter((i) => isDental(i) && i.supplierId === s.id);
      const rows = items.map((item) => {
        const best = bestOffer(item.itemName, item);
        return `<tr>
          <td>${item.itemName}</td>
          <td>${itemPrice(item)} ${t("currency")}</td>
          <td>${best ? supplierById(best.supplierId)?.name || "" : ""} — ${best ? itemPrice(best) + " " + t("currency") : ""}</td>
          <td>
            <button class="btn btn-sm btn-navy" type="button" data-edit-item="${item.id}">${t("edit")}</button>
            <button class="btn btn-sm btn-danger" type="button" data-del-item="${item.id}">${t("deleteVendor")}</button>
          </td>
        </tr>`;
      });
      return `<div class="card table-wrap vendor-block"><h3>${s.name}</h3>${table([t("itemName"), t("price"), t("bestVendor"), ""], rows)}</div>`;
    })
    .join("");
  document.getElementById("price-diffs").innerHTML = html;
}

function renderSupplies() {
  renderSupplyCategory();
  renderWarehouse();
  renderStockAlerts();
  document.getElementById("table-vendors").innerHTML = table(
    [t("vendorName"), t("contactPerson"), t("phone"), t("email"), t("vendorNotes"), ""],
    state.suppliers.map(
      (s) => `<tr>
        <td>${s.name}</td>
        <td>${s.contact}</td>
        <td>${s.phone}</td>
        <td>${s.email || t("none")}</td>
        <td>${s.notes || t("none")}</td>
        <td>
          <button class="btn btn-sm btn-navy" type="button" data-edit-vendor="${s.id}">${t("edit")}</button>
          <button class="btn btn-sm btn-danger" type="button" data-del-vendor="${s.id}">${t("deleteVendor")}</button>
        </td>
      </tr>`
    )
  );
  renderPriceDiffs();
}

function withdrawalRows(list) {
  return list.map(
    (w) => `<tr>
      <td>${w.productName}</td>
      <td>${w.date}</td>
      <td>${w.quantity}</td>
      <td>${w.requester}</td>
      <td>${Number(w.unitPrice)} ${t("currency")}</td>
      <td>${Number(w.quantity) * Number(w.unitPrice)} ${t("currency")}</td>
      <td><button class="btn btn-sm btn-danger" type="button" data-del-withdraw="${w.id}" data-del-clinic="${w.clinicId}">${t("deleteVendor")}</button></td>
    </tr>`
  );
}

function renderWithdrawals() {
  const nav = document.getElementById("clinic-subnav");
  const pages = document.getElementById("clinic-pages");
  const active = document.querySelector("#clinic-subnav .subnav-btn.active")?.dataset.clinic || "ahmed";
  nav.innerHTML =
    CLINICS.map(
      (c) => `<button class="subnav-btn ${c.id === active ? "active" : ""}" type="button" data-clinic="${c.id}">${clinicName(c.id)}</button>`
    ).join("") +
    `<button class="subnav-btn ${active === "totals" ? "active" : ""}" type="button" data-clinic="totals">${t("clinicTotals")}</button>`;

  pages.innerHTML =
    CLINICS.map((c) => {
      const list = state.withdrawals.filter((w) => w.clinicId === c.id);
      const sum = list.reduce((s, w) => s + Number(w.quantity) * Number(w.unitPrice), 0);
      return `<div class="subpage ${c.id === active ? "active" : ""}" id="clinic-${c.id}">
        <div class="card">
          <h3>${t("addWithdrawal")}</h3>
          <form class="form-grid" data-withdraw-form="${c.id}">
            <div><label>${t("itemName")}</label><select name="productName" class="product-select" required></select></div>
            <div><label>${t("date")}</label><input name="date" type="date" value="${todayISO()}" required /></div>
            <div><label>${t("quantity")}</label><input name="quantity" type="number" min="1" step="1" required /></div>
            <div><label>${t("requester")}</label><input name="requester" required /></div>
            <div class="full"><button class="btn btn-primary" type="submit">${t("addWithdrawal")}</button></div>
          </form>
        </div>
        <div class="card table-wrap">
          <h3>${clinicName(c.id)} — ${sum} ${t("currency")}</h3>
          ${table([t("itemName"), t("date"), t("quantity"), t("requester"), t("unitPrice"), t("lineTotal"), ""], withdrawalRows(list))}
        </div>
      </div>`;
    }).join("") +
    `<div class="subpage ${active === "totals" ? "active" : ""}" id="clinic-totals">
      <div class="card table-wrap">
        <h3>${t("clinicTotals")}</h3>
        ${table(
          [t("clinic"), t("lines"), t("amount")],
          CLINICS.map((c) => {
            const list = state.withdrawals.filter((w) => w.clinicId === c.id);
            const sum = list.reduce((s, w) => s + Number(w.quantity) * Number(w.unitPrice), 0);
            return `<tr><td>${clinicName(c.id)}</td><td>${list.length}</td><td>${sum} ${t("currency")}</td></tr>`;
          }).concat([
            `<tr><td><strong>${t("amount")}</strong></td><td><strong>${state.withdrawals.length}</strong></td><td><strong>${state.withdrawals.reduce((s, w) => s + Number(w.quantity) * Number(w.unitPrice), 0)} ${t("currency")}</strong></td></tr>`,
          ])
        )}
      </div>
      <div class="card table-wrap">
        ${table(
          [t("clinic"), t("itemName"), t("date"), t("quantity"), t("requester"), t("unitPrice"), t("lineTotal"), ""],
          state.withdrawals.map(
            (w) => `<tr>
              <td>${clinicName(w.clinicId)}</td>
              <td>${w.productName}</td>
              <td>${w.date}</td>
              <td>${w.quantity}</td>
              <td>${w.requester}</td>
              <td>${Number(w.unitPrice)} ${t("currency")}</td>
              <td>${Number(w.quantity) * Number(w.unitPrice)} ${t("currency")}</td>
              <td><button class="btn btn-sm btn-danger" type="button" data-del-withdraw="${w.id}" data-del-clinic="${w.clinicId}">${t("deleteVendor")}</button></td>
            </tr>`
          )
        )}
      </div>
    </div>`;

  fillSelects();
  bindWithdrawForms();
}

async function adjustDentalStock(product, delta) {
  if (!product || !isDental(product)) return { ok: true };
  const current = trackedStock(product);
  if (current == null) return { ok: false, error: t("stockRequired") };
  const next = current + delta;
  if (next < 0) return { ok: false, error: t("insufficientStock") };
  const previous = product.stock;
  product.stock = next;
  const result = await updateSupply(product, state.suppliers);
  if (result.error || !result.row) {
    product.stock = previous;
    return { ok: false, error: result.error || t("dbSaveError") };
  }
  Object.assign(product, result.row);
  if (product.stock == null) product.stock = next;
  return { ok: true };
}

function bindWithdrawForms() {
  document.querySelectorAll("[data-withdraw-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const productId = data.get("productName");
      const product = state.supplyItems.find((p) => p.id === productId);
      const row = {
        clinicId: form.dataset.withdrawForm,
        productId: product ? product.id : "",
        productName: product ? product.itemName : "",
        date: data.get("date"),
        quantity: Number(data.get("quantity")),
        requester: data.get("requester").trim(),
        unitPrice: product ? itemPrice(product) : 0,
      };
      if (product && isDental(product)) {
        const available = trackedStock(product);
        if (available == null) {
          alert(t("stockRequired"));
          return;
        }
        if (available < row.quantity) {
          alert(t("insufficientStock"));
          return;
        }
      }
      let result = await insertWithdrawalLog({
        ...row,
        affectsStock: Boolean(product && isDental(product)),
      });
      if (result.missing) {
        if (product && isDental(product)) {
          const stockResult = await adjustDentalStock(product, -row.quantity);
          if (!stockResult.ok) {
            alert(stockResult.error);
            return;
          }
        }
        result = await insertWithdrawal(row);
        if (result.error) {
          if (product && isDental(product)) await adjustDentalStock(product, row.quantity);
          notifyDbError(result.error);
          return;
        }
      } else if (result.error) {
        const friendly = stockErrorMessage(result.error);
        if (friendly) alert(friendly);
        else notifyDbError(result.error);
        return;
      } else if (product && isDental(product)) {
        product.stock = result.stock == null ? trackedStock(product) - row.quantity : Number(result.stock);
      }
      state.withdrawals.unshift(result.row);
      await archiveWithdrawal(result.row);
      form.reset();
      persist();
    });
  });
}

function inRange(dateStr, days) {
  const d = new Date(dateStr);
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return d >= from && d <= now;
}

function reportRows(kind) {
  const days = kind === "weekly" ? 7 : kind === "yearly" ? 365 : 30;
  const list = state.withdrawals.filter((w) => inRange(w.date, days));
  return { days, list };
}

function reportLabel(kind) {
  if (kind === "weekly") return t("reportWeekly");
  if (kind === "yearly") return t("reportYearly");
  return t("reportMonthly");
}

function showClinicReports(kind) {
  document.querySelectorAll("[data-report]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.report === kind);
  });
  const listEl = document.getElementById("clinic-report-list");
  listEl.hidden = false;
  listEl.innerHTML = CLINICS.map(
    (c) => `<button class="clinic-report-btn" type="button" data-report-kind="${kind}" data-report-clinic="${c.id}">
      <span class="icon" style="background:${c.color}">${c.letter}</span>
      <span>${t("clinicReport")} — ${clinicName(c.id)}</span>
    </button>`
  ).join("");
}

function showReport(kind, clinicId) {
  const label = reportLabel(kind);
  const { list } = reportRows(kind);
  const items = list.filter((w) => w.clinicId === clinicId);
  const clinic = CLINICS.find((c) => c.id === clinicId);
  const sum = items.reduce((s, w) => s + Number(w.quantity) * Number(w.unitPrice), 0);
  const rows = items.map(
    (w) => `<tr>
      <td>${w.productName}</td>
      <td>${w.date}</td>
      <td>${w.quantity}</td>
      <td>${w.requester}</td>
      <td>${Number(w.quantity) * Number(w.unitPrice)} ${t("currency")}</td>
    </tr>`
  );
  const title = `${t("reportTitle")} ${label} — ${clinicName(clinicId)}`;
  const payload = {
    title,
    reportType: kind,
    clinicId,
    total: sum,
    items: items.map((w) => ({
      productName: w.productName,
      date: w.date,
      quantity: w.quantity,
      requester: w.requester,
      amount: Number(w.quantity) * Number(w.unitPrice),
    })),
  };
  openModal(`
    <h2>${title}</h2>
    <div class="toolbar">
      <button class="btn btn-primary" type="button" id="report-save">${t("saveReport")}</button>
      <button class="btn btn-navy" type="button" id="report-print">${t("print")}</button>
      <button class="btn btn-primary" type="button" id="report-pdf">${t("savePdf")}</button>
    </div>
    <div id="report-print-area">
      <h3>${clinic ? clinicName(clinic.id) : ""}</h3>
      ${table([t("itemName"), t("date"), t("quantity"), t("requester"), t("amount")], rows)}
      <p><strong>${t("clinicTotal")}:</strong> ${sum} ${t("currency")}</p>
    </div>
  `);
  document.getElementById("report-print").onclick = () => printHtml(document.getElementById("report-print-area").innerHTML, title);
  document.getElementById("report-pdf").onclick = () => exportReportPdf(kind, title);
  document.getElementById("report-save").onclick = async () => {
    const btn = document.getElementById("report-save");
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    const saved = await insertReport(payload);
    if (saved.error || !saved.row) {
      btn.disabled = false;
      notifyDbError(saved.error);
      return;
    }
    state.reports.unshift(saved.row);
    save(state);
    btn.textContent = t("reportSaved");
  };
}

function printHtml(inner, title) {
  const dir = state.lang === "ar" ? "rtl" : "ltr";
  const w = window.open("", "_blank", "width=900,height=900");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html lang="${state.lang}" dir="${dir}"><head><meta charset="UTF-8" /><title>${title}</title>
    <style>body{font-family:"Segoe UI",Tahoma,sans-serif;padding:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:start}</style>
    </head><body><h1>${title}</h1>${inner}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

function exportReportPdf(kind, label) {
  const area = document.getElementById("report-print-area");
  const title = `${t("reportTitle")} ${label}`;
  if (window.html2pdf) {
    window.html2pdf()
      .set({
        margin: 10,
        filename: `report-${kind}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(area)
      .save();
    return;
  }
  printHtml(area.innerHTML, title);
}

function openModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function openEditVendor(id) {
  const s = supplierById(id);
  if (!s) return;
  openModal(`
    <h2>${t("edit")} — ${s.name}</h2>
    <form class="form-grid" id="edit-vendor-form">
      <input type="hidden" id="edit-vendor-id" value="${s.id}" />
      <div><label>${t("vendorName")}</label><input id="ev-name" value="${escapeAttr(s.name)}" required /></div>
      <div><label>${t("contactPerson")}</label><input id="ev-contact" value="${escapeAttr(s.contact)}" required /></div>
      <div><label>${t("phone")}</label><input id="ev-phone" value="${escapeAttr(s.phone)}" required /></div>
      <div><label>${t("emailOptional")}</label><input id="ev-email" type="email" value="${escapeAttr(s.email)}" /></div>
      <div class="full"><label>${t("vendorNotes")}</label><textarea id="ev-notes">${escapeAttr(s.notes)}</textarea></div>
      <div class="full"><button class="btn btn-primary" type="submit">${t("saveVendor")}</button></div>
    </form>
  `);
}

function openEditItem(itemId) {
  const item = state.supplyItems.find((i) => i.id === itemId);
  if (!item) return;
  const sOpts = `<option value="">${t("selectVendor")}</option>` + state.suppliers
    .map((s) => `<option value="${s.id}" ${s.id === item.supplierId ? "selected" : ""}>${escapeAttr(s.name)}</option>`)
    .join("");
  openModal(`
    <h2>${t("edit")}</h2>
    <form class="form-grid" id="edit-item-form">
      <input type="hidden" id="edit-full-item-id" value="${item.id}" />
      <div><label>${t("itemName")}</label><input id="ei-name" value="${escapeAttr(item.itemName)}" required /></div>
      <div><label>${t("unitSize")}</label><input id="ei-unit" value="${escapeAttr(item.unit)}" required /></div>
      <div><label>${t("itemType")}</label><input id="ei-type" value="${escapeAttr(item.type)}" required /></div>
      <div><label>${t("vendor")}</label><select id="ei-supplier" required>${sOpts}</select></div>
      <div><label>${t("price")}</label><input id="ei-price" type="number" min="0" step="0.01" value="${itemPrice(item)}" required /></div>
      ${isDental(item) ? `<div><label>${t("stockQty")}</label><input id="ei-stock" type="number" min="0" step="1" value="${trackedStock(item) == null ? "" : trackedStock(item)}" required /></div>` : ""}
      <div class="full"><button class="btn btn-primary" type="submit">${t("saveItem")}</button></div>
    </form>
  `);
}

function renderArchiveWithdrawals() {
  const box = document.getElementById("archive-files");
  if (!box) return;
  const rows = state.withdrawalArchive || [];
  if (!rows.length) {
    box.innerHTML = `<p class="empty">${t("noData")}</p>`;
    return;
  }
  if (!archiveYear) {
    const years = [...new Set(rows.map((w) => (w.date || "").slice(0, 4)).filter(Boolean))].sort().reverse();
    box.innerHTML = `<h3>${t("archiveWithdrawals")}</h3><div class="archive-files">${years
      .map((y) => {
        const count = rows.filter((w) => (w.date || "").startsWith(y)).length;
        return `<div class="archive-file-card">
          <button class="archive-file" type="button" data-arch-year="${y}">📁 ${y}<small>${count}</small></button>
          <button class="btn btn-sm btn-danger" type="button" data-del-archive-year="${y}">${t("deleteVendor")}</button>
        </div>`;
      })
      .join("")}</div>`;
    return;
  }
  if (!archiveMonth) {
    const months = [...new Set(rows.filter((w) => (w.date || "").startsWith(archiveYear)).map((w) => (w.date || "").slice(5, 7)))].sort();
    box.innerHTML = `<button class="btn btn-ghost" type="button" data-arch-back="year">${t("back")}</button>
      <h3>${t("yearFile")} ${archiveYear}</h3>
      <div class="archive-files">${months
        .map((m) => {
          const count = rows.filter((w) => (w.date || "").startsWith(`${archiveYear}-${m}`)).length;
          return `<div class="archive-file-card">
            <button class="archive-file" type="button" data-arch-month="${m}">📄 ${monthLabel(Number(m))}<small>${count}</small></button>
            <button class="btn btn-sm btn-danger" type="button" data-del-archive-month="${m}">${t("deleteVendor")}</button>
          </div>`;
        })
        .join("")}</div>`;
    return;
  }
  const list = rows.filter((w) => (w.date || "").startsWith(`${archiveYear}-${archiveMonth}`));
  box.innerHTML = `<button class="btn btn-ghost" type="button" data-arch-back="month">${t("back")}</button>
    <h3>${monthLabel(Number(archiveMonth))} ${archiveYear}</h3>
    <div id="archive-withdrawals-print">
    ${table(
      [t("clinic"), t("itemName"), t("date"), t("quantity"), t("requester"), t("unitPrice"), t("lineTotal"), ""],
      list.map(
        (w) => `<tr>
          <td>${clinicName(w.clinicId)}</td>
          <td>${w.productName}</td>
          <td>${w.date}</td>
          <td>${w.quantity}</td>
          <td>${w.requester}</td>
          <td>${Number(w.unitPrice)} ${t("currency")}</td>
          <td>${Number(w.quantity) * Number(w.unitPrice)} ${t("currency")}</td>
          <td class="archive-delete-col"><button class="btn btn-sm btn-danger" type="button" data-del-archive="${escapeAttr(w.id)}">${t("deleteVendor")}</button></td>
        </tr>`
      )
    )}
    </div>`;
}

function renderArchivePrices() {
  const q = (document.getElementById("price-search")?.value || "").trim().toLowerCase();
  const list = (state.priceHistory || [])
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .filter((p) => !q || (p.itemName || "").toLowerCase().includes(q) || (p.type || "").toLowerCase().includes(q));
  document.getElementById("archive-prices-table").innerHTML = table(
    [t("itemName"), t("itemType"), t("unitSize"), t("vendor"), t("price"), t("date"), ""],
    list.map(
      (p) => `<tr>
        <td>${p.itemName}</td>
        <td>${p.type || ""}</td>
        <td>${p.unit || ""}</td>
        <td>${supplierById(p.supplierId)?.name || p.supplierName || ""}</td>
        <td>${p.price} ${t("currency")}</td>
        <td>${p.date}</td>
        <td class="archive-delete-col"><button class="btn btn-sm btn-danger" type="button" data-del-price="${escapeAttr(p.id)}">${t("deleteVendor")}</button></td>
      </tr>`
    )
  );
}

function renderArchiveCharts() {
  if (typeof Chart === "undefined") return;
  if (!document.getElementById("app")?.classList.contains("visible")) return;
  const vendorSel = document.getElementById("chart-vendor");
  if (!vendorSel) return;
  const current = vendorSel.value;
  vendorSel.innerHTML = `<option value="">${t("selectVendor")}</option>` + chartVendors().map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  if (current) vendorSel.value = current;
  drawVendorChart(vendorSel.value);
  drawCompareChart();
  if (chartsTabVisible()) {
    requestAnimationFrame(() => {
      vendorChart?.resize();
      compareChart?.resize();
    });
  }
}

function chartColors() {
  return ["#0d6e6e", "#c9a227", "#0b2c3d", "#1b8a5a", "#c47a12", "#5b717a", "#b42318"];
}

function drawVendorChart(supplierId) {
  const canvas = document.getElementById("chart-vendor-canvas");
  if (!canvas) return;
  if (vendorChart) vendorChart.destroy();
  const history = chartHistory().filter((p) => !supplierId || String(p.supplierId) === String(supplierId));
  const names = [...new Set(history.map((p) => p.itemName).filter(Boolean))];
  const dates = [...new Set(history.map((p) => p.date).filter(Boolean))].sort();
  const colors = chartColors();
  const datasets = names.map((name, i) => {
    const points = dates.map((d) => {
      const rec = history.filter((p) => p.itemName === name && p.date <= d).sort((a, b) => b.date.localeCompare(a.date))[0];
      return rec ? rec.price : null;
    });
    return {
      label: name,
      data: points,
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      spanGaps: true,
      tension: 0.2,
    };
  });
  vendorChart = new Chart(canvas, {
    type: "line",
    data: { labels: dates.length ? dates : [todayISO()], datasets: datasets.length ? datasets : [{ label: t("noData"), data: [0], borderColor: "#d7e4e7" }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function drawCompareChart() {
  const canvas = document.getElementById("chart-compare-canvas");
  if (!canvas) return;
  if (compareChart) compareChart.destroy();
  const history = chartHistory();
  const names = [...new Set(history.map((p) => p.itemName).filter(Boolean))];
  const colors = chartColors();
  const vendors = chartVendors();
  const datasets = vendors.map((s, i) => ({
    label: s.name,
    backgroundColor: colors[i % colors.length],
    data: names.map((name) => {
      const rec = history
        .filter((p) => p.itemName === name && String(p.supplierId) === String(s.id))
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return rec ? rec.price : 0;
    }),
  }));
  compareChart = new Chart(canvas, {
    type: "bar",
    data: { labels: names.length ? names : [t("noData")], datasets: datasets.length ? datasets : [{ label: t("noData"), data: [0], backgroundColor: "#d7e4e7" }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderArchive() {
  renderArchiveWithdrawals();
  renderArchivePrices();
  renderArchiveCharts();
}

function renderAll() {
  applyI18n();
  fillSelects();
  renderSupplies();
  renderWithdrawals();
  renderArchive();
}

document.getElementById("user-icons").addEventListener("click", (e) => {
  const tile = e.target.closest("[data-user]");
  if (tile) selectLoginUser(tile.dataset.user);
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;
  if (!user || !pass) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  const result = await loginUser(user, pass);
  if (submitBtn) submitBtn.disabled = false;
  document.getElementById("login-pass").value = "";
  if (result.error) {
    alert(t("loginServerError"));
    return;
  }
  if (!result.user) {
    alert(t("loginError"));
    return;
  }
  state.session = { username: result.user.username };
  save(state);
  startSession();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  state.session = null;
  persist();
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";
  document.getElementById("login-pass-box").hidden = true;
  renderLoginIcons();
  showApp(false);
});

document.getElementById("lang-btn").addEventListener("click", () => {
  state.lang = state.lang === "ar" ? "en" : "ar";
  persist();
});
document.getElementById("login-lang-btn").addEventListener("click", () => {
  state.lang = state.lang === "ar" ? "en" : "ar";
  save(state);
  applyI18n();
});

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
    if (btn.dataset.page === "archive" && document.getElementById("archive-charts")?.classList.contains("active")) {
      requestAnimationFrame(() => renderArchiveCharts());
    }
  });
});

document.querySelectorAll("#page-archive [data-archive]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#page-archive [data-archive]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll("#page-archive .subpage").forEach((p) => p.classList.remove("active"));
    document.getElementById("archive-" + btn.dataset.archive).classList.add("active");
    if (btn.dataset.archive === "charts") requestAnimationFrame(() => renderArchiveCharts());
  });
});

function archiveRowKeys(row) {
  return [row?.id, row?.sourceId].filter((value) => value != null && value !== "").map(String);
}

function notDeletedArchive(row) {
  return !archiveRowKeys(row).some((id) => state.deletedArchiveWithdrawalIds.includes(id));
}

async function removeArchiveRows(rows) {
  for (const row of rows) {
    const result = await deleteArchiveWithdrawal(row.id);
    if (result.error) {
      notifyDbError(result.error);
      return false;
    }
    archiveRowKeys(row).forEach((id) => {
      if (!state.deletedArchiveWithdrawalIds.includes(id)) state.deletedArchiveWithdrawalIds.push(id);
    });
  }
  const gone = new Set(rows.flatMap(archiveRowKeys));
  state.withdrawalArchive = (state.withdrawalArchive || []).filter((row) => !archiveRowKeys(row).some((id) => gone.has(id)));
  if (archiveYear && !(state.withdrawalArchive || []).some((row) => (row.date || "").startsWith(archiveYear))) {
    archiveYear = null;
    archiveMonth = null;
  } else if (archiveMonth && !(state.withdrawalArchive || []).some((row) => (row.date || "").startsWith(`${archiveYear}-${archiveMonth}`))) {
    archiveMonth = null;
  }
  persist();
  return true;
}

document.getElementById("archive-files").addEventListener("click", async (e) => {
  const rowDelete = e.target.closest("[data-del-archive]");
  const yearDelete = e.target.closest("[data-del-archive-year]");
  const monthDelete = e.target.closest("[data-del-archive-month]");
  if (rowDelete || yearDelete || monthDelete) {
    const rows = state.withdrawalArchive || [];
    let targets = [];
    if (rowDelete) {
      if (!confirm(t("confirmDeleteArchive"))) return;
      targets = rows.filter((row) => String(row.id) === String(rowDelete.dataset.delArchive));
    } else if (yearDelete) {
      if (!confirm(t("confirmDeleteArchiveFile"))) return;
      targets = rows.filter((row) => (row.date || "").startsWith(yearDelete.dataset.delArchiveYear));
    } else {
      if (!confirm(t("confirmDeleteArchiveFile"))) return;
      targets = rows.filter((row) => (row.date || "").startsWith(`${archiveYear}-${monthDelete.dataset.delArchiveMonth}`));
    }
    if (targets.length) await removeArchiveRows(targets);
    return;
  }
  const yearBtn = e.target.closest("[data-arch-year]");
  const monthBtn = e.target.closest("[data-arch-month]");
  const back = e.target.closest("[data-arch-back]");
  if (yearBtn) {
    archiveYear = yearBtn.dataset.archYear;
    archiveMonth = null;
    renderArchiveWithdrawals();
  }
  if (monthBtn) {
    archiveMonth = monthBtn.dataset.archMonth;
    renderArchiveWithdrawals();
  }
  if (back) {
    if (back.dataset.archBack === "month") archiveMonth = null;
    else {
      archiveYear = null;
      archiveMonth = null;
    }
    renderArchiveWithdrawals();
  }
});

document.getElementById("page-archive").addEventListener("click", async (e) => {
  const priceDelete = e.target.closest("[data-del-price]");
  if (priceDelete) {
    if (!confirm(t("confirmDeletePrice"))) return;
    const row = (state.priceHistory || []).find((item) => String(item.id) === String(priceDelete.dataset.delPrice));
    if (!row) return;
    const result = await deleteArchivePrice(row.id);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    if (!Array.isArray(state.deletedArchivePriceIds)) state.deletedArchivePriceIds = [];
    if (!Array.isArray(state.deletedArchivePriceKeys)) state.deletedArchivePriceKeys = [];
    const id = String(row.id);
    if (id && !state.deletedArchivePriceIds.includes(id)) state.deletedArchivePriceIds.push(id);
    const key = priceArchiveKey(row);
    if (!state.deletedArchivePriceKeys.includes(key)) state.deletedArchivePriceKeys.push(key);
    state.priceHistory = state.priceHistory.filter((item) => String(item.id) !== id);
    persist();
    return;
  }
  const printBtn = e.target.closest("[data-print-archive]");
  if (printBtn) printArchive(printBtn.dataset.printArchive);
});

document.getElementById("price-search").addEventListener("input", renderArchivePrices);
document.getElementById("chart-vendor").addEventListener("change", () => {
  drawVendorChart(document.getElementById("chart-vendor").value);
  drawCompareChart();
});

document.getElementById("page-warehouse").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-save-stock]");
  if (!btn) return;
  const item = state.supplyItems.find((row) => String(row.id) === String(btn.dataset.saveStock));
  const input = btn.closest("tr")?.querySelector("[data-stock-input]");
  if (!item || !input) return;
  const value = Number(input.value);
  if (!Number.isFinite(value) || value < 0) return;
  item.stock = value;
  item.updatedAt = todayISO();
  const result = await updateSupply(item, state.suppliers);
  if (result.error || !result.row) {
    notifyDbError(result.error);
    return;
  }
  Object.assign(item, result.row);
  if (item.stock == null) item.stock = value;
  persist();
});

document.querySelectorAll("#page-supplies .subnav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#page-supplies .subnav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll("#page-supplies .subpage").forEach((p) => p.classList.remove("active"));
    document.getElementById("sub-" + btn.dataset.sub).classList.add("active");
  });
});

document.getElementById("clinic-subnav").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-clinic]");
  if (!btn) return;
  document.querySelectorAll("#clinic-subnav .subnav-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll("#clinic-pages .subpage").forEach((p) => p.classList.remove("active"));
  const id = btn.dataset.clinic === "totals" ? "clinic-totals" : "clinic-" + btn.dataset.clinic;
  document.getElementById(id)?.classList.add("active");
});

document.querySelectorAll("[data-report]").forEach((btn) => {
  btn.addEventListener("click", () => showClinicReports(btn.dataset.report));
});

document.getElementById("clinic-report-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-report-clinic]");
  if (!btn) return;
  showReport(btn.dataset.reportKind, btn.dataset.reportClinic);
});

document.getElementById("settings-btn").addEventListener("click", () => {
  openModal(settingsDbHtml());
});

document.querySelectorAll("[data-supply-form]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const item = {
      category: form.dataset.supplyForm === "emergency" ? "emergency" : "dental",
      itemName: data.get("itemName").trim(),
      unit: data.get("unit").trim(),
      type: data.get("type").trim(),
      supplierId: data.get("supplierId"),
      price: Number(data.get("price")),
      stock: form.dataset.supplyForm === "emergency" ? null : Number(data.get("stock")),
      updatedAt: todayISO(),
    };
    const result = await insertSupply(item, state.suppliers);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    state.supplyItems.unshift(result.row);
    await logPrice(result.row);
    form.reset();
    persist();
  });
});

document.getElementById("vendor-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const vendor = {
    name: document.getElementById("v-name").value.trim(),
    contact: document.getElementById("v-contact").value.trim(),
    phone: document.getElementById("v-phone").value.trim(),
    email: document.getElementById("v-email").value.trim(),
    notes: document.getElementById("v-notes").value.trim(),
  };
  const result = await insertVendor(vendor);
  if (result.error || !result.row) {
    notifyDbError(result.error);
    return;
  }
  state.suppliers.unshift(result.row);
  e.target.reset();
  persist();
});

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.getElementById("modal").addEventListener("submit", async (e) => {
  if (e.target.id === "edit-item-form") {
    e.preventDefault();
    const item = state.supplyItems.find((i) => i.id === document.getElementById("edit-full-item-id").value);
    if (item) {
      item.itemName = document.getElementById("ei-name").value.trim();
      item.unit = document.getElementById("ei-unit").value.trim();
      item.type = document.getElementById("ei-type").value.trim();
      item.supplierId = document.getElementById("ei-supplier").value;
      item.price = Number(document.getElementById("ei-price").value);
      const stockInput = document.getElementById("ei-stock");
      if (stockInput) item.stock = Number(stockInput.value);
      item.updatedAt = todayISO();
      const result = await updateSupply(item, state.suppliers);
      if (result.error) {
        notifyDbError(result.error);
        return;
      }
      Object.assign(item, result.row);
      await logPrice(item);
      persist();
    }
    closeModal();
    return;
  }
  if (e.target.id === "edit-vendor-form") {
    e.preventDefault();
    const vendor = supplierById(document.getElementById("edit-vendor-id").value);
    if (vendor) {
      vendor.name = document.getElementById("ev-name").value.trim();
      vendor.contact = document.getElementById("ev-contact").value.trim();
      vendor.phone = document.getElementById("ev-phone").value.trim();
      vendor.email = document.getElementById("ev-email").value.trim();
      vendor.notes = document.getElementById("ev-notes").value.trim();
      const result = await updateVendor(vendor);
      if (result.row) Object.assign(vendor, result.row);
      persist();
    }
    closeModal();
  }
});

document.addEventListener("click", async (e) => {
  const editItem = e.target.closest("[data-edit-item]");
  if (editItem) {
    openEditItem(editItem.dataset.editItem);
    return;
  }
  const editVendor = e.target.closest("[data-edit-vendor]");
  if (editVendor) openEditVendor(editVendor.dataset.editVendor);
  const delVendor = e.target.closest("[data-del-vendor]");
  if (delVendor) {
    if (!confirm(t("confirmDeleteVendor"))) return;
    const id = delVendor.dataset.delVendor;
    await deleteVendor(id);
    state.suppliers = state.suppliers.filter((s) => s.id !== id);
    persist();
    return;
  }
  const delItem = e.target.closest("[data-del-item]");
  if (delItem) {
    if (!confirm(t("confirmDeleteItem"))) return;
    const id = delItem.dataset.delItem;
    const result = await deleteSupply(id);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    state.supplyItems = state.supplyItems.filter((i) => String(i.id) !== String(id));
    if (!state.deletedSupplyIds.includes(id)) state.deletedSupplyIds.push(id);
    persist();
    return;
  }
  const delWithdraw = e.target.closest("[data-del-withdraw]");
  if (delWithdraw) {
    if (!confirm(t("confirmDeleteWithdrawal"))) return;
    const id = delWithdraw.dataset.delWithdraw;
    const clinicId = delWithdraw.dataset.delClinic;
    const withdrawn = state.withdrawals.find((w) => String(w.id) === String(id));
    const product = withdrawn ? state.supplyItems.find((p) => String(p.id) === String(withdrawn.productId)) : null;
    const result = await deleteWithdrawal(id, clinicId);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    if (result.fromLog && product && isDental(product)) {
      const fresh = await fetchDentalStock(product.id);
      if (fresh.found) product.stock = fresh.stock;
    } else if (!result.fromLog && product && isDental(product) && trackedStock(product) != null) {
      const stockResult = await adjustDentalStock(product, Number(withdrawn.quantity) || 0);
      if (!stockResult.ok) {
        alert(stockResult.error);
        return;
      }
    }
    state.withdrawals = state.withdrawals.filter((w) => String(w.id) !== String(id));
    if (!state.deletedWithdrawalIds.includes(id)) state.deletedWithdrawalIds.push(id);
    persist();
  }
});

function rowsToHtmlTable(rows) {
  if (!rows.length) return `<p class="empty">${t("noData")}</p>`;
  const headers = Object.keys(rows[0]);
  return table(
    headers,
    rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`)
  );
}

async function pushList(rows, insertFn) {
  const uploaded = [];
  for (const row of rows) {
    const result = await insertFn(row);
    if (result.error || !result.row) {
      return { rows: uploaded.concat(rows.slice(uploaded.length)), error: result.error || t("dbSaveError") };
    }
    uploaded.push(result.row);
  }
  return { rows: uploaded, error: null };
}

async function uploadLocalRows(rows, insertFn) {
  const pushed = await pushList(rows, insertFn);
  if (pushed.error) notifyDbError(pushed.error);
  return pushed.rows;
}

function notDeletedSupply(row) {
  const ids = [row.id, row.sourceId].filter((value) => value != null && value !== "").map(String);
  return !ids.some((id) => state.deletedSupplyIds.includes(id));
}

function notDeletedWithdrawal(row) {
  const ids = [row.id, row.sourceId].filter((value) => value != null && value !== "").map(String);
  return !ids.some((id) => state.deletedWithdrawalIds.includes(id));
}

async function overlayCategory(tableResult, wantEmergency) {
  if (!tableResult || tableResult.missing) return;
  const current = state.supplyItems.filter((item) => isEmergency(item) === wantEmergency && notDeletedSupply(item));
  const other = state.supplyItems.filter((item) => isEmergency(item) !== wantEmergency);
  const cloud = (tableResult.rows || []).filter(notDeletedSupply);
  if (!cloud.length) {
    const uploaded = await uploadLocalRows(current, (item) =>
      insertSupply({ ...item, category: wantEmergency ? "emergency" : "dental" }, state.suppliers)
    );
    state.supplyItems = [...other, ...uploaded];
    return;
  }
  const extras = current.filter((item) => !cloud.some((row) => sameRecord(row, item)));
  const uploaded = extras.length
    ? await uploadLocalRows(extras, (item) =>
        insertSupply({ ...item, category: wantEmergency ? "emergency" : "dental" }, state.suppliers)
      )
    : [];
  state.supplyItems = [...other, ...cloud, ...uploaded];
}

async function overlayInventoryTables(result, legacyWithdrawals) {
  await overlayCategory(result.dentalWarehouse, false);
  await overlayCategory(result.emergencySupplies, true);
  const log = result.withdrawalLog;
  if (!log || log.missing) return;
  const cloud = (log.rows || []).filter(notDeletedWithdrawal);
  const local = state.withdrawals.filter(notDeletedWithdrawal);
  const legacy = (legacyWithdrawals || []).filter(notDeletedWithdrawal);
  const known = cloud.length ? cloud : [];
  const extras = [...legacy, ...local].filter((row) => !known.some((item) => sameRecord(item, row) || sameRecord(row, item)));
  const uniqueExtras = [];
  extras.forEach((row) => {
    if (uniqueExtras.some((item) => sameRecord(item, row) || sameRecord(row, item))) return;
    uniqueExtras.push(row);
  });
  const uploaded = uniqueExtras.length
    ? await uploadLocalRows(uniqueExtras, (row) =>
        insertWithdrawalLog({ ...row, affectsStock: false, sourceId: row.sourceId || row.id })
      )
    : [];
  state.withdrawals = [...known, ...uploaded];
}

async function hydrateFromDatabase() {
  const result = await loadProcurementData();
  if (!result.connection.ok) throw new Error(result.error || result.connection.message);

  const cloudSupplies = (result.supplies || []).filter((row) => !state.deletedSupplyIds.includes(String(row.id)));
  const cloudWithdrawals = (result.withdrawals || []).filter((row) => !state.deletedWithdrawalIds.includes(String(row.id)));
  const cloudReports = result.reports || [];

  for (const id of state.deletedSupplyIds) await deleteSupply(id);
  for (const id of state.deletedWithdrawalIds) await deleteWithdrawal(id);

  if (cloudSupplies.length) {
    const byId = new Map(cloudSupplies.map((row) => [String(row.id), row]));
    state.supplyItems.forEach((row) => {
      if (!byId.has(String(row.id))) byId.set(String(row.id), row);
    });
    state.supplyItems = [...byId.values()];
  } else if (state.supplyItems.length) {
    state.supplyItems = await uploadLocalRows(
      state.supplyItems.filter((row) => !state.deletedSupplyIds.includes(String(row.id))),
      (item) => insertSupply(item, state.suppliers)
    );
  }

  await overlayInventoryTables(result, cloudWithdrawals);

  if (result.withdrawalLog?.missing) {
    if (cloudWithdrawals.length) {
      const byId = new Map(cloudWithdrawals.map((row) => [String(row.id), row]));
      state.withdrawals.forEach((row) => {
        if (!byId.has(String(row.id))) byId.set(String(row.id), row);
      });
      state.withdrawals = [...byId.values()];
    } else if (state.withdrawals.length) {
      state.withdrawals = await uploadLocalRows(
        state.withdrawals.filter((row) => !state.deletedWithdrawalIds.includes(String(row.id))),
        insertWithdrawal
      );
    }
  }

  if (cloudReports.length) state.reports = cloudReports;

  if (!Array.isArray(state.deletedArchiveWithdrawalIds)) state.deletedArchiveWithdrawalIds = [];
  for (const id of state.deletedArchiveWithdrawalIds) await deleteArchiveWithdrawal(id);
  const cloudArchiveW = (result.archiveWithdrawals || []).filter(notDeletedArchive);
  if (cloudArchiveW.length) {
    const byId = new Map(cloudArchiveW.map((row) => [String(row.id), row]));
    (state.withdrawalArchive || []).filter(notDeletedArchive).forEach((row) => {
      if (!byId.has(String(row.id))) byId.set(String(row.id), row);
    });
    state.withdrawalArchive = [...byId.values()];
  } else if ((state.withdrawalArchive || []).some(notDeletedArchive)) {
    state.withdrawalArchive = await uploadLocalRows(state.withdrawalArchive.filter(notDeletedArchive), insertArchiveWithdrawal);
  } else {
    state.withdrawalArchive = [];
  }

  if (!Array.isArray(state.deletedArchivePriceIds)) state.deletedArchivePriceIds = [];
  for (const id of state.deletedArchivePriceIds) await deleteArchivePrice(id);
  const keptPrice = (row) => !state.deletedArchivePriceIds.includes(String(row.id));
  const cloudArchiveP = (result.archivePrices || []).filter(keptPrice);
  if (cloudArchiveP.length) {
    const byId = new Map(cloudArchiveP.map((row) => [String(row.id), row]));
    (state.priceHistory || []).filter(keptPrice).forEach((row) => {
      if (!byId.has(String(row.id))) byId.set(String(row.id), row);
    });
    state.priceHistory = [...byId.values()];
  } else if ((state.priceHistory || []).some(keptPrice)) {
    state.priceHistory = await uploadLocalRows(state.priceHistory.filter(keptPrice), insertArchivePrice);
  } else {
    state.priceHistory = [];
  }
  await syncAllProductsToPriceArchive();

  const cloudVendors = result.vendors || [];
  restoreSuppliers(state);
  if (cloudVendors.length) {
    const byId = new Map(cloudVendors.map((row) => [String(row.id), row]));
    const byName = new Map(cloudVendors.map((row) => [(row.name || "").trim().toLowerCase(), row]));
    state.suppliers.forEach((row) => {
      const nameKey = (row.name || "").trim().toLowerCase();
      if (!byId.has(String(row.id)) && !byName.has(nameKey)) byId.set(String(row.id), row);
    });
    state.suppliers = [...byId.values()];
  } else if (state.suppliers.length) {
    state.suppliers = await uploadLocalRows(state.suppliers, insertVendor);
  }

  save(state);
  renderAll();
  return result;
}

let dbStatusText = "";

function settingsDbHtml() {
  return `
    <h3>${t("hospitalData")}</h3>
    <p class="empty">${dbStatusText || t("supabaseConnected")}</p>
  `;
}

function printArchive(kind) {
  if (kind === "withdrawals") {
    const box = document.getElementById("archive-files");
    const clone = box ? box.cloneNode(true) : null;
    clone?.querySelectorAll(".archive-delete-col, [data-del-archive-year], [data-del-archive-month]").forEach((el) => el.remove());
    printHtml(clone ? clone.innerHTML : "", t("archiveWithdrawals"));
    return;
  }
  if (kind === "prices") {
    const box = document.getElementById("archive-prices-print");
    const clone = box ? box.cloneNode(true) : null;
    clone?.querySelectorAll(".archive-delete-col").forEach((el) => el.remove());
    printHtml(clone ? clone.innerHTML : "", t("archivePrices"));
    return;
  }
  const vendorCanvas = document.getElementById("chart-vendor-canvas");
  const compareCanvas = document.getElementById("chart-compare-canvas");
  const vendorImg = vendorCanvas ? `<img src="${vendorCanvas.toDataURL("image/png")}" style="width:100%;max-width:900px" />` : "";
  const compareImg = compareCanvas ? `<img src="${compareCanvas.toDataURL("image/png")}" style="width:100%;max-width:900px" />` : "";
  printHtml(
    `<h3>${t("chartByVendor")}</h3>${vendorImg}<h3>${t("chartCompare")}</h3>${compareImg}`,
    t("archiveCharts")
  );
}

async function loadHospitalDataFromCloud() {
  try {
    const loaded = await hydrateFromDatabase();
    dbStatusText = loaded.error
      ? `${t("supabaseConnected")} — ${loaded.error}`
      : t("supabaseConnected");
  } catch (err) {
    dbStatusText = `${t("dbLoadError")}: ${err.message || err}`;
  }
}

async function startSession() {
  const name = state.session?.username || "";
  document.getElementById("user-name").textContent = name;
  document.getElementById("user-initial").textContent = name.slice(0, 1);
  showApp(true);
  renderAll();
  await loadHospitalDataFromCloud();
}

applyI18n();
if (state.session) startSession();
else showApp(false);

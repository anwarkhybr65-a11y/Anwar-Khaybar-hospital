import {
  deleteArchivePrice,
  deleteArchiveWithdrawal,
  deleteSupply,
  deleteVendor,
  deleteWithdrawal,
  ensureDentalExpiryColumns,
  fetchDentalStock,
  insertArchivePrice,
  insertArchiveWithdrawal,
  insertDisposal,
  insertReport,
  insertSupply,
  insertVendor,
  insertWithdrawal,
  insertWithdrawalLog,
  listAppUsers,
  loadProcurementData,
  loginUser,
  manageAppUser,
  deleteExternalSupply,
  saveClinicStock,
  saveActivity,
  saveExternalSupply,
  saveSupplyRequest,
  updateSupply,
  updateVendor,
  upsertClinicNames,
} from "./supabaseClient.js";

const KEY = "anwar-khaybar-procurement";
const BACKUP_KEY = "anwar-khaybar-procurement-backup";

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
    clinicNames: "أسماء العيادات",
    saveClinicNames: "حفظ أسماء العيادات",
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
    lowStockCard: "قاربت على النفاد",
    lowStockCardAlert: "تنبيه: يوجد {count} من الأصناف بكمية أقل من 6 علب في مستودع الأسنان.",
    lowStockCardClear: "لا توجد مستلزمات قاربت على النفاد.",
    expiryCard: "قاربت صلاحيتها على الانتهاء",
    expiryCardAlert: "تحذير: يوجد {count} من الأصناف قاربت صلاحيتها أو تالفة.",
    expiryCardClear: "لا توجد مستلزمات قاربت صلاحيتها أو تالفة.",
    expiryDate: "تاريخ انتهاء الصلاحية",
    damagedItem: "الصنف تالف",
    damaged: "تالف",
    dispose: "إتلاف",
    confirmDispose: "هل تريد إتلاف الكمية المتبقية من {name} ({qty} علب)؟ لن تبقى في المستودع.",
    disposalReport: "تقرير الإتلاف",
    disposalReason: "سبب الإتلاف",
    reasonDamaged: "تالف",
    reasonExpired: "منتهي الصلاحية",
    reasonNear: "قارب انتهاء الصلاحية",
    daysLeft: "الأيام المتبقية",
    expiredSince: "منتهية منذ {days} يوم",
    expiresToday: "تنتهي اليوم",
    daysRemaining: "متبقي {days} يوم",
    noExpiry: "غير محدد",
    disposalValue: "قيمة الإتلاف",
    disposalTotal: "إجمالي قيمة الإتلاف",
    expiryHint: "يظهر الصنف هنا إذا كان تالفاً، أو إذا تبقى على صلاحيته 90 يوماً أو أقل.",
    insufficientStock: "الكمية المتاحة في المستودع لا تكفي لهذا السحب.",
    stockRequired: "حدّد الكمية المتاحة في المستودع قبل تسجيل السحب.",
    archive: "أرشيف",
    archiveWithdrawals: "ملفات السحوبات",
    archivePrices: "سجل الأسعار",
    archiveCharts: "الرسوم البيانية",
    activityLog: "سجل العمليات",
    activityTime: "الساعة",
    activityAction: "العملية",
    activityDetail: "التفاصيل",
    allAccounts: "كل الحسابات",
    actLogin: "تسجيل الدخول",
    actLogout: "تسجيل الخروج",
    actRequestSend: "إرسال طلب",
    actRequestAccept: "قبول طلب",
    actRequestReject: "رفض طلب",
    actRequestEdit: "تعديل طلب",
    actRequestSave: "حفظ طلب",
    actWithdrawalAdd: "تسجيل مسحوب",
    actWithdrawalDelete: "حذف مسحوب",
    actSupplyAdd: "إضافة صنف",
    actSupplyUpdate: "تعديل صنف",
    actSupplyDelete: "حذف صنف",
    actVendorAdd: "إضافة مورد",
    actVendorDelete: "حذف مورد",
    actStockSave: "تحديث كمية المستودع",
    actDispose: "إتلاف",
    actExternalAdd: "إضافة مستلزم خارجي",
    actExternalDelete: "حذف مستلزم خارجي",
    actClinicNames: "تغيير أسماء العيادات",
    actUserCreate: "إنشاء حساب",
    actUserBan: "حظر حساب",
    actUserUnban: "إلغاء حظر حساب",
    actUserReset: "تغيير كلمة مرور حساب",
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
    accountRole: "الدور",
    requests: "الطلبات",
    clinicStocks: "مخزون العيادات",
    myClinicStock: "مخزون العيادة",
    externalRequests: "طلبات خارجية",
    externalSupplies: "المستلزمات الخارجية",
    externalSuppliesHint: "أصناف هذه الصفحة هي التي تظهر عند إنشاء طلب خارجي.",
    noExternalProducts: "لا توجد مستلزمات خارجية. أضفها من صفحة المستلزمات الخارجية.",
    internalRequests: "طلبات داخلية",
    disposeRequest: "طلب إتلاف",
    returnRequest: "إعادة إلى المستودع",
    requestKind: "نوع الطلب",
    requestStatus: "الحالة",
    pending: "قيد الانتظار",
    accepted: "مقبول",
    rejected: "مرفوض",
    accept: "قبول",
    reject: "رفض",
    editRequest: "تعديل",
    saveRequest: "حفظ الطلب",
    requestSaved: "تم حفظ الطلب",
    sendRequest: "إرسال الطلب",
    requestNote: "ملاحظة",
    requestSent: "تم إرسال الطلب",
    approvedWithdrawals: "المسحوبات المعتمدة",
    warehouseStaffHint: "الأصناف المتوفرة في المستودع.",
    availableItems: "الأصناف المتوفرة",
    roleAdmin: "المسؤول",
    roleDeputy: "النائب",
    roleStaff: "طاقم العيادة",
    roleDoctor: "طبيب",
    roleNurse: "تمريض",
    accountBanned: "هذا الحساب محظور",
    passwordRule: "كلمة المرور يجب أن تكون 6 أرقام",
    userAdmin: "إدارة الحسابات",
    adminPassword: "كلمة مرور المسؤول",
    showUsers: "عرض الحسابات",
    addUser: "إضافة مستخدم",
    banUser: "حظر",
    unbanUser: "إلغاء الحظر",
    resetPassword: "تغيير كلمة المرور",
    staffKind: "الوظيفة",
    newAccount: "بيانات الحساب الجديد",
    passwordOnce: "انسخ كلمة المرور الآن، لن تظهر مرة أخرى.",
    adminLimit: "لا يمكن إضافة أكثر من مسؤولين اثنين.",
    deputyLimit: "يوجد نائب واحد بالفعل.",
    staffLimit: "هذه الوظيفة موجودة مسبقاً لهذه العيادة.",
    usersNeedSql: "نفّذ ملف sql/add_roles_and_requests.sql في Supabase لتفعيل إدارة الحسابات.",
    clinicAlertClear: "لا توجد تنبيهات على مخزون العيادة.",
    lowClinicStock: "الكمية المتبقية من {name} هي {qty}، والصنف قارب على النفاد.",
    clinicExpiryAlert: "{name} تنتهي صلاحيته خلال {days} يوم.",
    clinicExpiredAlert: "{name} منتهي الصلاحية.",
    savedMark: "محفوظ",
    confirmAccept: "هل تريد قبول هذا الطلب؟",
    confirmReject: "هل تريد رفض هذا الطلب؟",
    noRequestProducts: "لا توجد أصناف مطابقة لهذا النوع من الطلب.",
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
    clinicNames: "Clinic names",
    saveClinicNames: "Save clinic names",
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
    lowStockCard: "Running low",
    lowStockCardAlert: "Alert: {count} items have fewer than 6 boxes in the dental warehouse.",
    lowStockCardClear: "No supplies are running low.",
    expiryCard: "Nearing expiry",
    expiryCardAlert: "Warning: {count} items are near expiry or damaged.",
    expiryCardClear: "No supplies are near expiry or damaged.",
    expiryDate: "Expiry date",
    damagedItem: "Item is damaged",
    damaged: "Damaged",
    dispose: "Dispose",
    confirmDispose: "Dispose the remaining quantity of {name} ({qty} boxes)? It will leave the warehouse.",
    disposalReport: "Disposal report",
    disposalReason: "Disposal reason",
    reasonDamaged: "Damaged",
    reasonExpired: "Expired",
    reasonNear: "Nearing expiry",
    daysLeft: "Days remaining",
    expiredSince: "Expired {days} days ago",
    expiresToday: "Expires today",
    daysRemaining: "{days} days left",
    noExpiry: "Not set",
    disposalValue: "Disposal value",
    disposalTotal: "Total disposal value",
    expiryHint: "An item appears here when it is damaged, or when 90 days or fewer remain before it expires.",
    insufficientStock: "The warehouse does not have enough of this item for the withdrawal.",
    stockRequired: "Set the available warehouse quantity before recording a withdrawal.",
    archive: "Archive",
    archiveWithdrawals: "Withdrawal files",
    archivePrices: "Price history",
    archiveCharts: "Charts",
    activityLog: "Activity log",
    activityTime: "Time",
    activityAction: "Action",
    activityDetail: "Details",
    allAccounts: "All accounts",
    actLogin: "Sign in",
    actLogout: "Sign out",
    actRequestSend: "Send request",
    actRequestAccept: "Accept request",
    actRequestReject: "Reject request",
    actRequestEdit: "Edit request",
    actRequestSave: "Save request",
    actWithdrawalAdd: "Record withdrawal",
    actWithdrawalDelete: "Delete withdrawal",
    actSupplyAdd: "Add item",
    actSupplyUpdate: "Edit item",
    actSupplyDelete: "Delete item",
    actVendorAdd: "Add supplier",
    actVendorDelete: "Delete supplier",
    actStockSave: "Update warehouse quantity",
    actDispose: "Dispose",
    actExternalAdd: "Add external supply",
    actExternalDelete: "Delete external supply",
    actClinicNames: "Change clinic names",
    actUserCreate: "Create account",
    actUserBan: "Ban account",
    actUserUnban: "Unban account",
    actUserReset: "Reset account password",
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
    accountRole: "Role",
    requests: "Requests",
    clinicStocks: "Clinic inventory",
    myClinicStock: "Clinic inventory",
    externalRequests: "External requests",
    externalSupplies: "External supplies",
    externalSuppliesHint: "Items on this page are the ones available for an external request.",
    noExternalProducts: "There are no external supplies yet. Add them on the external supplies page.",
    internalRequests: "Internal requests",
    disposeRequest: "Disposal request",
    returnRequest: "Return to warehouse",
    requestKind: "Request type",
    requestStatus: "Status",
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    accept: "Accept",
    reject: "Reject",
    editRequest: "Edit",
    saveRequest: "Save request",
    requestSaved: "Request saved",
    sendRequest: "Send request",
    requestNote: "Note",
    requestSent: "Request sent",
    approvedWithdrawals: "Approved withdrawals",
    warehouseStaffHint: "Items available in the warehouse.",
    availableItems: "Available items",
    roleAdmin: "Admin",
    roleDeputy: "Deputy",
    roleStaff: "Clinic staff",
    roleDoctor: "Doctor",
    roleNurse: "Nurse",
    accountBanned: "This account is banned",
    passwordRule: "The password must be 6 digits",
    userAdmin: "Account management",
    adminPassword: "Admin password",
    showUsers: "Show accounts",
    addUser: "Add user",
    banUser: "Ban",
    unbanUser: "Unban",
    resetPassword: "Change password",
    staffKind: "Role in clinic",
    newAccount: "New account",
    passwordOnce: "Copy the password now. It will not be shown again.",
    adminLimit: "There can be only two admins.",
    deputyLimit: "A deputy already exists.",
    staffLimit: "This clinic already has that staff role.",
    usersNeedSql: "Run sql/add_roles_and_requests.sql in Supabase to enable account management.",
    clinicAlertClear: "No clinic inventory alerts.",
    lowClinicStock: "{name} has {qty} left and is running low.",
    clinicExpiryAlert: "{name} expires in {days} days.",
    clinicExpiredAlert: "{name} is expired.",
    savedMark: "Saved",
    confirmAccept: "Accept this request?",
    confirmReject: "Reject this request?",
    noRequestProducts: "No matching items for this request type.",
  },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

function clinicName(id) {
  const custom = state.clinicNames && state.clinicNames[id];
  if (custom && String(custom).trim()) return String(custom).trim();
  const c = CLINICS.find((x) => x.id === id);
  if (!c) return id;
  return state.lang === "ar" ? c.ar : c.en;
}

function defaultClinicName(id) {
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
    disposals: [],
    clinicNames: {},
    requests: [],
    clinicStock: [],
    externalSupplies: [],
    activityLog: [],
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
  if (!Array.isArray(data.disposals)) data.disposals = [];
  if (!data.clinicNames || typeof data.clinicNames !== "object") data.clinicNames = {};
  if (!Array.isArray(data.requests)) data.requests = [];
  if (!Array.isArray(data.clinicStock)) data.clinicStock = [];
  if (!Array.isArray(data.externalSupplies)) data.externalSupplies = [];
  if (!Array.isArray(data.activityLog)) data.activityLog = [];
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
  applyAccess();
}

function roleOf() {
  return state.session?.role || "admin";
}

function isStaff() {
  return roleOf() === "staff";
}

function isAdmin() {
  return roleOf() === "admin";
}

function isManager() {
  return roleOf() === "admin" || roleOf() === "deputy";
}

function canSeePrices() {
  return isManager();
}

function sessionClinic() {
  return state.session?.clinicId || "";
}

function roleLabel() {
  if (roleOf() === "deputy") return t("roleDeputy");
  if (roleOf() === "staff") return state.session?.staffKind === "nurse" ? t("roleNurse") : t("roleDoctor");
  return t("roleAdmin");
}

function applyAccess() {
  const staff = Boolean(state.session) && isStaff();
  document.body.classList.toggle("role-staff", staff);
  document.querySelectorAll("[data-manager-only]").forEach((el) => {
    el.hidden = staff;
  });
  document.querySelectorAll("[data-nav-clinic]").forEach((el) => {
    el.textContent = staff ? t("myClinicStock") : t("clinicStocks");
  });
  const hint = document.querySelector("#page-warehouse [data-i18n='warehouseHint']");
  if (hint) hint.textContent = staff ? t("warehouseStaffHint") : t("warehouseHint");
  if (state.session) {
    const name = state.session.username || "";
    const nameEl = document.getElementById("user-name");
    const initial = document.getElementById("user-initial");
    if (nameEl) nameEl.textContent = `${name} — ${roleLabel()}`;
    if (initial) initial.textContent = (state.session.letter || name).slice(0, 1);
  }
}

const MANAGER_PAGES = new Set(["supplies", "emergency", "archive"]);

function openPage(page) {
  if (state.session && isStaff() && MANAGER_PAGES.has(page)) page = "dashboard";
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + page)?.classList.add("active");
  if (page === "archive" && document.getElementById("archive-charts")?.classList.contains("active")) {
    requestAnimationFrame(() => renderArchiveCharts());
  }
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

const EXPIRY_WINDOW_DAYS = 90;
let dashPanel = null;

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function expiryConcern(item) {
  if (!isDental(item)) return null;
  const stock = trackedStock(item);
  if (stock == null || stock <= 0) return null;
  if (item.damaged) return "damaged";
  const days = daysUntil(item.expiryDate);
  if (days == null || days > EXPIRY_WINDOW_DAYS) return null;
  return days < 0 ? "expired" : "near";
}

function expiryItems() {
  return state.supplyItems
    .filter((item) => expiryConcern(item))
    .sort((a, b) => (daysUntil(a.expiryDate) ?? -9999) - (daysUntil(b.expiryDate) ?? -9999));
}

function daysLabel(date) {
  const days = daysUntil(date);
  if (days == null) return t("noExpiry");
  if (days < 0) return t("expiredSince").replace("{days}", Math.abs(days));
  if (days === 0) return t("expiresToday");
  return t("daysRemaining").replace("{days}", days);
}

function disposalReasonLabel(reason) {
  if (reason === "expired") return t("reasonExpired");
  if (reason === "near") return t("reasonNear");
  return t("reasonDamaged");
}

function applySavedSupply(item, row) {
  const expiryDate = row.expiryDate === undefined ? item.expiryDate || "" : row.expiryDate || "";
  const damaged = row.damaged === undefined ? item.damaged === true : row.damaged === true;
  Object.assign(item, row, { expiryDate, damaged });
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
    const expiryCell = includeStock ? `<td>${item.expiryDate || t("noExpiry")}</td><td>${item.damaged ? `<span class="badge badge-danger">${t("damaged")}</span>` : t("none")}</td>` : "";
    return `<tr>
      <td>${item.itemName}</td>
      <td>${item.unit}</td>
      <td>${item.type}</td>
      <td>${supplierById(item.supplierId)?.name || ""}</td>
      <td>${itemPrice(item)} ${t("currency")}${isBest ? ` <span class="badge badge-best">${t("cheapest")}</span>` : ""}</td>
      <td>${best ? itemPrice(best) + " " + t("currency") : ""}</td>
      <td>${best ? supplierById(best.supplierId)?.name || "" : ""}</td>
      ${stockCell}
      ${expiryCell}
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
  if (includeStock) headers.push(t("stockQty"), t("expiryDate"), t("damaged"));
  headers.push(t("lastUpdate"), "");
  return headers;
}

function renderSupplyCategory() {
  const dentalTable = document.getElementById("table-dental");
  const emergencyTable = document.getElementById("table-emergency");
  if (dentalTable) dentalTable.innerHTML = table(supplyItemHeaders(true), supplyRows(state.supplyItems.filter(isDental), true));
  if (emergencyTable) emergencyTable.innerHTML = table(supplyItemHeaders(false), supplyRows(state.supplyItems.filter(isEmergency), false));
}

function renderDashboardAlerts() {
  const cards = document.getElementById("dash-cards");
  const detail = document.getElementById("dash-detail");
  if (!cards || !detail) return;
  if (!canSeePrices()) {
    cards.innerHTML = "";
    detail.hidden = true;
    detail.innerHTML = "";
    const report = document.getElementById("disposal-report");
    if (report) report.innerHTML = "";
    return;
  }
  const low = lowStockItems().slice().sort((a, b) => trackedStock(a) - trackedStock(b));
  const expiring = expiryItems();
  const stockAlert = low.length ? t("lowStockCardAlert").replace("{count}", low.length) : t("lowStockCardClear");
  const expiryAlert = expiring.length ? t("expiryCardAlert").replace("{count}", expiring.length) : t("expiryCardClear");
  cards.innerHTML = `
    <button class="dash-card dash-card-stock${low.length ? " is-alert" : ""}${dashPanel === "stock" ? " active" : ""}" type="button" data-dash-panel="stock" aria-expanded="${dashPanel === "stock"}">
      <span class="dash-card-icon" aria-hidden="true">📦</span>
      <span class="dash-card-body">
        <span class="dash-card-title">${t("lowStockCard")}</span>
        <span class="dash-card-alert">${stockAlert}</span>
      </span>
      <span class="dash-card-count">${low.length}</span>
    </button>
    <button class="dash-card dash-card-expiry${expiring.length ? " is-alert" : ""}${dashPanel === "expiry" ? " active" : ""}" type="button" data-dash-panel="expiry" aria-expanded="${dashPanel === "expiry"}">
      <span class="dash-card-icon" aria-hidden="true">⏳</span>
      <span class="dash-card-body">
        <span class="dash-card-title">${t("expiryCard")}</span>
        <span class="dash-card-alert">${expiryAlert}</span>
      </span>
      <span class="dash-card-count">${expiring.length}</span>
    </button>`;
  if (dashPanel === "stock") {
    detail.hidden = false;
    detail.innerHTML = `
      <div class="dash-detail-head"><h3>${t("lowStockTitle")}</h3></div>
      ${table(
        [t("itemName"), t("unitSize"), t("itemType"), t("vendor"), t("stockQty"), t("lowStockTitle")],
        low.map((item) => {
          const qty = trackedStock(item);
          return `<tr>
            <td>${item.itemName}</td>
            <td>${item.unit || ""}</td>
            <td>${item.type || ""}</td>
            <td>${supplierById(item.supplierId)?.name || item.supplierName || ""}</td>
            <td class="stock-low">${qty} ${t("boxes")}</td>
            <td>${t("lowStockItem").replace("{name}", item.itemName).replace("{qty}", qty)}</td>
          </tr>`;
        })
      )}`;
  } else if (dashPanel === "expiry") {
    detail.hidden = false;
    detail.innerHTML = `
      <div class="dash-detail-head"><h3>${t("expiryCard")}</h3></div>
      <p class="empty">${t("expiryHint")}</p>
      ${table(
        [t("itemName"), t("unitSize"), t("vendor"), t("stockQty"), t("expiryDate"), t("daysLeft"), t("disposalReason"), ""],
        expiring.map((item) => {
          const concern = expiryConcern(item);
          const qty = trackedStock(item);
          return `<tr>
            <td>${item.itemName}</td>
            <td>${item.unit || ""}</td>
            <td>${supplierById(item.supplierId)?.name || item.supplierName || ""}</td>
            <td>${qty} ${t("boxes")}</td>
            <td>${item.expiryDate || t("noExpiry")}</td>
            <td>${daysLabel(item.expiryDate)}</td>
            <td><span class="badge ${concern === "near" ? "badge-wait" : "badge-danger"}">${disposalReasonLabel(concern)}</span></td>
            <td><button class="btn btn-sm btn-danger" type="button" data-dispose-item="${escapeAttr(item.id)}">${t("dispose")}</button></td>
          </tr>`;
        })
      )}`;
  } else {
    detail.hidden = true;
    detail.innerHTML = "";
  }
  renderDisposalReport();
}

function renderDisposalReport() {
  const box = document.getElementById("disposal-report");
  if (!box) return;
  const rows = (state.disposals || []).slice().sort((a, b) => (b.disposedAt || "").localeCompare(a.disposedAt || ""));
  const total = rows.reduce((sum, row) => sum + Number(row.quantity) * Number(row.unitPrice), 0);
  box.innerHTML = `
    <div class="dash-detail-head">
      <h3>${t("disposalReport")}</h3>
      ${rows.length ? `<button class="btn btn-navy" type="button" data-print-disposal>${t("print")}</button>` : ""}
    </div>
    <div id="disposal-report-print">
      ${table(
        [t("date"), t("itemName"), t("quantity"), t("disposalReason"), t("expiryDate"), t("disposalValue")],
        rows.map(
          (row) => `<tr>
            <td>${row.disposedAt || ""}</td>
            <td>${row.productName}</td>
            <td>${row.quantity} ${t("boxes")}</td>
            <td>${disposalReasonLabel(row.reason)}</td>
            <td>${row.expiryDate || t("noExpiry")}</td>
            <td>${Number(row.quantity) * Number(row.unitPrice)} ${t("currency")}</td>
          </tr>`
        )
      )}
      ${rows.length ? `<p><strong>${t("disposalTotal")}: ${total} ${t("currency")}</strong></p>` : ""}
    </div>`;
}

async function disposeItem(id) {
  const item = state.supplyItems.find((row) => String(row.id) === String(id));
  const qty = trackedStock(item);
  if (!item || qty == null || qty <= 0) return;
  const reason = expiryConcern(item) || "damaged";
  if (!confirm(t("confirmDispose").replace("{name}", item.itemName).replace("{qty}", qty))) return;
  const previousStock = item.stock;
  const previousDamaged = item.damaged === true;
  item.stock = 0;
  item.damaged = false;
  item.updatedAt = todayISO();
  const updated = await updateSupply(item, state.suppliers);
  if (updated.error || !updated.row) {
    item.stock = previousStock;
    item.damaged = previousDamaged;
    notifyDbError(updated.error);
    return;
  }
  applySavedSupply(item, updated.row);
  item.stock = 0;
  item.damaged = false;
  const saved = await insertDisposal({
    productId: item.id,
    productName: item.itemName,
    unit: item.unit,
    type: item.type,
    supplierName: supplierById(item.supplierId)?.name || item.supplierName || "",
    quantity: qty,
    unitPrice: itemPrice(item),
    reason,
    expiryDate: item.expiryDate || "",
    disposedAt: todayISO(),
  });
  if (saved.error || !saved.row) {
    item.stock = previousStock;
    item.damaged = previousDamaged;
    const rolled = await updateSupply(item, state.suppliers);
    if (rolled.row) applySavedSupply(item, rolled.row);
    notifyDbError(saved.error);
    return;
  }
  if (!Array.isArray(state.disposals)) state.disposals = [];
  state.disposals.unshift(saved.row);
  await recordActivity("dispose", `${item.itemName} — ${qty}`);
  persist();
}

function renderWarehouse() {
  const box = document.getElementById("warehouse-table");
  if (!box) return;
  const items = state.supplyItems.filter(isDental);
  if (!canSeePrices()) {
    const available = items.filter((item) => {
      const stock = trackedStock(item);
      return stock == null || stock > 0;
    });
    const rows = available.map((item) => {
      const stock = trackedStock(item);
      return `<tr>
        <td>${escapeAttr(item.itemName)}</td>
        <td>${escapeAttr(item.unit)}</td>
        <td>${escapeAttr(item.type)}</td>
        <td>${stock == null ? "—" : stock + " " + t("boxes")}</td>
      </tr>`;
    });
    box.innerHTML = `<h3>${t("availableItems")}</h3>${table([t("itemName"), t("unitSize"), t("itemType"), t("stockQty")], rows)}`;
    return;
  }
  const rows = items.map((item) => {
    const stock = trackedStock(item);
    return `<tr>
      <td>${item.itemName}</td>
      <td>${item.unit}</td>
      <td>${item.type}</td>
      <td class="${stock != null && stock < 6 ? "stock-low" : ""}">${stock == null ? "—" : stock + " " + t("boxes")}</td>
      <td><input data-expiry-input type="date" value="${item.expiryDate || ""}" /></td>
      <td><input data-damaged-input type="checkbox" ${item.damaged ? "checked" : ""} /></td>
      <td>
        <input data-stock-input="${item.id}" type="number" min="0" step="1" value="${stock == null ? "" : stock}" style="max-width:110px" />
      </td>
      <td><button class="btn btn-sm btn-primary" type="button" data-save-stock="${item.id}">${t("saveStock")}</button></td>
    </tr>`;
  });
  box.innerHTML = `<h3>${t("warehouse")}</h3>${table([t("itemName"), t("unitSize"), t("itemType"), t("stockQty"), t("expiryDate"), t("damaged"), t("saveStock"), ""], rows)}`;
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
  if (canSeePrices()) renderSupplyCategory();
  renderWarehouse();
  renderDashboardAlerts();
  if (!canSeePrices()) {
    const dental = document.getElementById("table-dental");
    const diffs = document.getElementById("price-diffs");
    const vendors = document.getElementById("table-vendors");
    if (dental) dental.innerHTML = "";
    if (diffs) diffs.innerHTML = "";
    if (vendors) vendors.innerHTML = "";
    return;
  }
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
  if (!nav || !pages) return;
  if (!canSeePrices()) {
    nav.innerHTML = "";
    const list = (state.requests || []).filter(
      (row) =>
        row.status === "accepted" &&
        row.clinicId === sessionClinic() &&
        (row.kind === "internal" || row.kind === "external")
    );
    const rows = list.map(
      (row) => `<tr>
        <td>${escapeAttr(row.productName)}</td>
        <td>${escapeAttr((row.reviewedAt || row.createdAt || "").slice(0, 10))}</td>
        <td>${Number(row.quantity) || 0}</td>
        <td>${t(row.kind === "external" ? "externalRequests" : "internalRequests")}</td>
      </tr>`
    );
    pages.innerHTML = `<div class="card table-wrap"><h3>${t("approvedWithdrawals")}</h3>${table([t("itemName"), t("date"), t("quantity"), t("requestKind")], rows)}</div>`;
    return;
  }
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
      await recordActivity("withdrawal_add", `${clinicName(row.clinicId)} — ${row.productName} — ${row.quantity}`);
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

function showDisposalReport() {
  const box = document.getElementById("disposal-report");
  const btn = document.querySelector('[data-report="disposal"]');
  const wasOpen = btn?.classList.contains("active");
  document.querySelectorAll("[data-report]").forEach((item) => item.classList.remove("active"));
  const listEl = document.getElementById("clinic-report-list");
  if (listEl) listEl.hidden = true;
  if (!box) return;
  if (wasOpen) {
    box.hidden = true;
    return;
  }
  btn?.classList.add("active");
  box.hidden = false;
  renderDisposalReport();
  box.scrollIntoView({ block: "nearest" });
}

function showClinicReports(kind) {
  document.querySelectorAll("[data-report]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.report === kind);
  });
  const disposal = document.getElementById("disposal-report");
  if (disposal) disposal.hidden = true;
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
      ${isDental(item) ? `<div><label>${t("stockQty")}</label><input id="ei-stock" type="number" min="0" step="1" value="${trackedStock(item) == null ? "" : trackedStock(item)}" required /></div>
      <div><label>${t("expiryDate")}</label><input id="ei-expiry" type="date" value="${escapeAttr(item.expiryDate)}" /></div>
      <div><label><input id="ei-damaged" type="checkbox" ${item.damaged ? "checked" : ""} /> ${t("damagedItem")}</label></div>` : ""}
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

function activityStamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: "", time: "" };
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return { day, time };
}

function activityActionLabel(action) {
  const key = {
    login: "actLogin",
    logout: "actLogout",
    request_send: "actRequestSend",
    request_accept: "actRequestAccept",
    request_reject: "actRequestReject",
    request_edit: "actRequestEdit",
    request_save: "actRequestSave",
    withdrawal_add: "actWithdrawalAdd",
    withdrawal_delete: "actWithdrawalDelete",
    supply_add: "actSupplyAdd",
    supply_update: "actSupplyUpdate",
    supply_delete: "actSupplyDelete",
    vendor_add: "actVendorAdd",
    vendor_delete: "actVendorDelete",
    stock_save: "actStockSave",
    dispose: "actDispose",
    external_add: "actExternalAdd",
    external_delete: "actExternalDelete",
    clinic_names: "actClinicNames",
    user_create: "actUserCreate",
    user_ban: "actUserBan",
    user_unban: "actUserUnban",
    user_reset: "actUserReset",
  }[action];
  return key ? t(key) : action;
}

function activityRoleText(entry) {
  if (entry.role === "deputy") return t("roleDeputy");
  if (entry.role === "staff") {
    const kind = entry.staffKind === "nurse" ? t("roleNurse") : t("roleDoctor");
    return entry.clinicId ? `${kind} — ${clinicName(entry.clinicId)}` : kind;
  }
  return t("roleAdmin");
}

async function recordActivity(action, detail) {
  const session = state.session;
  if (!session?.username) return;
  const entry = {
    id: crypto.randomUUID(),
    username: session.username,
    role: session.role || "admin",
    staffKind: session.staffKind || "",
    clinicId: session.clinicId || "",
    action,
    detail: detail || "",
    at: new Date().toISOString(),
  };
  if (!Array.isArray(state.activityLog)) state.activityLog = [];
  state.activityLog.unshift(entry);
  const saved = await saveActivity(entry);
  if (saved?.row) Object.assign(entry, saved.row);
}

function renderActivityLog() {
  const box = document.getElementById("activity-log");
  const filter = document.getElementById("activity-account");
  if (!box) return;
  const entries = state.activityLog || [];
  if (filter) {
    const current = filter.value;
    const names = [...new Set(entries.map((entry) => entry.username).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar"));
    filter.innerHTML = `<option value="">${t("allAccounts")}</option>${names.map((name) => `<option value="${escapeAttr(name)}">${escapeAttr(name)}</option>`).join("")}`;
    if (current) filter.value = current;
  }
  const selected = filter?.value || "";
  const list = entries
    .filter((entry) => !selected || entry.username === selected)
    .slice()
    .sort((a, b) => String(b.at).localeCompare(String(a.at)));
  if (!list.length) {
    box.innerHTML = `<p class="empty">${t("noData")}</p>`;
    return;
  }
  const days = [...new Set(list.map((entry) => activityStamp(entry.at).day))];
  box.innerHTML = days
    .map((day) => {
      const rows = list
        .filter((entry) => activityStamp(entry.at).day === day)
        .map((entry) => `<tr>
          <td>${escapeAttr(activityStamp(entry.at).time)}</td>
          <td>${escapeAttr(entry.username)}</td>
          <td>${escapeAttr(activityRoleText(entry))}</td>
          <td>${escapeAttr(activityActionLabel(entry.action))}</td>
          <td>${escapeAttr(entry.detail)}</td>
        </tr>`);
      return `<h3>${escapeAttr(day)}</h3>${table([t("activityTime"), t("username"), t("accountRole"), t("activityAction"), t("activityDetail")], rows)}`;
    })
    .join("");
}

function renderArchive() {
  if (!canSeePrices()) {
    const files = document.getElementById("archive-files");
    const prices = document.getElementById("archive-prices-table");
    const activity = document.getElementById("activity-log");
    if (files) files.innerHTML = "";
    if (prices) prices.innerHTML = "";
    if (activity) activity.innerHTML = "";
    return;
  }
  renderArchiveWithdrawals();
  renderArchivePrices();
  renderArchiveCharts();
  renderActivityLog();
}

let requestTab = "external";

function clinicRows(clinicId) {
  return (state.clinicStock || []).filter((row) => row.clinicId === clinicId && Number(row.quantity) > 0);
}

function requestKindLabel(kind) {
  if (kind === "external") return t("externalRequests");
  if (kind === "dispose") return t("disposeRequest");
  if (kind === "return") return t("returnRequest");
  return t("internalRequests");
}

function requestStatusLabel(status) {
  if (status === "accepted") return t("accepted");
  if (status === "rejected") return t("rejected");
  return t("pending");
}

function catalogPrice(productId) {
  const item = state.supplyItems.find((row) => String(row.id) === String(productId));
  if (!item) return "—";
  return `${itemPrice(item)} ${t("currency")}`;
}

function clinicAlertLines(row) {
  const lines = [];
  if (Number(row.quantity) < 6) {
    lines.push(t("lowClinicStock").replace("{name}", row.productName).replace("{qty}", row.quantity));
  }
  const days = daysUntil(row.expiryDate);
  if (days != null && days < 0) lines.push(t("clinicExpiredAlert").replace("{name}", row.productName));
  else if (days != null && days <= EXPIRY_WINDOW_DAYS) lines.push(t("clinicExpiryAlert").replace("{name}", row.productName).replace("{days}", days));
  return lines;
}

function clinicTable(rows) {
  const headers = [t("itemName"), t("unitSize"), t("quantity"), t("expiryDate"), t("daysLeft")];
  if (canSeePrices()) headers.push(t("price"));
  const body = rows.map((row) => {
    const price = canSeePrices() ? `<td>${catalogPrice(row.productId)}</td>` : "";
    return `<tr>
      <td>${escapeAttr(row.productName)}</td>
      <td>${escapeAttr(row.unit)}</td>
      <td class="${Number(row.quantity) < 6 ? "stock-low" : ""}">${row.quantity}</td>
      <td>${escapeAttr(row.expiryDate || t("noExpiry"))}</td>
      <td>${daysLabel(row.expiryDate)}</td>
      ${price}
    </tr>`;
  });
  return table(headers, body);
}

function renderStaffAlerts() {
  const box = document.getElementById("staff-alerts");
  if (!box) return;
  if (!isStaff()) {
    box.innerHTML = "";
    return;
  }
  const lines = clinicRows(sessionClinic()).flatMap(clinicAlertLines);
  box.innerHTML = lines.length
    ? lines.map((line) => `<div class="clinic-alert">${escapeAttr(line)}</div>`).join("")
    : `<p class="empty">${t("clinicAlertClear")}</p>`;
}

function renderClinicStock() {
  const title = document.getElementById("clinic-stock-title");
  const panel = document.getElementById("clinic-stock-panel");
  if (!panel) return;
  if (isStaff()) {
    if (title) title.textContent = t("myClinicStock");
    const rows = clinicRows(sessionClinic());
    const alerts = rows.flatMap(clinicAlertLines);
    panel.innerHTML = `
      ${alerts.map((line) => `<div class="clinic-alert">${escapeAttr(line)}</div>`).join("")}
      <div class="card table-wrap"><h3>${escapeAttr(clinicName(sessionClinic()))}</h3>${rows.length ? clinicTable(rows) : `<p class="empty">${t("noData")}</p>`}</div>`;
    renderStaffAlerts();
    return;
  }
  if (title) title.textContent = t("clinicStocks");
  panel.innerHTML = CLINICS.map((clinic) => {
    const rows = clinicRows(clinic.id);
    const alerts = rows.flatMap(clinicAlertLines);
    return `<div class="card table-wrap">
      <h3>${escapeAttr(clinicName(clinic.id))}</h3>
      ${alerts.map((line) => `<div class="clinic-alert">${escapeAttr(line)}</div>`).join("")}
      ${rows.length ? clinicTable(rows) : `<p class="empty">${t("noData")}</p>`}
    </div>`;
  }).join("");
  renderStaffAlerts();
}

function requestChoices(kind) {
  if (kind === "dispose" || kind === "return") {
    return clinicRows(sessionClinic())
      .filter((row) => {
        const days = daysUntil(row.expiryDate);
        if (days == null) return false;
        return kind === "dispose" ? days < 0 : days >= 0 && days <= EXPIRY_WINDOW_DAYS;
      })
      .map((row) => ({
        value: row.id,
        label: `${row.productName} — ${row.quantity} — ${row.expiryDate || ""}`,
        max: Number(row.quantity) || 1,
      }));
  }
  if (kind === "external") {
    return (state.externalSupplies || []).map((item) => ({
      value: item.id,
      label: `${item.itemName}${item.unit ? ` — ${item.unit}` : ""}`,
      max: "",
    }));
  }
  return state.supplyItems
    .filter(isDental)
    .filter((item) => {
      if (kind !== "internal") return true;
      const stock = trackedStock(item);
      return stock == null || stock > 0;
    })
    .map((item) => {
      const stock = trackedStock(item);
      const note = kind === "internal" && stock != null ? ` — ${stock} ${t("boxes")}` : "";
      return { value: item.id, label: `${item.itemName}${note}`, max: "" };
    });
}

function requestActions(row) {
  if (!isManager()) return "";
  const id = escapeAttr(row.id);
  const review = row.status === "pending"
    ? `<button class="btn btn-sm btn-primary" type="button" data-accept-request="${id}">${t("accept")}</button>
       <button class="btn btn-sm btn-danger" type="button" data-reject-request="${id}">${t("reject")}</button>
       <button class="btn btn-sm btn-navy" type="button" data-edit-request="${id}">${t("editRequest")}</button>`
    : "";
  return `<div class="request-actions">${review}
    <button class="btn btn-sm" type="button" data-print-request="${id}">${t("print")}</button>
    <button class="btn btn-sm btn-navy" type="button" data-save-request="${id}">${t("saveRequest")}</button>
  </div>`;
}

function renderRequests() {
  const tabs = document.getElementById("request-tabs");
  const panel = document.getElementById("request-panel");
  const pill = document.getElementById("request-count");
  if (pill) {
    const pendingCount = (state.requests || []).filter((row) => row.status === "pending").length;
    pill.hidden = !isManager() || !pendingCount;
    pill.textContent = String(pendingCount);
  }
  if (!tabs || !panel) return;
  tabs.innerHTML = [
    ["external", "externalRequests"],
    ["internal", "internalRequests"],
    ["dispose", "disposeRequest"],
    ["return", "returnRequest"],
  ]
    .map(([kind, key]) => `<button class="subnav-btn ${requestTab === kind ? "active" : ""}" type="button" data-request-tab="${kind}">${t(key)}</button>`)
    .join("");
  const choices = isStaff() ? requestChoices(requestTab) : [];
  const emptyText = requestTab === "external" ? t("noExternalProducts") : t("noRequestProducts");
  const externalLink = requestTab === "external"
    ? `<p><button class="btn btn-navy" type="button" data-open-page="external">${t("externalSupplies")}</button></p>`
    : "";
  const form = isStaff()
    ? `<div class="card"><h3>${t("sendRequest")}</h3>
        ${choices.length ? `<form class="form-grid" data-request-form>
          <div><label>${t("itemName")}</label><select name="itemId" required>${choices.map((choice) => `<option value="${escapeAttr(choice.value)}">${escapeAttr(choice.label)}</option>`).join("")}</select></div>
          <div><label>${t("quantity")}</label><input name="quantity" type="number" min="1" step="1" required /></div>
          <div class="full"><label>${t("requestNote")}</label><input name="note" /></div>
          <div class="full"><button class="btn btn-primary" type="submit">${t("sendRequest")}</button></div>
        </form>` : `<p class="empty">${emptyText}</p>`}
      </div>`
    : "";
  const list = (state.requests || []).filter((row) => row.kind === requestTab && (!isStaff() || row.clinicId === sessionClinic()));
  const headers = isManager()
    ? [t("clinic"), t("itemName"), t("quantity"), t("expiryDate"), t("requestNote"), t("requestStatus"), ""]
    : [t("itemName"), t("quantity"), t("expiryDate"), t("requestStatus")];
  const rows = list.map((row) => {
    const status = `${requestStatusLabel(row.status)}${row.saved ? ` · ${t("savedMark")}` : ""}`;
    if (!isManager()) {
      return `<tr>
        <td>${escapeAttr(row.productName)}</td>
        <td>${Number(row.quantity) || 0}</td>
        <td>${escapeAttr(row.expiryDate || t("noExpiry"))}</td>
        <td>${escapeAttr(status)}</td>
      </tr>`;
    }
    return `<tr>
      <td>${escapeAttr(clinicName(row.clinicId))}</td>
      <td>${escapeAttr(row.productName)}</td>
      <td>${Number(row.quantity) || 0}</td>
      <td>${escapeAttr(row.expiryDate || t("noExpiry"))}</td>
      <td>${escapeAttr(row.note || "")}</td>
      <td>${escapeAttr(status)}</td>
      <td>${requestActions(row)}</td>
    </tr>`;
  });
  panel.innerHTML = `${externalLink}${form}<div class="card table-wrap"><h3>${requestKindLabel(requestTab)}</h3>${table(headers, rows)}</div>`;
}

async function persistRequest(req) {
  const saved = await saveSupplyRequest(req);
  if (saved.error) {
    notifyDbError(saved.error);
    return false;
  }
  if (saved.row) Object.assign(req, saved.row);
  persist();
  return true;
}

async function changeClinicStock(clinicId, productId, expiryDate, delta, meta) {
  if (!Array.isArray(state.clinicStock)) state.clinicStock = [];
  const expiry = expiryDate || "";
  let row = state.clinicStock.find(
    (item) => item.clinicId === clinicId && String(item.productId) === String(productId) && (item.expiryDate || "") === expiry
  );
  if (!row) {
    if (delta < 0) return false;
    row = {
      id: crypto.randomUUID(),
      clinicId,
      productId: String(productId || ""),
      productName: meta?.productName || "",
      unit: meta?.unit || "",
      quantity: 0,
      expiryDate: expiry,
    };
    state.clinicStock.push(row);
  }
  const previous = Number(row.quantity) || 0;
  const next = previous + delta;
  if (next < 0) return false;
  row.quantity = next;
  const saved = await saveClinicStock(row);
  if (saved.error) {
    row.quantity = previous;
    notifyDbError(saved.error);
    return false;
  }
  if (saved.row) Object.assign(row, saved.row, { quantity: next });
  return true;
}

async function submitRequest(form) {
  if (!isStaff() || !sessionClinic()) return;
  const data = new FormData(form);
  const qty = Number(data.get("quantity"));
  if (!qty || qty < 1) return;
  const itemId = data.get("itemId");
  let productId = "";
  let productName = "";
  let expiryDate = "";
  if (requestTab === "dispose" || requestTab === "return") {
    const stock = (state.clinicStock || []).find((row) => row.id === itemId && row.clinicId === sessionClinic());
    if (!stock || qty > Number(stock.quantity)) {
      alert(t("insufficientStock"));
      return;
    }
    productId = stock.productId;
    productName = stock.productName;
    expiryDate = stock.expiryDate || "";
  } else if (requestTab === "external") {
    const product = (state.externalSupplies || []).find((item) => String(item.id) === String(itemId));
    if (!product) return;
    productId = product.id;
    productName = product.itemName;
  } else {
    const product = state.supplyItems.find((item) => String(item.id) === String(itemId));
    if (!product) return;
    productId = product.id;
    productName = product.itemName;
    expiryDate = product.expiryDate || "";
  }
  const row = {
    id: crypto.randomUUID(),
    kind: requestTab,
    clinicId: sessionClinic(),
    productId,
    productName,
    quantity: qty,
    expiryDate,
    note: String(data.get("note") || "").trim(),
    status: "pending",
    createdBy: state.session?.username || "",
    createdAt: new Date().toISOString(),
    reviewedBy: "",
    reviewedAt: "",
    applied: false,
    saved: false,
  };
  const saved = await saveSupplyRequest(row);
  if (saved.error) {
    notifyDbError(saved.error);
    return;
  }
  state.requests.unshift(saved.row || row);
  await recordActivity("request_send", `${requestKindLabel(row.kind)} — ${row.productName} — ${row.quantity}`);
  persist();
  alert(t("requestSent"));
}

async function acceptRequest(id) {
  const req = (state.requests || []).find((row) => row.id === id);
  if (!req || !isManager() || req.status !== "pending" || req.applied) return;
  if (!confirm(t("confirmAccept"))) return;
  const qty = Number(req.quantity) || 0;
  const externalItem = (state.externalSupplies || []).find((item) => String(item.id) === String(req.productId));
  const product = state.supplyItems.find((item) => String(item.id) === String(req.productId));
  const meta = { productName: req.productName, unit: (req.kind === "external" ? externalItem?.unit : product?.unit) || "" };
  const expiry = req.expiryDate || product?.expiryDate || "";
  if (req.kind === "internal") {
    if (!product) {
      alert(t("noData"));
      return;
    }
    const moved = await adjustDentalStock(product, -qty);
    if (!moved.ok) {
      alert(moved.error || t("insufficientStock"));
      return;
    }
    const added = await changeClinicStock(req.clinicId, req.productId, expiry, qty, meta);
    if (!added) {
      await adjustDentalStock(product, qty);
      return;
    }
  } else if (req.kind === "external") {
    const added = await changeClinicStock(req.clinicId, req.productId, externalItem?.expiryDate || expiry, qty, meta);
    if (!added) return;
  } else if (req.kind === "return") {
    if (product) {
      const moved = await adjustDentalStock(product, qty);
      if (!moved.ok) {
        alert(moved.error || t("stockRequired"));
        return;
      }
    }
    const reduced = await changeClinicStock(req.clinicId, req.productId, req.expiryDate || "", -qty, meta);
    if (!reduced) {
      if (product) await adjustDentalStock(product, -qty);
      alert(t("insufficientStock"));
      return;
    }
  } else if (req.kind === "dispose") {
    const reduced = await changeClinicStock(req.clinicId, req.productId, req.expiryDate || "", -qty, meta);
    if (!reduced) {
      alert(t("insufficientStock"));
      return;
    }
    const saved = await insertDisposal({
      productId: req.productId,
      productName: req.productName,
      unit: product?.unit || "",
      type: product?.type || "",
      supplierName: product ? supplierById(product.supplierId)?.name || "" : "",
      quantity: qty,
      unitPrice: product ? itemPrice(product) : 0,
      reason: "expired",
      expiryDate: req.expiryDate || "",
      disposedAt: todayISO(),
    });
    if (saved.error || !saved.row) {
      await changeClinicStock(req.clinicId, req.productId, req.expiryDate || "", qty, meta);
      notifyDbError(saved.error);
      return;
    }
    if (!Array.isArray(state.disposals)) state.disposals = [];
    state.disposals.unshift(saved.row);
  }
  req.status = "accepted";
  req.applied = true;
  req.reviewedBy = state.session?.username || "";
  req.reviewedAt = new Date().toISOString();
  await recordActivity("request_accept", `${requestKindLabel(req.kind)} — ${req.productName} — ${req.quantity}`);
  await persistRequest(req);
}

async function rejectRequest(id) {
  const req = (state.requests || []).find((row) => row.id === id);
  if (!req || !isManager() || req.status !== "pending") return;
  if (!confirm(t("confirmReject"))) return;
  req.status = "rejected";
  req.reviewedBy = state.session?.username || "";
  req.reviewedAt = new Date().toISOString();
  await recordActivity("request_reject", `${requestKindLabel(req.kind)} — ${req.productName} — ${req.quantity}`);
  await persistRequest(req);
}

function printRequest(id) {
  const req = (state.requests || []).find((row) => row.id === id);
  if (!req) return;
  printHtml(
    `<table>
      <tr><th>${t("requestKind")}</th><td>${requestKindLabel(req.kind)}</td></tr>
      <tr><th>${t("clinic")}</th><td>${escapeAttr(clinicName(req.clinicId))}</td></tr>
      <tr><th>${t("itemName")}</th><td>${escapeAttr(req.productName)}</td></tr>
      <tr><th>${t("quantity")}</th><td>${Number(req.quantity) || 0}</td></tr>
      <tr><th>${t("expiryDate")}</th><td>${escapeAttr(req.expiryDate || t("noExpiry"))}</td></tr>
      <tr><th>${t("requestNote")}</th><td>${escapeAttr(req.note || "")}</td></tr>
      <tr><th>${t("requestStatus")}</th><td>${requestStatusLabel(req.status)}</td></tr>
    </table>`,
    t("requests")
  );
}

function openEditRequest(id) {
  const req = (state.requests || []).find((row) => row.id === id);
  if (!req || !isManager()) return;
  openModal(`
    <h3>${t("editRequest")}</h3>
    <form class="form-grid" id="request-edit-form">
      <input type="hidden" name="id" value="${escapeAttr(req.id)}" />
      <div><label>${t("quantity")}</label><input name="quantity" type="number" min="1" step="1" value="${Number(req.quantity) || 1}" required /></div>
      <div class="full"><label>${t("requestNote")}</label><input name="note" value="${escapeAttr(req.note || "")}" /></div>
      <div class="full"><button class="btn btn-primary" type="submit">${t("saveRequest")}</button></div>
    </form>
  `);
}

function userAdminMessage(code) {
  const text = String(code || "");
  if (/admin_limit/.test(text)) return t("adminLimit");
  if (/deputy_limit/.test(text)) return t("deputyLimit");
  if (/staff_limit/.test(text)) return t("staffLimit");
  if (/admin_required/.test(text)) return t("loginError");
  if (/list_app_users|manage_app_user|schema cache|Could not find the function/i.test(text)) return t("usersNeedSql");
  return text;
}

function renderUserTable(users) {
  const box = document.getElementById("user-admin-result");
  if (!box) return;
  const rows = (users || []).map((user) => {
    const role = user.role === "deputy" ? t("roleDeputy") : user.role === "staff" ? (user.staffKind === "nurse" ? t("roleNurse") : t("roleDoctor")) : t("roleAdmin");
    const clinic = user.clinicId ? clinicName(user.clinicId) : "";
    const banLabel = user.banned ? t("unbanUser") : t("banUser");
    const action = user.banned ? "unban" : "ban";
    return `<tr>
      <td>${escapeAttr(user.username)}</td>
      <td>${escapeAttr(role)}</td>
      <td>${escapeAttr(clinic)}</td>
      <td>${user.banned ? t("accountBanned") : t("accepted")}</td>
      <td>
        <button class="btn btn-sm btn-danger" type="button" data-user-action="${action}" data-user-target="${escapeAttr(user.username)}">${banLabel}</button>
        <button class="btn btn-sm btn-navy" type="button" data-user-action="reset" data-user-target="${escapeAttr(user.username)}">${t("resetPassword")}</button>
      </td>
    </tr>`;
  });
  box.innerHTML = table([t("username"), t("accountRole"), t("clinic"), t("requestStatus"), ""], rows);
}

function showNewCredentials(username, password) {
  const box = document.getElementById("user-admin-result");
  if (!box) return;
  box.innerHTML = `<div class="card">
    <h3>${t("newAccount")}</h3>
    <p>${t("username")}: <strong>${escapeAttr(username)}</strong></p>
    <p>${t("password")}: <strong>${escapeAttr(password)}</strong></p>
    <p>${t("passwordOnce")}</p>
  </div>`;
}

function userAdminHtml() {
  if (!isAdmin()) return "";
  const clinics = CLINICS.map((clinic) => `<option value="${clinic.id}">${escapeAttr(clinicName(clinic.id))}</option>`).join("");
  return `
    <h3>${t("userAdmin")}</h3>
    <form class="form-grid" id="user-auth-form">
      <div class="full"><label>${t("adminPassword")}</label><input id="admin-pass" type="password" inputmode="numeric" maxlength="6" required /></div>
      <div class="full"><button class="btn btn-navy" type="submit">${t("showUsers")}</button></div>
    </form>
    <div id="user-admin-result"></div>
    <form class="form-grid" id="user-create-form">
      <div><label>${t("roleAdmin")} / ${t("roleDeputy")} / ${t("roleStaff")}</label>
        <select id="new-user-role" name="role">
          <option value="admin">${t("roleAdmin")}</option>
          <option value="deputy">${t("roleDeputy")}</option>
          <option value="staff">${t("roleStaff")}</option>
        </select>
      </div>
      <div id="new-user-clinic-wrap" hidden><label>${t("clinic")}</label><select name="clinicId">${clinics}</select></div>
      <div id="new-user-kind-wrap" hidden><label>${t("staffKind")}</label>
        <select name="staffKind"><option value="doctor">${t("roleDoctor")}</option><option value="nurse">${t("roleNurse")}</option></select>
      </div>
      <div class="full"><button class="btn btn-primary" type="submit">${t("addUser")}</button></div>
    </form>`;
}

function renderExternalSupplies() {
  const panel = document.getElementById("external-supply-panel");
  if (!panel) return;
  const items = state.externalSupplies || [];
  const supplierOptions = `<option value="">${t("selectVendor")}</option>` + state.suppliers.map((supplier) => `<option value="${escapeAttr(supplier.id)}">${escapeAttr(supplier.name)}</option>`).join("");
  const form = isManager()
    ? `<div class="card"><h3>${t("addItem")}</h3>
        <form class="form-grid" id="external-supply-form">
          <div><label>${t("itemName")}</label><input name="itemName" required /></div>
          <div><label>${t("unitSize")}</label><input name="unit" required /></div>
          <div><label>${t("itemType")}</label><input name="type" required /></div>
          <div><label>${t("vendor")}</label><select name="supplierId">${supplierOptions}</select></div>
          <div><label>${t("price")}</label><input name="price" type="number" min="0" step="0.01" required /></div>
          <div><label>${t("quantity")}</label><input name="stock" type="number" min="0" step="1" required /></div>
          <div><label>${t("expiryDate")}</label><input name="expiryDate" type="date" /></div>
          <div class="full"><button class="btn btn-primary" type="submit">${t("saveItem")}</button></div>
        </form>
      </div>`
    : "";
  const headers = canSeePrices()
    ? [t("itemName"), t("unitSize"), t("itemType"), t("vendor"), t("price"), t("quantity"), t("expiryDate"), ""]
    : [t("itemName"), t("unitSize"), t("itemType")];
  const rows = items.map((item) => {
    const supplier = item.supplierName || supplierById(item.supplierId)?.name || "";
    if (!canSeePrices()) {
      return `<tr><td>${escapeAttr(item.itemName)}</td><td>${escapeAttr(item.unit)}</td><td>${escapeAttr(item.type)}</td></tr>`;
    }
    return `<tr>
      <td>${escapeAttr(item.itemName)}</td>
      <td>${escapeAttr(item.unit)}</td>
      <td>${escapeAttr(item.type)}</td>
      <td>${escapeAttr(supplier)}</td>
      <td>${Number(item.price) || 0} ${t("currency")}</td>
      <td>${Number(item.stock) || 0}</td>
      <td>${escapeAttr(item.expiryDate || t("noExpiry"))}</td>
      <td><button class="btn btn-sm btn-danger" type="button" data-del-external="${escapeAttr(item.id)}">${t("deleteVendor")}</button></td>
    </tr>`;
  });
  panel.innerHTML = `${form}<div class="card table-wrap"><h3>${t("externalSupplies")}</h3>${table(headers, rows)}</div>`;
}

async function addExternalSupply(form) {
  if (!isManager()) return;
  const data = new FormData(form);
  const supplierId = String(data.get("supplierId") || "");
  const row = {
    id: crypto.randomUUID(),
    itemName: String(data.get("itemName") || "").trim(),
    unit: String(data.get("unit") || "").trim(),
    type: String(data.get("type") || "").trim(),
    supplierId,
    supplierName: supplierById(supplierId)?.name || "",
    price: Number(data.get("price")) || 0,
    stock: Number(data.get("stock")) || 0,
    expiryDate: String(data.get("expiryDate") || ""),
  };
  if (!row.itemName) return;
  const saved = await saveExternalSupply(row);
  if (saved.error) {
    notifyDbError(saved.error);
    return;
  }
  if (!Array.isArray(state.externalSupplies)) state.externalSupplies = [];
  state.externalSupplies.unshift(saved.row || row);
  await recordActivity("external_add", row.itemName);
  persist();
}

async function removeExternalSupply(id) {
  if (!isManager()) return;
  const item = (state.externalSupplies || []).find((row) => String(row.id) === String(id));
  if (!item || !confirm(t("confirmDeleteItem"))) return;
  const result = await deleteExternalSupply(item.id);
  if (result.error) {
    notifyDbError(result.error);
    return;
  }
  state.externalSupplies = state.externalSupplies.filter((row) => String(row.id) !== String(id));
  await recordActivity("external_delete", item.itemName);
  persist();
}

function renderAll() {
  applyI18n();
  fillSelects();
  renderSupplies();
  renderWithdrawals();
  renderArchive();
  renderRequests();
  renderClinicStock();
  renderExternalSupplies();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value;
  if (!user || !pass) return;
  if (!/^\d{6}$/.test(pass)) {
    alert(t("passwordRule"));
    return;
  }
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  const result = await loginUser(user, pass);
  if (submitBtn) submitBtn.disabled = false;
  document.getElementById("login-pass").value = "";
  if (result.error) {
    alert(t("loginServerError"));
    return;
  }
  if (result.banned) {
    alert(t("accountBanned"));
    return;
  }
  if (!result.user) {
    alert(t("loginError"));
    return;
  }
  state.session = {
    username: result.user.username,
    letter: result.user.letter || "",
    color: result.user.color || "",
    role: result.user.role || "admin",
    clinicId: result.user.clinicId || "",
    staffKind: result.user.staffKind || "",
  };
  await recordActivity("login", "");
  save(state);
  startSession();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await recordActivity("logout", "");
  state.session = null;
  persist();
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";
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
  btn.addEventListener("click", () => openPage(btn.dataset.page));
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
document.getElementById("activity-account").addEventListener("change", renderActivityLog);
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
  const expiryInput = btn.closest("tr")?.querySelector("[data-expiry-input]");
  const damagedInput = btn.closest("tr")?.querySelector("[data-damaged-input]");
  item.stock = value;
  item.expiryDate = expiryInput?.value || "";
  item.damaged = Boolean(damagedInput?.checked);
  item.updatedAt = todayISO();
  const result = await updateSupply(item, state.suppliers);
  if (result.error || !result.row) {
    notifyDbError(result.error);
    return;
  }
  applySavedSupply(item, result.row);
  if (item.stock == null) item.stock = value;
  await recordActivity("stock_save", `${item.itemName} — ${item.stock}`);
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

document.getElementById("page-dashboard").addEventListener("click", async (e) => {
  const moduleBtn = e.target.closest("[data-module]");
  if (moduleBtn) {
    openPage(moduleBtn.dataset.module);
    return;
  }
  const panelBtn = e.target.closest("[data-dash-panel]");
  if (panelBtn) {
    const next = panelBtn.dataset.dashPanel;
    dashPanel = dashPanel === next ? null : next;
    renderDashboardAlerts();
    if (dashPanel) document.getElementById("dash-detail")?.scrollIntoView({ block: "nearest" });
    return;
  }
  const disposeBtn = e.target.closest("[data-dispose-item]");
  if (disposeBtn) {
    await disposeItem(disposeBtn.dataset.disposeItem);
    return;
  }
  const printBtn = e.target.closest("[data-print-disposal]");
  if (printBtn) {
    const box = document.getElementById("disposal-report-print");
    printHtml(box ? box.innerHTML : "", t("disposalReport"));
  }
});

document.querySelectorAll("[data-report]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.report === "disposal") showDisposalReport();
    else showClinicReports(btn.dataset.report);
  });
});

document.getElementById("page-external").addEventListener("submit", async (e) => {
  if (e.target.id !== "external-supply-form") return;
  e.preventDefault();
  await addExternalSupply(e.target);
});

document.getElementById("page-external").addEventListener("click", async (e) => {
  const button = e.target.closest("[data-del-external]");
  if (!button) return;
  await removeExternalSupply(button.dataset.delExternal);
});

document.getElementById("page-requests").addEventListener("click", async (e) => {
  const openBtn = e.target.closest("[data-open-page]");
  if (openBtn) {
    openPage(openBtn.dataset.openPage);
    return;
  }
  const tab = e.target.closest("[data-request-tab]");
  if (tab) {
    requestTab = tab.dataset.requestTab;
    renderRequests();
    return;
  }
  const acceptBtn = e.target.closest("[data-accept-request]");
  if (acceptBtn) {
    await acceptRequest(acceptBtn.dataset.acceptRequest);
    return;
  }
  const rejectBtn = e.target.closest("[data-reject-request]");
  if (rejectBtn) {
    await rejectRequest(rejectBtn.dataset.rejectRequest);
    return;
  }
  const editBtn = e.target.closest("[data-edit-request]");
  if (editBtn) {
    openEditRequest(editBtn.dataset.editRequest);
    return;
  }
  const printBtn = e.target.closest("[data-print-request]");
  if (printBtn) {
    printRequest(printBtn.dataset.printRequest);
    return;
  }
  const saveBtn = e.target.closest("[data-save-request]");
  if (saveBtn) {
    const req = (state.requests || []).find((row) => row.id === saveBtn.dataset.saveRequest);
    if (!req || !isManager()) return;
    req.saved = true;
    await recordActivity("request_save", `${requestKindLabel(req.kind)} — ${req.productName} — ${req.quantity}`);
    const ok = await persistRequest(req);
    if (ok) alert(t("requestSaved"));
  }
});

document.getElementById("page-requests").addEventListener("submit", async (e) => {
  const form = e.target.closest("[data-request-form]");
  if (!form) return;
  e.preventDefault();
  await submitRequest(form);
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
      expiryDate: form.dataset.supplyForm === "emergency" ? "" : data.get("expiryDate") || "",
      damaged: form.dataset.supplyForm === "emergency" ? false : data.get("damaged") === "on",
      updatedAt: todayISO(),
    };
    const result = await insertSupply(item, state.suppliers);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    if (result.row.expiryDate === undefined) result.row.expiryDate = item.expiryDate || "";
    if (result.row.damaged === undefined) result.row.damaged = item.damaged === true;
    state.supplyItems.unshift(result.row);
    await logPrice(result.row);
    await recordActivity("supply_add", item.itemName);
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
  await recordActivity("vendor_add", vendor.name);
  e.target.reset();
  persist();
});

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", async (e) => {
  if (e.target.id === "modal") closeModal();
  const userBtn = e.target.closest("[data-user-action]");
  if (!userBtn) return;
  const password = document.getElementById("admin-pass")?.value || "";
  if (!/^\d{6}$/.test(password)) {
    alert(t("passwordRule"));
    return;
  }
  const action = userBtn.dataset.userAction;
  const target = userBtn.dataset.userTarget;
  if (target === state.session?.username) return;
  const result = await manageAppUser({
    p_actor: state.session?.username || "",
    p_password: password,
    p_action: action,
    p_target: target,
  });
  if (result.error || result.ok === false) {
    alert(userAdminMessage(result.message || result.error));
    return;
  }
  const userAction = action === "ban" ? "user_ban" : action === "unban" ? "user_unban" : action === "reset" ? "user_reset" : "";
  if (userAction) await recordActivity(userAction, target);
  if (action === "reset" && result.password) showNewCredentials(result.username || target, result.password);
  else {
    const listed = await listAppUsers(state.session?.username || "", password);
    if (listed.error) alert(userAdminMessage(listed.error));
    else renderUserTable(listed.users);
  }
});
document.getElementById("modal").addEventListener("change", (e) => {
  if (e.target.id !== "new-user-role") return;
  const staff = e.target.value === "staff";
  const clinicWrap = document.getElementById("new-user-clinic-wrap");
  const kindWrap = document.getElementById("new-user-kind-wrap");
  if (clinicWrap) clinicWrap.hidden = !staff;
  if (kindWrap) kindWrap.hidden = !staff;
});
document.getElementById("modal").addEventListener("submit", async (e) => {
  if (e.target.id === "user-auth-form") {
    e.preventDefault();
    const password = document.getElementById("admin-pass")?.value || "";
    const listed = await listAppUsers(state.session?.username || "", password);
    if (listed.error) {
      alert(userAdminMessage(listed.error));
      return;
    }
    renderUserTable(listed.users);
    return;
  }
  if (e.target.id === "user-create-form") {
    e.preventDefault();
    const password = document.getElementById("admin-pass")?.value || "";
    if (!/^\d{6}$/.test(password)) {
      alert(t("passwordRule"));
      return;
    }
    const data = new FormData(e.target);
    const role = data.get("role");
    const result = await manageAppUser({
      p_actor: state.session?.username || "",
      p_password: password,
      p_action: "create",
      p_role: role,
      p_clinic_id: role === "staff" ? data.get("clinicId") : "",
      p_staff_kind: role === "staff" ? data.get("staffKind") : "",
    });
    if (result.error || result.ok === false) {
      alert(userAdminMessage(result.message || result.error));
      return;
    }
    await recordActivity("user_create", `${result.username} — ${role === "staff" ? (data.get("staffKind") === "nurse" ? t("roleNurse") : t("roleDoctor")) : role === "deputy" ? t("roleDeputy") : t("roleAdmin")}`);
    showNewCredentials(result.username, result.password);
    return;
  }
  if (e.target.id === "request-edit-form") {
    e.preventDefault();
    const data = new FormData(e.target);
    const req = (state.requests || []).find((row) => row.id === data.get("id"));
    if (!req || !isManager()) return;
    req.quantity = Number(data.get("quantity")) || req.quantity;
    req.note = String(data.get("note") || "").trim();
    req.saved = true;
    closeModal();
    await recordActivity("request_edit", `${requestKindLabel(req.kind)} — ${req.productName} — ${req.quantity}`);
    await persistRequest(req);
    return;
  }
  if (e.target.id === "clinic-names-form") {
    e.preventDefault();
    const data = new FormData(e.target);
    const names = {};
    for (const clinic of CLINICS) {
      const value = String(data.get(clinic.id) || "").trim();
      if (!value) return;
      names[clinic.id] = value;
    }
    const result = await upsertClinicNames(names);
    if (result.error) {
      notifyDbError(result.error);
      return;
    }
    state.clinicNames = names;
    await recordActivity("clinic_names", "");
    persist();
    closeModal();
    return;
  }
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
      const expiryInput = document.getElementById("ei-expiry");
      const damagedInput = document.getElementById("ei-damaged");
      if (expiryInput) item.expiryDate = expiryInput.value || "";
      if (damagedInput) item.damaged = damagedInput.checked;
      item.updatedAt = todayISO();
      const result = await updateSupply(item, state.suppliers);
      if (result.error) {
        notifyDbError(result.error);
        return;
      }
      applySavedSupply(item, result.row || item);
      await logPrice(item);
      await recordActivity("supply_update", item.itemName);
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
    const removedVendor = state.suppliers.find((s) => s.id === id);
    await deleteVendor(id);
    state.suppliers = state.suppliers.filter((s) => s.id !== id);
    await recordActivity("vendor_delete", removedVendor?.name || "");
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
    const removedItem = state.supplyItems.find((i) => String(i.id) === String(id));
    state.supplyItems = state.supplyItems.filter((i) => String(i.id) !== String(id));
    if (!state.deletedSupplyIds.includes(id)) state.deletedSupplyIds.push(id);
    await recordActivity("supply_delete", removedItem?.itemName || "");
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
    await recordActivity("withdrawal_delete", withdrawn ? `${clinicName(withdrawn.clinicId)} — ${withdrawn.productName} — ${withdrawn.quantity}` : "");
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

async function mergeRemoteRows(localRows, cloudRows, saveFn) {
  const byId = new Map((cloudRows || []).map((row) => [String(row.id), row]));
  for (const row of localRows || []) {
    if (!row?.id || byId.has(String(row.id))) continue;
    const saved = await saveFn(row);
    if (saved?.error) continue;
    const next = saved?.row || row;
    if (next?.id) byId.set(String(next.id), next);
  }
  return [...byId.values()];
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
  const expiryReady = wantEmergency ? true : await ensureDentalExpiryColumns();
  const withMeta = (row) => {
    if (expiryReady || wantEmergency) {
      return { ...row, expiryDate: row.expiryDate || "", damaged: row.damaged === true };
    }
    const local = current.find((item) => sameRecord(row, item) || sameRecord(item, row));
    return {
      ...row,
      expiryDate: local?.expiryDate || "",
      damaged: local?.damaged === true,
    };
  };
  if (!cloud.length) {
    const uploaded = await uploadLocalRows(current, (item) =>
      insertSupply({ ...item, category: wantEmergency ? "emergency" : "dental" }, state.suppliers)
    );
    state.supplyItems = [...other, ...uploaded.map(withMeta)];
    return;
  }
  const extras = current.filter((item) => !cloud.some((row) => sameRecord(row, item)));
  const uploaded = extras.length
    ? await uploadLocalRows(extras, (item) =>
        insertSupply({ ...item, category: wantEmergency ? "emergency" : "dental" }, state.suppliers)
      )
    : [];
  state.supplyItems = [...other, ...cloud.map(withMeta), ...uploaded.map(withMeta)];
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

  const disposalCloud = result.disposalLog;
  if (!Array.isArray(state.disposals)) state.disposals = [];
  if (disposalCloud && !disposalCloud.missing && !disposalCloud.error) {
    const cloudDisposals = disposalCloud.rows || [];
    if (cloudDisposals.length) {
      const byId = new Map(cloudDisposals.map((row) => [String(row.id), row]));
      state.disposals.forEach((row) => {
        if (row.id && !byId.has(String(row.id))) byId.set(String(row.id), row);
      });
      state.disposals = [...byId.values()];
    } else if (state.disposals.length) {
      state.disposals = await uploadLocalRows(state.disposals, insertDisposal);
    }
  }

  const clinicCloud = result.clinicNames;
  if (!state.clinicNames || typeof state.clinicNames !== "object") state.clinicNames = {};
  if (clinicCloud && !clinicCloud.missing && !clinicCloud.error) {
    const cloudNames = clinicCloud.names || {};
    if (Object.keys(cloudNames).length) state.clinicNames = { ...state.clinicNames, ...cloudNames };
    else if (Object.keys(state.clinicNames).length) await upsertClinicNames(state.clinicNames);
  }

  if (!Array.isArray(state.requests)) state.requests = [];
  if (!Array.isArray(state.clinicStock)) state.clinicStock = [];
  const requestCloud = result.supplyRequests;
  if (requestCloud && !requestCloud.missing && !requestCloud.error) {
    state.requests = await mergeRemoteRows(state.requests, requestCloud.rows || [], saveSupplyRequest);
  }
  const stockCloud = result.clinicInventory;
  if (stockCloud && !stockCloud.missing && !stockCloud.error) {
    state.clinicStock = await mergeRemoteRows(state.clinicStock, stockCloud.rows || [], saveClinicStock);
  }
  if (!Array.isArray(state.externalSupplies)) state.externalSupplies = [];
  const externalCloud = result.externalSupplies;
  if (externalCloud && !externalCloud.missing && !externalCloud.error) {
    state.externalSupplies = await mergeRemoteRows(state.externalSupplies, externalCloud.rows || [], saveExternalSupply);
  }
  if (!Array.isArray(state.activityLog)) state.activityLog = [];
  const activityCloud = result.activityLog;
  if (activityCloud && !activityCloud.missing && !activityCloud.error) {
    state.activityLog = await mergeRemoteRows(state.activityLog, activityCloud.rows || [], saveActivity);
  }

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
  const fields = CLINICS.map(
    (clinic) => `<div class="full"><label>${defaultClinicName(clinic.id)}</label><input name="${clinic.id}" value="${escapeAttr(clinicName(clinic.id))}" required /></div>`
  ).join("");
  return `
    <h3>${t("clinicNames")}</h3>
    <form class="form-grid" id="clinic-names-form">
      ${fields}
      <div class="full"><button class="btn btn-primary" type="submit">${t("saveClinicNames")}</button></div>
    </form>
    ${userAdminHtml()}
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
  if (kind === "activity") {
    const box = document.getElementById("activity-log");
    printHtml(box ? box.innerHTML : "", t("activityLog"));
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

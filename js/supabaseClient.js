import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("مفاتيح Supabase غير موجودة. تحقق من ملف .env");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function ignorableWriteError(message) {
  return /invalid input syntax|row-level security|permission denied|42501|jwt/i.test(String(message || ""));
}

const DOCTOR_BY_CLINIC = {
  ahmed: "د. أحمد",
  faten: "د. فاتن",
  sara: "د. سارة",
};

export const WITHDRAWAL_TABLES = {
  ahmed: "withdrawals_dr_ahmed",
  faten: "withdrawals_dr_faten",
  sara: "withdrawals_dr_sara",
};

function parseJson(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function clinicIdFromDoctor(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("فاتن") || n.includes("faten")) return "faten";
  if (n.includes("سارة") || n.includes("sara") || n.includes("sarah")) return "sara";
  return "ahmed";
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export async function testSupabaseConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, message: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY" };
  }
  try {
    const { error } = await supabase.auth.getSession();
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Connected" };
  } catch (err) {
    return { ok: false, message: err.message || String(err) };
  }
}

export function mapSupplyRow(row) {
  const extra = parseJson(row.category) || {};
  const categoryIsMeta = extra && (extra.type != null || extra.price != null || extra.supplierId != null);
  return {
    id: row.id,
    category: categoryIsMeta ? extra.category || "medical" : row.category || "medical",
    itemName: row.item_name || extra.itemName || "",
    unit: row.unit || extra.unit || "",
    type: row.item_type || extra.type || "",
    supplierId: row.supplier_id || extra.supplierId || "",
    supplierName: extra.supplierName || "",
    price: Number(row.price ?? extra.price) || 0,
    stock: extra.stock == null || extra.stock === "" ? null : Number(extra.stock),
    updatedAt: dateOnly(row.updated_at || extra.updatedAt || row.created_at),
  };
}

export function mapVendorRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    contact: row.contact || row.contact_person || "",
    phone: row.phone || "",
    email: row.email || "",
    notes: row.notes || "",
  };
}

function vendorPayload(vendor) {
  return {
    name: vendor.name || "",
    contact: vendor.contact || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    notes: vendor.notes || "",
  };
}

export function mapWithdrawalRow(row, clinicId) {
  const extra = parseJson(row.notes) || {};
  return {
    id: row.id,
    clinicId: clinicId || extra.clinicId || clinicIdFromDoctor(row.doctor_name),
    productId: row.product_id || extra.productId || "",
    productName: row.product_name || extra.productName || extra.itemName || "",
    date: dateOnly(row.withdrawal_date || extra.date),
    quantity: Number(row.quantity ?? extra.quantity ?? extra.qty) || 0,
    requester: row.requester || extra.requester || "",
    unitPrice: Number(row.unit_price ?? extra.unitPrice ?? extra.price) || 0,
  };
}

export function mapReportRow(row) {
  const extra = parseJson(row.summary) || {};
  return {
    id: row.id,
    title: row.title || extra.title || "",
    reportType: row.report_type || extra.reportType || extra.kind || "",
    clinicId: extra.clinicId || "",
    total: Number(extra.total) || 0,
    items: Array.isArray(extra.items) ? extra.items : [],
    createdAt: row.created_at || extra.createdAt || "",
  };
}

function supplyPayload(item, suppliers = []) {
  const vendor = suppliers.find((s) => s.id === item.supplierId);
  return {
    item_name: item.itemName,
    unit: item.unit,
    category: JSON.stringify({
      category: item.category || "medical",
      type: item.type || "",
      supplierId: item.supplierId || "",
      supplierName: vendor?.name || "",
      price: Number(item.price) || 0,
      stock: item.stock == null || item.stock === "" ? null : Number(item.stock),
      updatedAt: item.updatedAt || dateOnly(new Date().toISOString()),
    }),
  };
}

function withdrawalPayload(row) {
  return {
    product_name: row.productName || "",
    product_id: row.productId || "",
    withdrawal_date: row.date,
    quantity: Number(row.quantity) || 0,
    requester: row.requester || "",
    unit_price: Number(row.unitPrice) || 0,
  };
}

function legacyWithdrawalPayload(row) {
  return {
    doctor_name: DOCTOR_BY_CLINIC[row.clinicId] || row.clinicId,
    withdrawal_date: row.date,
    notes: JSON.stringify({
      clinicId: row.clinicId,
      productId: row.productId || "",
      productName: row.productName || "",
      quantity: Number(row.quantity) || 0,
      requester: row.requester || "",
      unitPrice: Number(row.unitPrice) || 0,
    }),
  };
}

function errorText(error) {
  if (!error) return "save failed";
  return error.message || String(error);
}

function missingTable(error) {
  const msg = error?.message || "";
  const code = error?.code || "";
  return code === "PGRST205" || code === "42P01" || /schema cache|does not exist|could not find the table/i.test(msg);
}

function dentalPayload(item, suppliers = []) {
  const vendor = suppliers.find((s) => s.id === item.supplierId);
  return {
    item_name: item.itemName || "",
    unit: item.unit || "",
    item_type: item.type || "",
    supplier_id: String(item.supplierId || ""),
    supplier_name: vendor?.name || item.supplierName || "",
    price: Number(item.price) || 0,
    stock: item.stock == null || item.stock === "" ? null : Number(item.stock),
    updated_at: new Date().toISOString(),
  };
}

function emergencyPayload(item, suppliers = []) {
  const vendor = suppliers.find((s) => s.id === item.supplierId);
  const payload = dentalPayload(item, suppliers);
  delete payload.stock;
  payload.supplier_name = vendor?.name || item.supplierName || "";
  return payload;
}

export function mapDentalRow(row) {
  return {
    id: row.id,
    sourceId: row.source_id || "",
    category: "dental",
    itemName: row.item_name || "",
    unit: row.unit || "",
    type: row.item_type || "",
    supplierId: row.supplier_id || "",
    supplierName: row.supplier_name || "",
    price: Number(row.price) || 0,
    stock: row.stock == null || row.stock === "" ? null : Number(row.stock),
    updatedAt: dateOnly(row.updated_at || row.created_at),
  };
}

export function mapEmergencyRow(row) {
  return {
    ...mapDentalRow(row),
    category: "emergency",
    stock: null,
  };
}

export function mapWithdrawalLogRow(row) {
  return {
    id: row.id,
    sourceId: row.source_id || "",
    clinicId: row.clinic_id || "",
    productId: row.product_id || "",
    productName: row.product_name || "",
    date: dateOnly(row.withdrawal_date),
    quantity: Number(row.quantity) || 0,
    requester: row.requester || "",
    unitPrice: Number(row.unit_price) || 0,
    affectsStock: row.affects_stock === true,
  };
}

async function fetchOptional(table, mapFn, order) {
  let query = supabase.from(table).select("*");
  if (order) query = query.order(order.column, { ascending: order.ascending });
  const { data, error } = await query;
  if (error && missingTable(error)) return { rows: [], missing: true, error: null };
  if (error) return { rows: [], missing: false, error: error.message };
  return { rows: (data || []).map(mapFn), missing: false, error: null };
}

async function findInventoryRow(table, id) {
  const key = String(id || "");
  if (!key) return { row: null, missing: false, error: null };
  if (isUuid(key)) {
    const byId = await supabase.from(table).select("*").eq("id", key).maybeSingle();
    if (byId.error && missingTable(byId.error)) return { row: null, missing: true, error: null };
    if (byId.error) return { row: null, missing: false, error: byId.error.message };
    if (byId.data) return { row: byId.data, missing: false, error: null };
  }
  const bySource = await supabase.from(table).select("*").eq("source_id", key).maybeSingle();
  if (bySource.error && missingTable(bySource.error)) return { row: null, missing: true, error: null };
  if (bySource.error) return { row: null, missing: false, error: bySource.error.message };
  return { row: bySource.data || null, missing: false, error: null };
}

async function saveInventoryItem(table, item, suppliers, mapFn, payloadFn) {
  const found = await findInventoryRow(table, item.id);
  if (found.missing) return { row: null, error: null, missing: true };
  if (found.error) return { row: null, error: found.error, missing: false };
  const payload = payloadFn(item, suppliers);
  if (found.row) {
    const { data, error } = await supabase.from(table).update(payload).eq("id", found.row.id).select().single();
    if (error) return { row: null, error: errorText(error), missing: false };
    return { row: mapFn(data), error: null, missing: false };
  }
  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, source_id: item.id ? String(item.id) : null })
    .select()
    .single();
  if (error && missingTable(error)) return { row: null, error: null, missing: true };
  if (error || !data) return { row: null, error: errorText(error), missing: false };
  return { row: mapFn(data), error: null, missing: false };
}

async function insertWithFallback(table, payloads) {
  let lastError = null;
  for (const payload of payloads) {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (!error && data) return { data, error: null };
    lastError = error;
    const msg = error?.message || "";
    if (/row-level security|permission denied|42501/i.test(msg)) break;
  }
  return { data: null, error: lastError };
}

function reportPayload(report) {
  return {
    title: report.title,
    report_type: report.reportType || report.kind,
    summary: JSON.stringify({
      kind: report.reportType || report.kind,
      clinicId: report.clinicId || "",
      total: Number(report.total) || 0,
      items: report.items || [],
      createdAt: dateOnly(new Date().toISOString()),
    }),
  };
}

export async function fetchSupplies() {
  const { data, error } = await supabase.from("supplies").select("*").order("created_at", { ascending: false });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []).map(mapSupplyRow), error: null };
}

export async function insertSupply(item, suppliers) {
  const table = item?.category === "emergency" ? "emergency_supplies" : "dental_warehouse";
  const mapFn = item?.category === "emergency" ? mapEmergencyRow : mapDentalRow;
  const payloadFn = item?.category === "emergency" ? emergencyPayload : dentalPayload;
  const saved = await saveInventoryItem(table, item, suppliers, mapFn, payloadFn);
  if (!saved.missing) return { row: saved.row, error: saved.error };
  const base = supplyPayload(item, suppliers);
  const { data, error } = await insertWithFallback("supplies", [base]);
  if (!data) return { row: null, error: errorText(error) };
  return { row: mapSupplyRow(data), error: null };
}

export async function updateSupply(item, suppliers) {
  const table = item?.category === "emergency" ? "emergency_supplies" : "dental_warehouse";
  const mapFn = item?.category === "emergency" ? mapEmergencyRow : mapDentalRow;
  const payloadFn = item?.category === "emergency" ? emergencyPayload : dentalPayload;
  const saved = await saveInventoryItem(table, item, suppliers, mapFn, payloadFn);
  if (!saved.missing) return { row: saved.row, error: saved.error };
  if (!isUuid(item.id)) return { row: { ...item }, error: null };
  const { data, error } = await supabase.from("supplies").update(supplyPayload(item, suppliers)).eq("id", item.id).select().single();
  if (error) return { row: null, error: error.message };
  return { row: mapSupplyRow(data), error: null };
}

async function deleteFromTable(table, id) {
  const key = String(id || "");
  if (!key) return { deleted: false, missing: false, error: null };
  let removed = false;
  if (isUuid(key)) {
    const byId = await supabase.from(table).delete().eq("id", key).select("id");
    if (byId.error && missingTable(byId.error)) return { deleted: false, missing: true, error: null };
    if (byId.error && !ignorableWriteError(byId.error.message)) return { deleted: false, missing: false, error: byId.error.message };
    if (byId.data?.length) removed = true;
  }
  const bySource = await supabase.from(table).delete().eq("source_id", key).select("id");
  if (bySource.error && missingTable(bySource.error)) return { deleted: removed, missing: !removed, error: null };
  if (bySource.error && !ignorableWriteError(bySource.error.message)) return { deleted: removed, missing: false, error: bySource.error.message };
  if (bySource.data?.length) removed = true;
  return { deleted: removed, missing: false, error: null };
}

export async function deleteSupply(id) {
  const dental = await deleteFromTable("dental_warehouse", id);
  if (dental.error) return { error: dental.error };
  const emergency = await deleteFromTable("emergency_supplies", id);
  if (emergency.error) return { error: emergency.error };
  if (!isUuid(id)) return { error: null };
  const { error } = await supabase.from("supplies").delete().eq("id", id);
  if (!error || ignorableWriteError(error.message)) return { error: null };
  return { error: error.message };
}

export async function fetchDentalWarehouse() {
  return fetchOptional("dental_warehouse", mapDentalRow, { column: "item_name", ascending: true });
}

export async function fetchEmergencySupplies() {
  return fetchOptional("emergency_supplies", mapEmergencyRow, { column: "item_name", ascending: true });
}

export async function fetchWithdrawalLog() {
  return fetchOptional("withdrawal_log", mapWithdrawalLogRow, { column: "withdrawal_date", ascending: false });
}

export async function fetchDentalStock(productId) {
  const found = await findInventoryRow("dental_warehouse", productId);
  if (found.missing) return { found: false, missing: true, stock: null };
  if (!found.row) return { found: false, missing: false, stock: null };
  return {
    found: true,
    missing: false,
    stock: found.row.stock == null || found.row.stock === "" ? null : Number(found.row.stock),
  };
}

export async function insertWithdrawalLog(row) {
  const payload = {
    clinic_id: row.clinicId || "",
    product_id: String(row.productId || ""),
    product_name: row.productName || "",
    withdrawal_date: row.date,
    quantity: Number(row.quantity) || 0,
    requester: row.requester || "",
    unit_price: Number(row.unitPrice) || 0,
    affects_stock: row.affectsStock === true,
    source_id: row.sourceId ? String(row.sourceId) : null,
  };
  const { data, error } = await supabase.from("withdrawal_log").insert(payload).select().single();
  if (error && missingTable(error)) return { row: null, error: null, missing: true, stock: null };
  if (error || !data) return { row: null, error: errorText(error), missing: false, stock: null };
  const stock = payload.affects_stock ? await fetchDentalStock(payload.product_id) : null;
  return {
    row: mapWithdrawalLogRow(data),
    error: null,
    missing: false,
    stock: stock?.found ? stock.stock : null,
  };
}

export async function fetchWithdrawals() {
  const rows = [];
  for (const [clinicId, table] of Object.entries(WITHDRAWAL_TABLES)) {
    const { data, error } = await supabase.from(table).select("*").order("withdrawal_date", { ascending: false });
    if (error) continue;
    rows.push(...(data || []).map((row) => mapWithdrawalRow(row, clinicId)));
  }
  if (!rows.length) {
    const { data, error } = await supabase.from("doctor_withdrawals").select("*").order("withdrawal_date", { ascending: false });
    if (error) return { rows: [], error: error.message };
    return { rows: (data || []).map((row) => mapWithdrawalRow(row)), error: null };
  }
  return { rows, error: null };
}

export async function insertWithdrawal(row) {
  const table = WITHDRAWAL_TABLES[row.clinicId] || WITHDRAWAL_TABLES.ahmed;
  const primary = await insertWithFallback(table, [withdrawalPayload(row)]);
  if (primary.data) return { row: mapWithdrawalRow(primary.data, row.clinicId), error: null };
  const legacy = await insertWithFallback("doctor_withdrawals", [legacyWithdrawalPayload(row)]);
  if (legacy.data) return { row: mapWithdrawalRow(legacy.data, row.clinicId), error: null };
  return { row: null, error: errorText(legacy.error || primary.error) };
}

export async function deleteWithdrawal(id, clinicId) {
  if (!id) return { error: null };
  const fromLog = await deleteFromTable("withdrawal_log", id);
  if (fromLog.error) return { error: fromLog.error, fromLog: false };
  if (fromLog.deleted) return { error: null, fromLog: true };
  const preferred = WITHDRAWAL_TABLES[clinicId];
  const tables = preferred
    ? [preferred, ...Object.values(WITHDRAWAL_TABLES).filter((name) => name !== preferred), "doctor_withdrawals"]
    : [...Object.values(WITHDRAWAL_TABLES), "doctor_withdrawals"];
  let deleted = false;
  let lastError = null;
  for (const table of tables) {
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    if (error) {
      lastError = error;
      continue;
    }
    if (data && data.length) deleted = true;
  }
  if (deleted) return { error: null };
  if (lastError && !ignorableWriteError(lastError.message)) return { error: lastError.message };
  return { error: null };
}

export async function fetchReports() {
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []).map(mapReportRow), error: null };
}

export async function insertReport(report) {
  const { data, error } = await insertWithFallback("reports", [reportPayload(report)]);
  if (!data) return { row: null, error: errorText(error) };
  return { row: mapReportRow(data), error: null };
}

export function mapArchiveWithdrawalRow(row) {
  return {
    id: row.id,
    clinicId: row.clinic_id || "",
    productId: row.product_id || "",
    productName: row.product_name || "",
    date: dateOnly(row.withdrawal_date),
    quantity: Number(row.quantity) || 0,
    requester: row.requester || "",
    unitPrice: Number(row.unit_price) || 0,
    sourceId: row.source_id || "",
  };
}

export function mapArchivePriceRow(row) {
  return {
    id: row.id,
    itemId: row.item_id || "",
    itemName: row.item_name || "",
    type: row.item_type || "",
    unit: row.unit || "",
    supplierId: row.supplier_id || "",
    supplierName: row.supplier_name || "",
    price: Number(row.price) || 0,
    date: dateOnly(row.recorded_date),
  };
}

export async function fetchArchiveWithdrawals() {
  const { data, error } = await supabase.from("archive_withdrawals").select("*").order("withdrawal_date", { ascending: false });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []).map(mapArchiveWithdrawalRow), error: null };
}

export async function deleteArchiveWithdrawal(id) {
  const key = String(id || "");
  if (!key) return { error: null };
  if (isUuid(key)) {
    const byId = await supabase.from("archive_withdrawals").delete().eq("id", key).select("id");
    if (byId.error && !missingTable(byId.error) && !ignorableWriteError(byId.error.message)) return { error: byId.error.message };
  }
  const bySource = await supabase.from("archive_withdrawals").delete().eq("source_id", key).select("id");
  if (bySource.error && !missingTable(bySource.error) && !ignorableWriteError(bySource.error.message)) return { error: bySource.error.message };
  return { error: null };
}

export async function insertArchiveWithdrawal(row) {
  const payload = {
    clinic_id: row.clinicId || "",
    product_name: row.productName || "",
    product_id: row.productId || "",
    withdrawal_date: row.date,
    quantity: Number(row.quantity) || 0,
    requester: row.requester || "",
    unit_price: Number(row.unitPrice) || 0,
    source_id: String(row.sourceId || row.id || ""),
  };
  const { data, error } = await insertWithFallback("archive_withdrawals", [payload]);
  if (!data) return { row: null, error: errorText(error) };
  return { row: mapArchiveWithdrawalRow(data), error: null };
}

export async function fetchArchivePrices() {
  const { data, error } = await supabase.from("archive_prices").select("*").order("recorded_date", { ascending: false });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []).map(mapArchivePriceRow), error: null };
}

export async function deleteArchivePrice(id) {
  const key = String(id || "");
  if (!key || !isUuid(key)) return { error: null };
  const { error } = await supabase.from("archive_prices").delete().eq("id", key);
  if (error && !missingTable(error) && !ignorableWriteError(error.message)) return { error: error.message };
  return { error: null };
}

export async function insertArchivePrice(row) {
  const payload = {
    item_id: String(row.itemId || ""),
    item_name: row.itemName || "",
    item_type: row.type || "",
    unit: row.unit || "",
    supplier_id: String(row.supplierId || ""),
    supplier_name: row.supplierName || "",
    price: Number(row.price) || 0,
    recorded_date: row.date,
  };
  const { data, error } = await insertWithFallback("archive_prices", [payload]);
  if (!data) return { row: null, error: errorText(error) };
  return { row: mapArchivePriceRow(data), error: null };
}

export async function fetchVendors() {
  for (const table of ["vendors", "suppliers"]) {
    const { data, error } = await supabase.from(table).select("*");
    if (!error) return { rows: (data || []).map(mapVendorRow), table, error: null };
  }
  return { rows: [], table: "vendors", error: null };
}

export async function insertVendor(vendor) {
  const { data, error } = await insertWithFallback("vendors", [vendorPayload(vendor)]);
  if (!data) return { row: null, error: errorText(error) };
  return { row: mapVendorRow(data), error: null };
}

export async function updateVendor(vendor) {
  if (!isUuid(vendor.id)) return { row: vendor, error: null };
  const { data, error } = await supabase.from("vendors").update(vendorPayload(vendor)).eq("id", vendor.id).select().single();
  if (error) return { row: vendor, error: null };
  return { row: mapVendorRow(data), error: null };
}

export async function deleteVendor(id) {
  if (!isUuid(id)) return { error: null };
  const { error } = await supabase.from("vendors").delete().eq("id", id).select("id");
  if (error && !ignorableWriteError(error.message)) return { error: error.message };
  return { error: null };
}

export async function fetchHospitalData() {
  const connection = await testSupabaseConnection();
  if (!connection.ok) {
    return { connection, tables: [], datasets: [] };
  }
  const tables = ["supplies", "reports", ...Object.values(WITHDRAWAL_TABLES)];
  const datasets = [];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(50);
    datasets.push({ table, rows: data || [], error: error ? error.message : null });
  }
  return { connection, tables, datasets };
}

export async function loginUser(username, password) {
  const { data, error } = await supabase.rpc("login_app_user", {
    p_username: username,
    p_password: password,
  });
  if (error) return { user: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.username) return { user: null, error: null };
  return {
    user: { username: row.username, letter: row.letter || "", color: row.color || "" },
    error: null,
  };
}

export async function loadProcurementData() {
  const connection = await testSupabaseConnection();
  if (!connection.ok) {
    return {
      connection,
      supplies: [],
      withdrawals: [],
      reports: [],
      vendors: [],
      archiveWithdrawals: [],
      archivePrices: [],
      error: connection.message,
    };
  }
  const [supplies, withdrawals, reports, vendors, archiveWithdrawals, archivePrices, dentalWarehouse, emergencySupplies, withdrawalLog] =
    await Promise.all([
      fetchSupplies(),
      fetchWithdrawals(),
      fetchReports(),
      fetchVendors(),
      fetchArchiveWithdrawals(),
      fetchArchivePrices(),
      fetchDentalWarehouse(),
      fetchEmergencySupplies(),
      fetchWithdrawalLog(),
    ]);
  const error =
    supplies.error ||
    withdrawals.error ||
    reports.error ||
    vendors.error ||
    archiveWithdrawals.error ||
    archivePrices.error ||
    dentalWarehouse.error ||
    emergencySupplies.error ||
    withdrawalLog.error;
  return {
    connection,
    supplies: supplies.rows,
    withdrawals: withdrawals.rows,
    reports: reports.rows,
    vendors: vendors.rows,
    archiveWithdrawals: archiveWithdrawals.rows,
    archivePrices: archivePrices.rows,
    dentalWarehouse,
    emergencySupplies,
    withdrawalLog,
    error,
  };
}

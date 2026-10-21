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

function localRowId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return "00000000-0000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
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
  const base = supplyPayload(item, suppliers);
  const { data, error } = await insertWithFallback("supplies", [base]);
  if (data) return { row: mapSupplyRow(data), error: null };
  return {
    row: {
      id: item.id || localRowId(),
      category: item.category || "medical",
      itemName: item.itemName,
      unit: item.unit,
      type: item.type || "",
      supplierId: item.supplierId || "",
      price: Number(item.price) || 0,
      updatedAt: item.updatedAt || dateOnly(new Date().toISOString()),
    },
    error: null,
  };
}

export async function updateSupply(item, suppliers) {
  const { data, error } = await supabase.from("supplies").update(supplyPayload(item, suppliers)).eq("id", item.id).select().single();
  if (error) return { row: null, error: error.message };
  return { row: mapSupplyRow(data), error: null };
}

export async function deleteSupply(id) {
  if (!isUuid(id)) return { error: null };
  const { error } = await supabase.from("supplies").delete().eq("id", id);
  if (!error) return { error: null };
  if (ignorableWriteError(error.message)) return { error: null };
  return { error: error.message };
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
  const { data } = await insertWithFallback(table, [withdrawalPayload(row)]);
  if (data) return { row: mapWithdrawalRow(data, row.clinicId), error: null };
  const legacy = await insertWithFallback("doctor_withdrawals", [legacyWithdrawalPayload(row)]);
  if (legacy.data) return { row: mapWithdrawalRow(legacy.data, row.clinicId), error: null };
  return {
    row: {
      id: row.id || localRowId(),
      clinicId: row.clinicId,
      productId: row.productId || "",
      productName: row.productName || "",
      date: row.date,
      quantity: Number(row.quantity) || 0,
      requester: row.requester || "",
      unitPrice: Number(row.unitPrice) || 0,
    },
    error: null,
  };
}

export async function deleteWithdrawal(id, clinicId) {
  if (!id) return { error: null };
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
  const { data } = await insertWithFallback("reports", [reportPayload(report)]);
  if (data) return { row: mapReportRow(data), error: null };
  return {
    row: {
      id: report.id || localRowId(),
      title: report.title,
      reportType: report.reportType || report.kind,
      clinicId: report.clinicId || "",
      total: Number(report.total) || 0,
      items: report.items || [],
      createdAt: dateOnly(new Date().toISOString()),
    },
    error: null,
  };
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
  const { data } = await insertWithFallback("archive_withdrawals", [payload]);
  if (data) return { row: mapArchiveWithdrawalRow(data), error: null };
  return { row: { ...row, id: row.id || localRowId() }, error: null };
}

export async function fetchArchivePrices() {
  const { data, error } = await supabase.from("archive_prices").select("*").order("recorded_date", { ascending: false });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []).map(mapArchivePriceRow), error: null };
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
  const { data } = await insertWithFallback("archive_prices", [payload]);
  if (data) return { row: mapArchivePriceRow(data), error: null };
  return { row: { ...row, id: row.id || localRowId() }, error: null };
}

export async function fetchVendors() {
  for (const table of ["vendors", "suppliers"]) {
    const { data, error } = await supabase.from(table).select("*");
    if (!error) return { rows: (data || []).map(mapVendorRow), table, error: null };
  }
  return { rows: [], table: "vendors", error: null };
}

export async function insertVendor(vendor) {
  const { data } = await insertWithFallback("vendors", [vendorPayload(vendor)]);
  if (data) return { row: mapVendorRow(data), error: null };
  return {
    row: {
      id: vendor.id || localRowId(),
      name: vendor.name || "",
      contact: vendor.contact || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      notes: vendor.notes || "",
    },
    error: null,
  };
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
  const [supplies, withdrawals, reports, vendors, archiveWithdrawals, archivePrices] = await Promise.all([
    fetchSupplies(),
    fetchWithdrawals(),
    fetchReports(),
    fetchVendors(),
    fetchArchiveWithdrawals(),
    fetchArchivePrices(),
  ]);
  const error =
    supplies.error || withdrawals.error || reports.error || vendors.error || archiveWithdrawals.error || archivePrices.error;
  return {
    connection,
    supplies: supplies.rows,
    withdrawals: withdrawals.rows,
    reports: reports.rows,
    vendors: vendors.rows,
    archiveWithdrawals: archiveWithdrawals.rows,
    archivePrices: archivePrices.rows,
    error,
  };
}

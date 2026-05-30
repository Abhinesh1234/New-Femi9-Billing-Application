import { fetchInvoices, fetchInvoice, fetchInvoiceActivity, type InvoiceListItem, type InvoiceDetail, type InvoiceActivityEntry } from "../services/invoiceApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST     =  3 * 60 * 1000; //  3 min
const TTL_DETAIL   =  5 * 60 * 1000; //  5 min
const TTL_ACTIVITY = 10 * 60 * 1000; // 10 min

export type { InvoiceListItem, InvoiceDetail, InvoiceActivityEntry };

export interface InvoiceListResult {
  data:  InvoiceListItem[];
  total: number;
}

// ── Cache stores ──────────────────────────────────────────────────────────────

const listCache     = new TTLCache<string, InvoiceListResult>("invoice-list");
const detailCache   = new TTLCache<number, InvoiceDetail>("invoice-detail");
const activityCache = new TTLCache<number, InvoiceActivityEntry[]>("invoice-activity");

// ── List cache key (encodes filter dimensions) ────────────────────────────────

function listKey(catId?: number | null, trashed?: boolean): string {
  return JSON.stringify({ cat: catId ?? null, trashed: trashed ?? false });
}

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readInvoiceList(catId?: number | null, trashed?: boolean): InvoiceListResult | undefined {
  return listCache.read(listKey(catId, trashed));
}

export function readInvoiceDetail(id: number): InvoiceDetail | undefined {
  return detailCache.read(id);
}

export function readInvoiceActivity(id: number): InvoiceActivityEntry[] | undefined {
  return activityCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getInvoiceList(params?: {
  distribution_category_id?: number | null;
  trashed?: boolean;
}): Promise<InvoiceListResult> {
  const catId   = params?.distribution_category_id ?? null;
  const trashed = params?.trashed ?? false;
  const key     = listKey(catId, trashed);

  return listCache.resolve(key, TTL_LIST, async () => {
    const fetchParams: Parameters<typeof fetchInvoices>[0] = { per_page: 500 };
    if (catId !== null) fetchParams.distribution_category_id = catId;
    if (trashed) fetchParams.trashed = true;

    const res = await fetchInvoices(fetchParams);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch invoices.");
    return { data: res.data.data, total: res.data.total };
  });
}

export function getInvoiceDetail(id: number): Promise<InvoiceDetail> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchInvoice(id);
    if (!res.success) throw new Error((res as any).message ?? "Invoice not found.");
    return (res as any).data as InvoiceDetail;
  });
}

export function getInvoiceActivity(id: number): Promise<InvoiceActivityEntry[]> {
  return activityCache.resolve(id, TTL_ACTIVITY, async () => {
    const res = await fetchInvoiceActivity(id);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch activity.");
    return (res as any).data as InvoiceActivityEntry[];
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateInvoiceDetail(invoice: InvoiceDetail): void {
  detailCache.write(invoice.id, invoice, TTL_DETAIL);
}

export function hydrateInvoiceList(data: InvoiceListItem[], total: number, catId?: number | null, trashed?: boolean): void {
  listCache.write(listKey(catId, trashed), { data, total }, TTL_LIST);
}

// ── Invalidation (cascading bust) ─────────────────────────────────────────────

/** Bust a single invoice: its detail + activity + all list variants (cascading). */
export function bustInvoice(id: number): void {
  detailCache.bust(id);
  activityCache.bust(id);
  listCache.bustAll(); // Cascade — any list view may contain this invoice
}

/** Bust all list cache variants only (use after list-only mutations like filter changes). */
export function bustInvoiceList(): void {
  listCache.bustAll();
}

/** Wipe every invoice cache tier. */
export function bustAllInvoiceCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  activityCache.bustAll();
}

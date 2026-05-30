import { fetchCreditNotes, fetchCreditNote, fetchCreditNoteActivity, type CreditNoteListItem, type CreditNoteListResult, type CreditNoteDetail, type CreditNoteActivityEntry } from "../services/creditNoteApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST     =  3 * 60 * 1000; //  3 min
const TTL_DETAIL   =  5 * 60 * 1000; //  5 min
const TTL_ACTIVITY = 10 * 60 * 1000; // 10 min

export type { CreditNoteListItem, CreditNoteListResult, CreditNoteDetail, CreditNoteActivityEntry };

// ── Cache stores ───────────────────────────────────────────────────────────────

const listCache     = new TTLCache<string, CreditNoteListResult>("credit-note-list");
const detailCache   = new TTLCache<number, CreditNoteDetail>("credit-note-detail");
const activityCache = new TTLCache<number, CreditNoteActivityEntry[]>("credit-note-activity");

// ── List cache key ─────────────────────────────────────────────────────────────

function listKey(params?: { customer_id?: number | null }): string {
  return JSON.stringify({ customer_id: params?.customer_id ?? null });
}

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readCreditNoteList(params?: { customer_id?: number | null }): CreditNoteListResult | undefined {
  return listCache.read(listKey(params));
}

export function readCreditNoteDetail(id: number): CreditNoteDetail | undefined {
  return detailCache.read(id);
}

export function readCreditNoteActivity(id: number): CreditNoteActivityEntry[] | undefined {
  return activityCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getCreditNoteList(params?: { customer_id?: number | null }): Promise<CreditNoteListResult> {
  const key = listKey(params);
  return listCache.resolve(key, TTL_LIST, async () => {
    const fetchParams: Parameters<typeof fetchCreditNotes>[0] = { per_page: 500 };
    if (params?.customer_id) fetchParams.customer_id = params.customer_id;
    const res = await fetchCreditNotes(fetchParams);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch credit notes.");
    return { data: res.data.data, total: res.data.total };
  });
}

export function getCreditNoteDetail(id: number): Promise<CreditNoteDetail> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchCreditNote(id);
    if (!res.success) throw new Error((res as any).message ?? "Credit note not found.");
    return (res as any).data as CreditNoteDetail;
  });
}

export function getCreditNoteActivity(id: number): Promise<CreditNoteActivityEntry[]> {
  return activityCache.resolve(id, TTL_ACTIVITY, async () => {
    const res = await fetchCreditNoteActivity(id);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch activity.");
    return (res as any).data as CreditNoteActivityEntry[];
  });
}

// ── Hydration ─────────────────────────────────────────────────────────────────

export function hydrateCreditNoteList(data: CreditNoteListItem[], total: number, params?: { customer_id?: number | null }): void {
  listCache.write(listKey(params), { data, total }, TTL_LIST);
}

export function hydrateCreditNoteDetail(cn: CreditNoteDetail): void {
  detailCache.write(cn.id, cn, TTL_DETAIL);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustCreditNote(id: number): void {
  detailCache.bust(id);
  activityCache.bust(id);
  listCache.bustAll();
}

export function bustCreditNoteList(): void {
  listCache.bustAll();
}

export function bustAllCreditNoteCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  activityCache.bustAll();
}

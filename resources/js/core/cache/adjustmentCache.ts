import { fetchAdjustments, fetchAdjustment, type AdjustmentRecord } from "../services/adjustmentApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min

export type { AdjustmentRecord };

const listCache   = new TTLCache<"active" | "deleted", AdjustmentRecord[]>();
const detailCache = new TTLCache<number, AdjustmentRecord>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readAdjustmentList(trashed = false): AdjustmentRecord[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readAdjustmentDetail(id: number): AdjustmentRecord | undefined {
  return detailCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getAdjustmentList(trashed = false): Promise<AdjustmentRecord[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchAdjustments({ per_page: 500, trashed: trashed || undefined });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch adjustments.");
    const raw = (res as any).data;
    return (Array.isArray(raw) ? raw : raw?.data ?? []) as AdjustmentRecord[];
  });
}

export function getAdjustmentDetail(id: number): Promise<AdjustmentRecord> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchAdjustment(id);
    if (!res.success) throw new Error((res as any).message ?? "Adjustment not found.");
    return (res as any).data as AdjustmentRecord;
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateAdjustmentDetail(record: AdjustmentRecord): void {
  detailCache.write(record.id, record, TTL_DETAIL);
}

export function hydrateAdjustmentList(data: AdjustmentRecord[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single adjustment: its detail and both list caches. */
export function bustAdjustment(id: number): void {
  detailCache.bust(id);
  listCache.bustAll();
}

/** Wipe everything — use before a hard refresh. */
export function bustAllAdjustmentCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
}

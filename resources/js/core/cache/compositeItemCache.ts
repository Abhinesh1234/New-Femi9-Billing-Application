import { fetchCompositeItems, fetchCompositeItem, type CompositeItemRecord } from "../services/compositeItemApi";
import { fetchCompositeItemAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min
const TTL_AUDIT  = 10 * 60 * 1000; // 10 min

export type { CompositeItemRecord, AuditLogEntry };

export interface AuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const listCache   = new TTLCache<"active" | "deleted", CompositeItemRecord[]>();
const detailCache = new TTLCache<number, CompositeItemRecord>();
const auditCache  = new TTLCache<string, AuditPage>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readCompositeItemList(trashed = false): CompositeItemRecord[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readCompositeItemDetail(id: number): CompositeItemRecord | undefined {
  return detailCache.read(id);
}

export function readCompositeItemAuditLogs(id: number, page: number): AuditPage | undefined {
  return auditCache.read(`${id}-${page}`);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getCompositeItemList(trashed = false): Promise<CompositeItemRecord[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchCompositeItems({ per_page: 500, trashed: trashed || undefined });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch composite items.");
    return (res as any).data.data as CompositeItemRecord[];
  });
}

export function getCompositeItemDetail(id: number): Promise<CompositeItemRecord> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchCompositeItem(id);
    if (!res.success) throw new Error((res as any).message ?? "Composite item not found.");
    return (res as any).data as CompositeItemRecord;
  });
}

export function getCompositeItemAuditLogs(id: number, page: number): Promise<AuditPage> {
  const key = `${id}-${page}`;
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchCompositeItemAuditLogs(id, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data.data, lastPage: res.data.last_page, total: res.data.total };
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateCompositeItemDetail(item: CompositeItemRecord): void {
  detailCache.write(item.id, item, TTL_DETAIL);
}

export function hydrateCompositeItemList(data: CompositeItemRecord[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustCompositeItem(id: number): void {
  detailCache.bust(id);
  auditCache.bustWhere(k => k.startsWith(`${id}-`));
  listCache.bustAll();
}

export function bustAllCompositeItemCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  auditCache.bustAll();
}

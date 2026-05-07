import { fetchItem, fetchItems, type ItemListRecord } from "../services/itemApi";
import { fetchItemAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min
const TTL_AUDIT  = 10 * 60 * 1000; // 10 min

export type { ItemListRecord, AuditLogEntry };

export interface AuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const listCache   = new TTLCache<"active" | "deleted", ItemListRecord[]>();
const detailCache = new TTLCache<number, Record<string, any>>();
const auditCache  = new TTLCache<string, AuditPage>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readItemList(trashed = false): ItemListRecord[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readItemDetail(id: number): Record<string, any> | undefined {
  return detailCache.read(id);
}

export function readItemAuditLogs(id: number, page: number): AuditPage | undefined {
  return auditCache.read(`${id}-${page}`);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getItemList(trashed = false): Promise<ItemListRecord[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchItems({ per_page: 500, trashed: trashed || undefined });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch items.");
    return (res as any).data.data as ItemListRecord[];
  });
}

export function getItemDetail(id: number): Promise<Record<string, any>> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchItem(id);
    if (!res.success) throw new Error((res as any).message ?? "Item not found.");
    return (res as any).data as Record<string, any>;
  });
}

export function getItemAuditLogs(id: number, page: number): Promise<AuditPage> {
  const key = `${id}-${page}`;
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchItemAuditLogs(id, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data.data, lastPage: res.data.last_page, total: res.data.total };
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateItemDetail(item: Record<string, any>): void {
  detailCache.write(item.id as number, item, TTL_DETAIL);
}

export function hydrateItemList(data: ItemListRecord[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single item: its detail, all its audit pages, and both list caches. */
export function bustItem(id: number): void {
  detailCache.bust(id);
  auditCache.bustWhere(k => k.startsWith(`${id}-`));
  listCache.bustAll();
}

/** Wipe everything — use before a hard refresh. */
export function bustAllItemCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  auditCache.bustAll();
}

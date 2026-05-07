import { fetchPriceListsAll, fetchPriceList, type PriceListRecord } from "../services/priceListApi";
import { fetchPriceListAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min
const TTL_AUDIT  = 10 * 60 * 1000; // 10 min

export type { PriceListRecord, AuditLogEntry };

export interface AuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const listCache   = new TTLCache<"active" | "deleted", PriceListRecord[]>();
const detailCache = new TTLCache<number, PriceListRecord>();
const auditCache  = new TTLCache<string, AuditPage>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readPriceListList(trashed = false): PriceListRecord[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readPriceListDetail(id: number): PriceListRecord | undefined {
  return detailCache.read(id);
}

export function readPriceListAuditLogs(id: number, page: number): AuditPage | undefined {
  return auditCache.read(`${id}-${page}`);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getPriceListList(trashed = false): Promise<PriceListRecord[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, () => fetchPriceListsAll(trashed));
}

export function getPriceListDetail(id: number): Promise<PriceListRecord> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchPriceList(id);
    if (!res.success) throw new Error((res as any).message ?? "Price list not found.");
    return res.data as unknown as PriceListRecord;
  });
}

export function getPriceListAuditLogs(id: number, page: number): Promise<AuditPage> {
  const key = `${id}-${page}`;
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchPriceListAuditLogs(id, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data.data, lastPage: res.data.last_page, total: res.data.total };
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydratePriceListDetail(item: PriceListRecord): void {
  detailCache.write(item.id, item, TTL_DETAIL);
}

export function hydratePriceListList(data: PriceListRecord[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustPriceList(id: number): void {
  detailCache.bust(id);
  auditCache.bustWhere(k => k.startsWith(`${id}-`));
  listCache.bustAll();
}

export function bustPriceLists(): void {
  listCache.bustAll();
}

export function bustAllPriceListCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  auditCache.bustAll();
}

import { fetchSeries, showSeries, type SeriesItem } from "../services/seriesApi";
import { fetchSeriesAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min
const TTL_AUDIT  = 10 * 60 * 1000; // 10 min

export type { SeriesItem, AuditLogEntry };

export interface AuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const listCache   = new TTLCache<"active" | "deleted", SeriesItem[]>();
const detailCache = new TTLCache<number, SeriesItem>();
const auditCache  = new TTLCache<string, AuditPage>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readSeriesList(trashed = false): SeriesItem[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readSeriesDetail(id: number): SeriesItem | undefined {
  return detailCache.read(id);
}

export function readSeriesAuditLogs(id: number, page: number): AuditPage | undefined {
  return auditCache.read(`${id}-${page}`);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getSeriesList(trashed = false): Promise<SeriesItem[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchSeries(trashed ? { trashed: true } : undefined);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch series.");
    return res.data;
  });
}

export function getSeriesDetail(id: number): Promise<SeriesItem> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await showSeries(id);
    if (!res.success) throw new Error((res as any).message ?? "Series not found.");
    return res.data;
  });
}

export function getSeriesAuditLogs(id: number, page: number): Promise<AuditPage> {
  const key = `${id}-${page}`;
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchSeriesAuditLogs(id, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data.data, lastPage: res.data.last_page, total: res.data.total };
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateSeriesDetail(series: SeriesItem): void {
  detailCache.write(series.id, series, TTL_DETAIL);
}

export function hydrateSeriesList(data: SeriesItem[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single series: its detail, all its audit pages, and both list caches. */
export function bustSeries(id: number): void {
  detailCache.bust(id);
  auditCache.bustWhere(k => k.startsWith(`${id}-`));
  listCache.bustAll(); // a mutation on one series invalidates both active + deleted lists
}

/** Bust only the active/deleted list caches (e.g. after a search change). */
export function bustSeriesLists(): void {
  listCache.bustAll();
}

/** Wipe everything — use before a hard refresh. */
export function bustAllSeriesCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  auditCache.bustAll();
}

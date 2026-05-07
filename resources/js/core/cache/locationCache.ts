import { fetchLocation, fetchLocations, type LocationListItem } from "../services/locationApi";
import { fetchLocationAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min
const TTL_AUDIT  = 10 * 60 * 1000; // 10 min

export type { LocationListItem, AuditLogEntry };

export interface AuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const listCache   = new TTLCache<"active" | "deleted", LocationListItem[]>();
const detailCache = new TTLCache<number, LocationListItem>();
const auditCache  = new TTLCache<string, AuditPage>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readLocationList(trashed = false): LocationListItem[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readLocationDetail(id: number): LocationListItem | undefined {
  return detailCache.read(id);
}

export function readLocationAuditLogs(id: number, page: number): AuditPage | undefined {
  return auditCache.read(`${id}-${page}`);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getLocationList(trashed = false): Promise<LocationListItem[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchLocations(trashed ? { trashed: true } : undefined);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch locations.");
    return res.data;
  });
}

export function getLocationDetail(id: number): Promise<LocationListItem> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchLocation(id);
    if (!res.success) throw new Error((res as any).message ?? "Location not found.");
    return (res as any).data as LocationListItem;
  });
}

export function getLocationAuditLogs(id: number, page: number): Promise<AuditPage> {
  const key = `${id}-${page}`;
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchLocationAuditLogs(id, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data.data, lastPage: res.data.last_page, total: res.data.total };
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateLocationDetail(loc: LocationListItem): void {
  detailCache.write(loc.id, loc, TTL_DETAIL);
}

export function hydrateLocationList(data: LocationListItem[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single location: its detail, all its audit pages, and both list caches. */
export function bustLocation(id: number): void {
  detailCache.bust(id);
  auditCache.bustWhere(k => k.startsWith(`${id}-`));
  listCache.bustAll();
}

/** Bust only the active/deleted list caches. */
export function bustLocationLists(): void {
  listCache.bustAll();
}

/** Wipe everything — use before a hard refresh. */
export function bustAllLocationCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  auditCache.bustAll();
}

import {
  fetchParties, fetchParty, fetchPartyDetail,
  type PartyListItem, type PartyDetail, type PartyListMeta,
} from "../services/partyApi";
import { fetchPartyAuditLogs, type AuditLogEntry } from "../services/auditLogApi";
import { TTLCache } from "./TTLCache";

const TTL_PAGE        = 3 * 60 * 1000; //  3 min
const TTL_DETAIL      = 5 * 60 * 1000; //  5 min
const TTL_FULL_DETAIL = 5 * 60 * 1000; //  5 min

export type { PartyListItem, PartyDetail, PartyListMeta };

export interface PartyPage {
  data: PartyListItem[];
  meta: PartyListMeta;
}

// ── Caches ────────────────────────────────────────────────────────────────────
const pageCache       = new TTLCache<string, PartyPage>();      // paginated list pages
const detailCache     = new TTLCache<number, PartyListItem>();   // shallow (for hydration)
const fullDetailCache = new TTLCache<number, PartyDetail>();     // deep (overview)

function pageKey(
  trashed: boolean, page: number, perPage: number,
  search: string, orderBy: string, orderDir: string,
  categoryId?: number, creatorType?: "company" | "party",
): string {
  return `${trashed ? 1 : 0}:${page}:${perPage}:${search}:${orderBy}:${orderDir}:${categoryId ?? ''}:${creatorType ?? ''}`;
}

// ── Synchronous reads (cache-only) ────────────────────────────────────────────

export function readPartyPage(
  trashed: boolean, page: number, perPage: number,
  search: string, orderBy: string, orderDir: string,
  categoryId?: number, creatorType?: "company" | "party",
): PartyPage | undefined {
  return pageCache.read(pageKey(trashed, page, perPage, search, orderBy, orderDir, categoryId, creatorType));
}

export function readPartyDetail(id: number): PartyListItem | undefined {
  return detailCache.read(id);
}

export function readPartyFullDetail(id: number): PartyDetail | undefined {
  return fullDetailCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getPartyPage(
  trashed: boolean, page: number, perPage: number,
  search: string, orderBy: string, orderDir: string,
  categoryId?: number, creatorType?: "company" | "party",
): Promise<PartyPage> {
  const key = pageKey(trashed, page, perPage, search, orderBy, orderDir, categoryId, creatorType);
  return pageCache.resolve(key, TTL_PAGE, async () => {
    const res = await fetchParties({
      trashed:   trashed || undefined,
      page,
      per_page:  perPage,
      search:    search  || undefined,
      order_by:  orderBy,
      order_dir: orderDir,
      distribution_category_id: categoryId,
      creator_type: creatorType,
    });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch parties.");
    return { data: res.data, meta: (res as any).meta as PartyListMeta };
  });
}

export function getPartyDetail(id: number): Promise<PartyListItem> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchParty(id);
    if (!res.success) throw new Error((res as any).message ?? "Party not found.");
    return (res as any).data as PartyListItem;
  });
}

export function getPartyFullDetail(id: number): Promise<PartyDetail> {
  return fullDetailCache.resolve(id, TTL_FULL_DETAIL, async () => {
    const res = await fetchPartyDetail(id);
    if (!res.success) throw new Error((res as any).message ?? "Party not found.");
    return res.data;
  });
}

// ── Hydration ─────────────────────────────────────────────────────────────────

export function hydratePartyDetail(party: PartyListItem): void {
  detailCache.write(party.id, party, TTL_DETAIL);
}

export function hydratePartyFullDetail(party: PartyDetail): void {
  fullDetailCache.write(party.id, party, TTL_FULL_DETAIL);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustParty(id: number): void {
  detailCache.bust(id);
  fullDetailCache.bust(id);
  pageCache.bustAll();
}

export function bustPartyList(): void {
  pageCache.bustAll();
}

export function bustAllPartyCache(): void {
  pageCache.bustAll();
  detailCache.bustAll();
  fullDetailCache.bustAll();
}

// ── Audit logs ────────────────────────────────────────────────────────────────

export interface PartyAuditPage {
  logs:     AuditLogEntry[];
  lastPage: number;
  total:    number;
}

const TTL_AUDIT = 2 * 60 * 1000;
const auditCache = new TTLCache<string, PartyAuditPage>();

function auditKey(partyId: number, page: number) { return `${partyId}:${page}`; }

export function readPartyAuditLogs(partyId: number, page: number): PartyAuditPage | undefined {
  return auditCache.read(auditKey(partyId, page));
}

export async function getPartyAuditLogs(partyId: number, page = 1): Promise<PartyAuditPage> {
  const key = auditKey(partyId, page);
  return auditCache.resolve(key, TTL_AUDIT, async () => {
    const res = await fetchPartyAuditLogs(partyId, page);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch audit logs.");
    return { logs: res.data as AuditLogEntry[], lastPage: (res as any).meta.last_page, total: (res as any).meta.total };
  });
}

export function bustPartyAuditLogs(_partyId: number): void {
  auditCache.bustAll();
}

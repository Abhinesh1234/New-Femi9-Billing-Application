import {
  fetchTransferOrders,
  fetchTransferOrder,
  type TransferOrderRecord,
  type TransferOrderDetail,
} from "../services/transferOrderApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min

export type { TransferOrderRecord, TransferOrderDetail };

const listCache   = new TTLCache<"active" | "deleted", TransferOrderRecord[]>();
const detailCache = new TTLCache<number, TransferOrderDetail>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readTransferOrderList(trashed = false): TransferOrderRecord[] | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function readTransferOrderDetail(id: number): TransferOrderDetail | undefined {
  return detailCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getTransferOrderList(trashed = false): Promise<TransferOrderRecord[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, async () => {
    const res = await fetchTransferOrders({ per_page: 500, trashed: trashed || undefined });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch transfer orders.");
    const raw = (res as any).data;
    return (Array.isArray(raw) ? raw : raw?.data ?? []) as TransferOrderRecord[];
  });
}

export function getTransferOrderDetail(id: number): Promise<TransferOrderDetail> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchTransferOrder(id);
    if (!res.success) throw new Error((res as any).message ?? "Transfer order not found.");
    return (res as any).data as TransferOrderDetail;
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateTransferOrderDetail(record: TransferOrderDetail): void {
  detailCache.write(record.id, record, TTL_DETAIL);
}

export function hydrateTransferOrderList(data: TransferOrderRecord[], trashed = false): void {
  listCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single transfer order: its detail and both list caches. */
export function bustTransferOrder(id: number): void {
  detailCache.bust(id);
  listCache.bustAll();
}

/** Wipe everything — use before a hard refresh. */
export function bustAllTransferOrderCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
}

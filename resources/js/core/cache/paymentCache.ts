import { fetchPayments, fetchPayment, fetchPaymentActivity, type PaymentListItem, type PaymentListResult, type PaymentDetail, type ActivityEntry } from "../services/paymentApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST     =  3 * 60 * 1000; //  3 min
const TTL_DETAIL   =  5 * 60 * 1000; //  5 min
const TTL_ACTIVITY = 10 * 60 * 1000; // 10 min

export type { PaymentListItem, PaymentListResult, PaymentDetail, ActivityEntry };

// ── Cache stores ───────────────────────────────────────────────────────────────

const listCache     = new TTLCache<string, PaymentListResult>("payment-list");
const detailCache   = new TTLCache<number, PaymentDetail>("payment-detail");
const activityCache = new TTLCache<number, ActivityEntry[]>("payment-activity");

// ── List cache key ─────────────────────────────────────────────────────────────

function listKey(status?: string | null): string {
  return JSON.stringify({ status: status ?? null });
}

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readPaymentList(status?: string | null): PaymentListResult | undefined {
  return listCache.read(listKey(status));
}

export function readPaymentDetail(id: number): PaymentDetail | undefined {
  return detailCache.read(id);
}

export function readPaymentActivity(id: number): ActivityEntry[] | undefined {
  return activityCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getPaymentList(params?: { status?: string | null }): Promise<PaymentListResult> {
  const status = params?.status ?? null;
  const key    = listKey(status);

  return listCache.resolve(key, TTL_LIST, async () => {
    const fetchParams: Parameters<typeof fetchPayments>[0] = { per_page: 500 };
    if (status) fetchParams.status = status;

    const res = await fetchPayments(fetchParams);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch payments.");
    return { data: res.data.data, total: res.data.total };
  });
}

export function getPaymentDetail(id: number): Promise<PaymentDetail> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchPayment(id);
    if (!res.success) throw new Error((res as any).message ?? "Payment not found.");
    return (res as any).data as PaymentDetail;
  });
}

export function getPaymentActivity(id: number): Promise<ActivityEntry[]> {
  return activityCache.resolve(id, TTL_ACTIVITY, async () => {
    const res = await fetchPaymentActivity(id);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch activity.");
    return (res as any).data as ActivityEntry[];
  });
}

// ── Hydration ─────────────────────────────────────────────────────────────────

export function hydratePaymentList(data: PaymentListItem[], total: number, status?: string | null): void {
  listCache.write(listKey(status), { data, total }, TTL_LIST);
}

export function hydratePaymentDetail(payment: PaymentDetail): void {
  detailCache.write(payment.id, payment, TTL_DETAIL);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust a single payment: its detail + activity + all list variants. */
export function bustPayment(id: number): void {
  detailCache.bust(id);
  activityCache.bust(id);
  listCache.bustAll();
}

/** Bust all payment list cache variants only. */
export function bustPaymentList(): void {
  listCache.bustAll();
}

/** Wipe all payment cache. */
export function bustAllPaymentCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
  activityCache.bustAll();
}

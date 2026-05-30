/**
 * mutationEvents
 * --------------
 * Lightweight pub/sub bus for cache invalidation across pages and tabs.
 *
 * emitMutation(event)          — notify all listeners in the current tab
 *                                AND broadcast to every other open tab via BroadcastChannel
 * onMutation(event, handler)   — subscribe; returns an unsubscribe function
 *
 * Cross-tab behaviour:
 *   When Tab A saves an item and calls emitMutation("items:mutated"), every
 *   other open tab receives the broadcast and triggers its own local listeners,
 *   so list/overview pages in other tabs also refresh from the server.
 */

export type MutationEvent =
  | "locations:mutated"
  | "series:mutated"
  | "price-lists:mutated"
  | "items:mutated"
  | "composite-items:mutated"
  | "assemblies:mutated"
  | "adjustments:mutated"
  | "transfer-orders:mutated"
  | "customer-categories:mutated"
  | "distribution-locations:mutated"
  | "parties:mutated"
  | "invoices:mutated";

// ── Per-tab listeners ─────────────────────────────────────────────────────────

const listeners = new Map<MutationEvent, Set<() => void>>();

function localEmit(event: MutationEvent): void {
  listeners.get(event)?.forEach(cb => {
    try { cb(); } catch (err) { console.error("[mutationEvents] listener error:", err); }
  });
}

// ── BroadcastChannel for cross-tab propagation ────────────────────────────────

let channel: BroadcastChannel | null = null;

if (typeof BroadcastChannel !== "undefined") {
  channel = new BroadcastChannel("femi9:mutations:v1");
  channel.addEventListener("message", (e: MessageEvent<{ event: MutationEvent }>) => {
    const ev = e.data?.event;
    if (ev) localEmit(ev);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Emit a mutation event.
 * Fires all listeners in the current tab and broadcasts to every other open tab.
 */
export function emitMutation(event: MutationEvent): void {
  localEmit(event);
  channel?.postMessage({ event });
}

/**
 * Subscribe to a mutation event.
 * Returns an unsubscribe function — call it in useEffect's cleanup.
 */
export function onMutation(event: MutationEvent, handler: () => void): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => listeners.get(event)?.delete(handler);
}

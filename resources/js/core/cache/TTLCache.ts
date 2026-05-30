/**
 * TTLCache v2
 *
 * Generic TTL-aware in-memory cache with:
 *  - Per-key invalidation and in-flight request deduplication (v1)
 *  - Cache versioning   — bump CACHE_FORMAT_VERSION to wipe all caches on schema changes
 *  - Stale-while-revalidate (SWR) — return stale data instantly, refresh in background
 *  - BroadcastChannel cross-tab invalidation — bust() / bustAll() propagate to every
 *    open tab so that saving in Tab A immediately invalidates Tab B's cache
 *
 * API (unchanged from v1 except new `namespace` constructor param and `resolveSWR`):
 *   read()       — synchronous, returns undefined on miss or expiry
 *   write()      — synchronous store with TTL
 *   bust()       — invalidate a single key (+ broadcast)
 *   bustWhere()  — invalidate all keys matching a predicate (+ broadcast each)
 *   bustAll()    — wipe everything (+ broadcast)
 *   resolve()    — cache-first async fetch with in-flight deduplication
 *   resolveSWR() — stale-while-revalidate: return stale immediately, refresh in background
 */

/** Bump this string whenever the API shape changes to silently invalidate all clients. */
const CACHE_FORMAT_VERSION = "v2";

export class TTLCache<K, V> {
  private store    = new Map<K, { data: V; expiresAt: number }>();
  private inflight = new Map<K, Promise<V>>();
  private tokens   = new Map<K, number>();
  private channel: BroadcastChannel | null = null;

  /**
   * @param namespace  Unique name for this cache instance.
   *                   Used as the BroadcastChannel name — keep it stable across deploys.
   */
  constructor(private readonly namespace: string = "default") {
    if (typeof BroadcastChannel !== "undefined") {
      const channelName = `femi9:${CACHE_FORMAT_VERSION}:${namespace}`;
      this.channel = new BroadcastChannel(channelName);

      this.channel.addEventListener(
        "message",
        (e: MessageEvent<{ action: "bust" | "bustAll"; keyJson?: string }>) => {
          const { action, keyJson } = e.data ?? {};

          if (action === "bustAll") {
            this._localEvictAll();
          } else if (action === "bust" && keyJson !== undefined) {
            // Match by JSON-serialised key — handles both string and number keys correctly
            for (const k of [...this.store.keys()]) {
              if (JSON.stringify(k) === keyJson) { this._localEvict(k); break; }
            }
            for (const k of [...this.inflight.keys()]) {
              if (JSON.stringify(k) === keyJson) { this._localEvict(k); break; }
            }
          }
        }
      );
    }
  }

  // ── Internal eviction (local only, no broadcast) ───────────────────────────

  private _localEvict(key: K): void {
    this.store.delete(key);
    this.inflight.delete(key);
    this.incr(key);
  }

  private _localEvictAll(): void {
    const all = new Set([...this.store.keys(), ...this.inflight.keys()]);
    all.forEach(k => this.incr(k));
    this.store.clear();
    this.inflight.clear();
  }

  // ── Write-guard token helpers ──────────────────────────────────────────────

  private tok(key: K): number { return this.tokens.get(key) ?? 0; }
  private incr(key: K): void  { this.tokens.set(key, this.tok(key) + 1); }

  // ── Public API ─────────────────────────────────────────────────────────────

  read(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return undefined; }
    return entry.data;
  }

  write(key: K, data: V, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  bust(key: K): void {
    this._localEvict(key);
    this.channel?.postMessage({ action: "bust", keyJson: JSON.stringify(key) });
  }

  bustWhere(pred: (k: K) => boolean): void {
    for (const k of [...this.store.keys()]) {
      if (pred(k)) { this._localEvict(k); this.channel?.postMessage({ action: "bust", keyJson: JSON.stringify(k) }); }
    }
    for (const k of [...this.inflight.keys()]) {
      if (pred(k)) { this._localEvict(k); this.channel?.postMessage({ action: "bust", keyJson: JSON.stringify(k) }); }
    }
  }

  bustAll(): void {
    this._localEvictAll();
    this.channel?.postMessage({ action: "bustAll" });
  }

  /**
   * Cache-first async fetch.
   * Concurrent callers for the same key share one in-flight promise instead of
   * issuing duplicate requests. Stale writes are suppressed via the token guard.
   */
  async resolve(key: K, ttlMs: number, fetcher: () => Promise<V>): Promise<V> {
    const hit = this.read(key);
    if (hit !== undefined) return hit;

    const existing = this.inflight.get(key);
    if (existing) return existing;

    const tokenAtStart = this.tok(key);

    const promise = fetcher()
      .then(data => {
        if (this.tok(key) === tokenAtStart) this.write(key, data, ttlMs);
        this.inflight.delete(key);
        return data;
      })
      .catch(err => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Stale-while-revalidate fetch.
   * - Fresh data → return immediately (same as resolve)
   * - Stale data exists → return the stale value instantly AND kick off a
   *   background refresh so the next read gets fresh data
   * - No data → block on the fetch (same as resolve)
   *
   * Use this for data that's acceptable to show slightly stale (e.g. lists,
   * settings) where you prefer perceived speed over strict freshness.
   */
  async resolveSWR(key: K, ttlMs: number, fetcher: () => Promise<V>): Promise<V> {
    const entry = this.store.get(key);

    if (entry) {
      const isStale = Date.now() > entry.expiresAt;

      if (isStale && !this.inflight.has(key)) {
        // Background refresh — do NOT await; return stale data immediately below
        const tokenAtStart = this.tok(key);
        const bgPromise = fetcher()
          .then(data => {
            if (this.tok(key) === tokenAtStart) this.write(key, data, ttlMs);
            this.inflight.delete(key);
            return data;
          })
          .catch(() => { this.inflight.delete(key); });

        this.inflight.set(key, bgPromise as Promise<V>);
      }

      return entry.data; // return stale (or fresh) data without waiting
    }

    // No data at all — must block on the first fetch
    return this.resolve(key, ttlMs, fetcher);
  }
}

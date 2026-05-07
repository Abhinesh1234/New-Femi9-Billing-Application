/**
 * Generic TTL-aware cache with per-key invalidation and in-flight request deduplication.
 *
 * - read()    — synchronous, returns undefined on miss or expiry
 * - write()   — synchronous store with TTL
 * - bust()    — invalidate a single key
 * - bustWhere() — invalidate all keys matching a predicate
 * - bustAll() — wipe everything
 * - resolve() — cache-first async fetch; concurrent callers for the same key
 *               share one in-flight promise instead of issuing duplicate requests.
 *               Stale writes are suppressed: if a key is busted after a fetch
 *               starts but before it completes, the result is discarded.
 */
export class TTLCache<K, V> {
  private store   = new Map<K, { data: V; expiresAt: number }>();
  private inflight = new Map<K, Promise<V>>();
  private tokens  = new Map<K, number>(); // per-key write-guard counter

  private tok(key: K): number { return this.tokens.get(key) ?? 0; }
  private incr(key: K): void  { this.tokens.set(key, this.tok(key) + 1); }

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
    this.store.delete(key);
    this.inflight.delete(key);
    this.incr(key);
  }

  bustWhere(pred: (k: K) => boolean): void {
    for (const k of [...this.store.keys()])    if (pred(k)) { this.store.delete(k);    this.incr(k); }
    for (const k of [...this.inflight.keys()]) if (pred(k)) { this.inflight.delete(k); this.incr(k); }
  }

  bustAll(): void {
    const all = new Set([...this.store.keys(), ...this.inflight.keys()]);
    all.forEach(k => this.incr(k));
    this.store.clear();
    this.inflight.clear();
  }

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
}

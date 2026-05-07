import { fetchSettings, saveSettings } from "../services/settingApi";
import { TTLCache } from "./TTLCache";
import type { ApiResponse, ProductConfiguration } from "../services/settingApi";

const TTL = 5 * 60 * 1000; // 5 min — fresh enough for settings, avoids hitting server on every tab switch

// Typed as unknown; callers cast to their module config type via the generic
const cache = new TTLCache<string, unknown>();

// ── Synchronous read (cache-only, no network) ─────────────────────────────────

export function readSettings<T>(module: string): T | undefined {
  return cache.read(module) as T | undefined;
}

// ── Async fetch (cache-first + in-flight deduplication) ───────────────────────

export function getSettings<T>(module: string): Promise<T> {
  return cache.resolve(module, TTL, async () => {
    const res = await fetchSettings<T>(module);
    if (!res.success) throw new Error(res.message ?? "Failed to fetch settings.");
    if (res.configuration == null) throw new Error("No configuration returned from server.");
    return res.configuration as T;
  }) as Promise<T>;
}

// ── Save + cache update ───────────────────────────────────────────────────────

export async function updateSettings<T>(
  module: string,
  payload: T
): Promise<ApiResponse<T>> {
  const res = await saveSettings<T>(module, payload);
  if (res.success && res.configuration != null) {
    // Write the server-returned config back into cache so the next read is instant
    cache.write(module, res.configuration, TTL);
  } else {
    // On failure, bust so the next load re-fetches a clean copy
    cache.bust(module);
  }
  return res;
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustSettings(module: string): void {
  cache.bust(module);
}

export function bustAllSettingsCache(): void {
  cache.bustAll();
}

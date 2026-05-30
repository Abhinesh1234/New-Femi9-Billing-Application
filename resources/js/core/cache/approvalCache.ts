import { fetchApprovalSettings, saveApprovalSettings, type ApprovalModule, type ApprovalSettings, type SaveApprovalPayload } from "../services/approvalApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min — same as settingCache

const cache = new TTLCache<ApprovalModule, ApprovalSettings>();

// ── Synchronous read (cache-only, no network) ─────────────────────────────────

export function readApprovalSettings(module: ApprovalModule): ApprovalSettings | undefined {
  return cache.read(module);
}

// ── Async fetch (cache-first + in-flight deduplication) ───────────────────────

export function getApprovalSettings(module: ApprovalModule): Promise<ApprovalSettings> {
  return cache.resolve(module, TTL, async () => {
    const res = await fetchApprovalSettings(module);
    if (!res.success) throw new Error(res.message ?? "Failed to fetch approval settings.");
    return res.data;
  });
}

// ── Save + cache update ───────────────────────────────────────────────────────

export async function updateApprovalSettings(
  module: ApprovalModule,
  payload: SaveApprovalPayload
): Promise<{ success: true; message: string } | { success: false; message: string }> {
  const res = await saveApprovalSettings(module, payload);
  if (res.success) {
    // Bust so the next load re-fetches the server's canonical data
    cache.bust(module);
  }
  return res;
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustApprovalSettings(module: ApprovalModule): void {
  cache.bust(module);
}

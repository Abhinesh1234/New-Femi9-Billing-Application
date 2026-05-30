import { fetchAssemblies, fetchAssembly, type AssemblyRecord } from "../services/assemblyApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   =  3 * 60 * 1000; //  3 min
const TTL_DETAIL =  5 * 60 * 1000; //  5 min

const listCache   = new TTLCache<"all", AssemblyRecord[]>();
const detailCache = new TTLCache<number, AssemblyRecord>();

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readAssemblyList(): AssemblyRecord[] | undefined {
  return listCache.read("all");
}

export function readAssemblyDetail(id: number): AssemblyRecord | undefined {
  return detailCache.read(id);
}

// ── Async fetches (cache-first + in-flight deduplication) ─────────────────────

export function getAssemblyList(): Promise<AssemblyRecord[]> {
  return listCache.resolve("all", TTL_LIST, async () => {
    const res = await fetchAssemblies({ per_page: 500 });
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch assemblies.");
    return (Array.isArray(res.data) ? res.data : []) as AssemblyRecord[];
  });
}

export function getAssemblyDetail(id: number): Promise<AssemblyRecord> {
  return detailCache.resolve(id, TTL_DETAIL, async () => {
    const res = await fetchAssembly(id);
    if (!res.success) throw new Error((res as any).message ?? "Assembly not found.");
    return (res as any).data as AssemblyRecord;
  });
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateAssemblyDetail(record: AssemblyRecord): void {
  detailCache.write(record.id, record, TTL_DETAIL);
}

export function hydrateAssemblyList(data: AssemblyRecord[]): void {
  listCache.write("all", data, TTL_LIST);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

export function bustAssembly(id: number): void {
  detailCache.bust(id);
  listCache.bustAll();
}

export function bustAllAssemblyCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
}

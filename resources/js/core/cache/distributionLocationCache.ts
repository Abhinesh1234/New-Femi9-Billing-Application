import { TTLCache } from "./TTLCache";
import {
  getCountries,
  getNodes,
  getLayerSchema,
  type Country,
  type DistributionLocationNode,
  type LayerSchema,
} from "../services/distributionLocationApi";

const TTL_LIST   = 3 * 60 * 1000; // 3 min
const TTL_SCHEMA = 5 * 60 * 1000; // 5 min

const countryCache = new TTLCache<"active" | "deleted", Country[]>();
const nodeCache    = new TTLCache<string, DistributionLocationNode[]>();
const schemaCache  = new TTLCache<number, LayerSchema[]>();

// ── Node list cache key ───────────────────────────────────────────────────────

function nodeKey(countryId: number, parentId: number | null, trashed: boolean): string {
  return `${countryId}:${parentId ?? "root"}:${trashed ? "deleted" : "active"}`;
}

// ── Synchronous reads (cache-only, no network) ────────────────────────────────

export function readCountryList(trashed = false): Country[] | undefined {
  return countryCache.read(trashed ? "deleted" : "active");
}

export function readNodeList(
  countryId: number,
  parentId: number | null,
  trashed = false,
): DistributionLocationNode[] | undefined {
  return nodeCache.read(nodeKey(countryId, parentId, trashed));
}

export function readLayerSchema(countryId: number): LayerSchema[] | undefined {
  return schemaCache.read(countryId);
}

// ── Async cache-first fetches ─────────────────────────────────────────────────

export function getCountryList(trashed = false): Promise<Country[]> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return countryCache.resolve(key, TTL_LIST, () => getCountries(trashed));
}

export function getNodeList(
  countryId: number,
  parentId: number | null,
  trashed = false,
): Promise<DistributionLocationNode[]> {
  const key = nodeKey(countryId, parentId, trashed);
  return nodeCache.resolve(key, TTL_LIST, () =>
    getNodes({ country_id: countryId, parent_id: parentId, trashed }),
  );
}

export function getCachedLayerSchema(countryId: number): Promise<LayerSchema[]> {
  return schemaCache.resolve(countryId, TTL_SCHEMA, () => getLayerSchema(countryId));
}

// ── Hydration (write already-fetched data into cache) ─────────────────────────

export function hydrateCountryList(data: Country[], trashed = false): void {
  countryCache.write(trashed ? "deleted" : "active", data, TTL_LIST);
}

export function hydrateNodeList(
  countryId: number,
  parentId: number | null,
  data: DistributionLocationNode[],
  trashed = false,
): void {
  nodeCache.write(nodeKey(countryId, parentId, trashed), data, TTL_LIST);
}

export function hydrateLayerSchema(countryId: number, data: LayerSchema[]): void {
  schemaCache.write(countryId, data, TTL_SCHEMA);
}

// ── Invalidation ──────────────────────────────────────────────────────────────

/** Bust the active+deleted list for the current level only. */
export function bustDistributionList(countryId: number | null, parentId: number | null): void {
  if (countryId === null) {
    countryCache.bustAll();
  } else {
    nodeCache.bust(nodeKey(countryId, parentId, false));
    nodeCache.bust(nodeKey(countryId, parentId, true));
  }
}

export function bustLayerSchema(countryId: number): void {
  schemaCache.bust(countryId);
}

export function bustAllDistributionCache(): void {
  countryCache.bustAll();
  nodeCache.bustAll();
  schemaCache.bustAll();
}

import { fetchHsnCodes, type HsnCode } from "../services/hsnCodeApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { HsnCode };

const cache = new TTLCache<"list", HsnCode[]>();

export function readHsnCodes(): HsnCode[] | undefined {
  return cache.read("list");
}

export function getHsnCodes(): Promise<HsnCode[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchHsnCodes();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch HSN codes.");
    return res.data;
  });
}

export function hydrateHsnCodes(data: HsnCode[]): void {
  cache.write("list", data, TTL);
}

export function bustHsnCodes(): void {
  cache.bustAll();
}

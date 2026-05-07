import { fetchGstRates, type GstRate } from "../services/gstRateApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { GstRate };

const cache = new TTLCache<"list", GstRate[]>();

export function readGstRates(): GstRate[] | undefined {
  return cache.read("list");
}

export function getGstRates(): Promise<GstRate[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchGstRates();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch GST rates.");
    return res.data;
  });
}

export function hydrateGstRates(data: GstRate[]): void {
  cache.write("list", data, TTL);
}

export function bustGstRates(): void {
  cache.bustAll();
}

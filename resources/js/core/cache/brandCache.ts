import { fetchBrands, type Brand } from "../services/brandApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { Brand };

const cache = new TTLCache<"list", Brand[]>();

export function readBrands(): Brand[] | undefined {
  return cache.read("list");
}

export function getBrands(): Promise<Brand[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchBrands();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch brands.");
    return res.data;
  });
}

export function hydrateBrands(data: Brand[]): void {
  cache.write("list", data, TTL);
}

export function bustBrands(): void {
  cache.bustAll();
}

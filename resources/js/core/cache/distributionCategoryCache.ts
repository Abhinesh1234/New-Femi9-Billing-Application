import { fetchDistributionCategories, type DistributionCategory } from "../services/distributionCategoryApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { DistributionCategory };

const cache = new TTLCache<"list", DistributionCategory[]>();

export function readDistributionCategories(): DistributionCategory[] | undefined {
  return cache.read("list");
}

export function getDistributionCategories(): Promise<DistributionCategory[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchDistributionCategories();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch distribution categories.");
    return res.data;
  });
}

export function hydrateDistributionCategories(data: DistributionCategory[]): void {
  cache.write("list", data, TTL);
}

export function bustDistributionCategories(): void {
  cache.bustAll();
}

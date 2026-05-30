import { fetchDistributionSubCategories, type DistributionSubCategory } from "../services/distributionSubCategoryApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { DistributionSubCategory };

const cache = new TTLCache<"list", DistributionSubCategory[]>();

export function readDistributionSubCategories(): DistributionSubCategory[] | undefined {
  return cache.read("list");
}

export function getDistributionSubCategories(): Promise<DistributionSubCategory[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchDistributionSubCategories();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch distribution sub-categories.");
    return res.data;
  });
}

export function hydrateDistributionSubCategories(data: DistributionSubCategory[]): void {
  cache.write("list", data, TTL);
}

export function bustDistributionSubCategories(): void {
  cache.bustAll();
}

import { fetchCategories, type Category } from "../services/categoryApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { Category };

const cache = new TTLCache<"list", Category[]>();

export function readCategories(): Category[] | undefined {
  return cache.read("list");
}

export function getCategories(): Promise<Category[]> {
  return cache.resolve("list", TTL, async () => {
    const res = await fetchCategories();
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch categories.");
    return res.data;
  });
}

export function hydrateCategories(data: Category[]): void {
  cache.write("list", data, TTL);
}

export function bustCategories(): void {
  cache.bustAll();
}

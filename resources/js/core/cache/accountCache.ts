import { fetchAccounts, type Account, type AccountType } from "../services/accountApi";
import { TTLCache } from "./TTLCache";

const TTL = 5 * 60 * 1000; // 5 min

export type { Account, AccountType };

type CacheKey = "all" | AccountType;

const cache = new TTLCache<CacheKey, Account[]>();

export function readAccounts(type?: AccountType): Account[] | undefined {
  return cache.read(type ?? "all");
}

export function getAccounts(type?: AccountType): Promise<Account[]> {
  const key: CacheKey = type ?? "all";
  return cache.resolve(key, TTL, async () => {
    const res = await fetchAccounts(type);
    if (!res.success) throw new Error((res as any).message ?? "Failed to fetch accounts.");
    return res.data;
  });
}

export function hydrateAccounts(data: Account[], type?: AccountType): void {
  cache.write(type ?? "all", data, TTL);
}

export function bustAccounts(): void {
  cache.bustAll();
}

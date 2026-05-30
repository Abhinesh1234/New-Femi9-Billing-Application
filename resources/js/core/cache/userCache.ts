import { fetchUsers, fetchUser, type UserListItem, type UserListResult, type UserDetail } from "../services/userApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST = 3 * 60 * 1000; // 3 min

export type { UserListItem, UserListResult, UserDetail };

const TTL_DETAIL = 5 * 60 * 1000;

const listCache   = new TTLCache<"all", UserListResult>("users-list");
const detailCache = new TTLCache<number, UserDetail>("users-detail");

export function readUserList(): UserListResult | undefined {
  return listCache.read("all");
}

export function getUserList(): Promise<UserListResult> {
  return listCache.resolve("all", TTL_LIST, () => fetchUsers());
}

export function readUserDetail(id: number): UserDetail | undefined {
  return detailCache.read(id);
}

export function getUserDetail(id: number): Promise<UserDetail> {
  return detailCache.resolve(id, TTL_DETAIL, () => fetchUser(id));
}

export function bustUserCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
}

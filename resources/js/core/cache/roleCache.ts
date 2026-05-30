import { fetchRoles, fetchRole, type RoleListItem, type RoleDetail } from "../services/roleApi";
import { TTLCache } from "./TTLCache";

const TTL_LIST   = 3 * 60 * 1000; // 3 min
const TTL_DETAIL = 5 * 60 * 1000; // 5 min

export type { RoleListItem, RoleDetail };

interface RoleListResult { data: RoleListItem[]; total: number; }

const listCache   = new TTLCache<"active" | "deleted", RoleListResult>("roles-list");
const detailCache = new TTLCache<number, RoleDetail>("roles-detail");

export function readRoleList(trashed = false): RoleListResult | undefined {
  return listCache.read(trashed ? "deleted" : "active");
}

export function getRoleList(trashed = false): Promise<RoleListResult> {
  const key: "active" | "deleted" = trashed ? "deleted" : "active";
  return listCache.resolve(key, TTL_LIST, () => fetchRoles({ trashed }));
}

export function readRoleDetail(id: number): RoleDetail | undefined {
  return detailCache.read(id);
}

export function getRoleDetail(id: number): Promise<RoleDetail> {
  return detailCache.resolve(id, TTL_DETAIL, () => fetchRole(id));
}

export function bustAllRoleCache(): void {
  listCache.bustAll();
  detailCache.bustAll();
}

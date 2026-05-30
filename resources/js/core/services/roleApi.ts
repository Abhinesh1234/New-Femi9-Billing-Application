import axios from "axios";

const BASE = "/api/roles";

export interface RoleListItem {
  id:                number;
  name:              string;
  description:       string | null;
  is_system:         boolean;
  permissions_count: number;
  created_by:        { id: number; name: string } | null;
  created_at:        string;
}

export interface RolePermission {
  id:           number;
  module:       string;
  can_view:     boolean;
  can_create:   boolean;
  can_edit:     boolean;
  can_delete:   boolean;
  can_others:   boolean;
  others_data?: Record<string, unknown> | null;
}

export interface RoleDetail extends RoleListItem {
  updated_at:  string;
  permissions: RolePermission[];
}

export interface RolePermissionPayload {
  module:       string;
  can_view:     boolean;
  can_create:   boolean;
  can_edit:     boolean;
  can_delete:   boolean;
  can_others:   boolean;
  others_data?: Record<string, unknown> | null;
}

export interface StoreRolePayload {
  name:        string;
  description?: string | null;
  permissions: RolePermissionPayload[];
}

interface PaginatedResponse<T> {
  data:  T[];
  total: number;
}

export async function fetchRoles(params: { search?: string; trashed?: boolean } = {}): Promise<PaginatedResponse<RoleListItem>> {
  const { data } = await axios.get(BASE, {
    params: { per_page: 200, ...params },
    withCredentials: true,
  });
  const list = data?.data?.data ?? data?.data ?? [];
  const total = data?.data?.total ?? list.length;
  return { data: list, total };
}

export async function fetchRole(id: number): Promise<RoleDetail> {
  const { data } = await axios.get(`${BASE}/${id}`, { withCredentials: true });
  return data?.data;
}

export async function createRole(payload: StoreRolePayload): Promise<RoleListItem> {
  const { data } = await axios.post(BASE, payload, { withCredentials: true });
  return data?.data;
}

export async function updateRole(id: number, payload: StoreRolePayload): Promise<RoleDetail> {
  const { data } = await axios.put(`${BASE}/${id}`, payload, { withCredentials: true });
  return data?.data;
}

export async function deleteRole(id: number): Promise<void> {
  await axios.delete(`${BASE}/${id}`, { withCredentials: true });
}

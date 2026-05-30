import axios from "axios";

const BASE = "/api/users";

// ─── List ──────────────────────────────────────────────────────────────────────

export interface UserListItem {
  id:         number;
  name:       string;
  email:      string | null;
  phone:      string;
  avatar:     string | null;
  user_type:  string;
  role_id:    number | null;
  role:       { id: number; name: string } | null;
  is_active:  boolean;
  created_at: string;
}

export interface UserListResult {
  data:  UserListItem[];
  total: number;
}

export interface UserPermission {
  id:          number;
  module:      string;
  can_view:    boolean;
  can_create:  boolean;
  can_edit:    boolean;
  can_delete:  boolean;
  can_others:  boolean;
  others_data: Record<string, unknown> | null;
}

export interface UserDetail extends UserListItem {
  updated_at:                 string;
  permissions:                UserPermission[];
  has_individual_permissions: boolean;
  role_permissions:           UserPermission[];
}

export async function fetchUser(id: number): Promise<UserDetail> {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data.data;
}

export async function fetchUsers(): Promise<UserListResult> {
  const res = await axios.get(BASE);
  return { data: res.data.data, total: res.data.total ?? res.data.data.length };
}

// ─── Create ────────────────────────────────────────────────────────────────────

export interface UserPermissionPayload {
  module:      string;
  can_view:    boolean;
  can_create:  boolean;
  can_edit:    boolean;
  can_delete:  boolean;
  can_others:  boolean;
  others_data: { party_category_ids: number[] | null } | null;
}

export interface CreateUserPayload {
  name:        string;
  email:       string | null;
  phone:       string;
  password:    string;
  role_id:     number;
  permissions: UserPermissionPayload[];
}

export async function createUser(payload: CreateUserPayload): Promise<{ id: number; name: string }> {
  const res = await axios.post(BASE, payload);
  return res.data.data;
}

// ─── Update ────────────────────────────────────────────────────────────────────

export interface UpdateUserPayload {
  name:        string;
  email:       string | null;
  phone:       string;
  password?:   string;
  role_id:     number;
  is_active?:  boolean;
  permissions: UserPermissionPayload[];
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<{ id: number; name: string }> {
  const res = await axios.put(`${BASE}/${id}`, payload);
  return res.data.data;
}

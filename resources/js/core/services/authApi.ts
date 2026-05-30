import axios, { AxiosError } from "axios";
import type { PartyCategory } from "../redux/authSlice";

export interface AuthUser {
  id:       number;
  name:     string;
  phone:    string | null;
  email:    string | null;
  avatar:   string | null;
  avatar_url?: string | null;
  user_type: "super_admin" | "admin" | "staff" | "party";
  role_id:  number | null;
  permissions: Record<string, Record<string, boolean>> | null;
  // Party-specific
  mobile?:        string | null;
  party_id?:      number;
  party_code?:    string | null;
  party_name?:    string | null;
  category_id?:   number | null;
  category_name?: string | null;
  categories?:    PartyCategory[];
}

export interface UserListItem {
  id: number;
  name: string;
  email: string | null;
  avatar: string | null;
  user_type: "super_admin" | "admin" | "staff";
  is_active: boolean;
}

// Shapes match the flat response from Controller::successResponse()
// i.e. { success: true, ...payload }
interface LoginResponse   { success: true;  token: string; token_type: string; user: AuthUser }
interface MeResponse      { success: true;  user: AuthUser }
interface MessageResponse { success: true;  message: string }
interface ErrorResponse   { success: false; message: string }

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const msg = (err.response.data as ErrorResponse)?.message;
    return { success: false, message: msg ?? "Unexpected error." };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(
  phone: string,
  password: string
): Promise<LoginResponse | ErrorResponse> {
  try {
    const { data } = await axios.post<LoginResponse>("/api/auth/login", { phone, password });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export async function logout(): Promise<MessageResponse | ErrorResponse> {
  try {
    const { data } = await axios.post<MessageResponse>("/api/auth/logout");
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function me(): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.get<MeResponse>("/api/auth/me");
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/auth/change-password ────────────────────────────────────────────
export async function changePassword(
  current_password: string,
  new_password: string,
  new_password_confirmation: string
): Promise<MessageResponse | ErrorResponse> {
  try {
    const { data } = await axios.post<MessageResponse>("/api/auth/change-password", {
      current_password,
      new_password,
      new_password_confirmation,
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── GET /api/users ────────────────────────────────────────────────────────────
interface UsersListResponse { success: true; data: UserListItem[]; }

export async function fetchUsers(params?: { search?: string; all?: boolean }): Promise<UsersListResponse | { success: false; message: string }> {
  try {
    const { data } = await axios.get<UsersListResponse>("/api/users", { params });
    return data;
  } catch (e) {
    return handleError(e) as any;
  }
}

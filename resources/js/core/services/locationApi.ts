import axios, { AxiosError } from "axios";

const BASE = "/api/locations";

export interface LocationListItem {
  id: number;
  name: string;
  type: "business" | "warehouse";
  parent_id: number | null;
  logo_type: string;
  logo_path: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at?: string | null;
  txn_series_id: number | null;
  default_txn_series_id: number | null;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    street1?: string;
    street2?: string;
    pin_code?: string;
    phone?: string;
    attention?: string;
  } | null;
  parent?: { id: number; name: string } | null;
  default_txn_series?: { id: number; name: string } | null;
  created_by?: { id: number; name: string; phone: string } | null;
  deleted_at?: string | null;
}

export interface StoreLocationPayload {
  name: string;
  type: "business" | "warehouse";
  parent_id?: number | null;
  logo_type?: string;
  logo_path?: string | null;
  website_url?: string;
  primary_contact_id?: number | null;
  txn_series_id?: number | null;
  default_txn_series_id?: number | null;
  is_active?: boolean;
  address?: {
    attention?: string;
    street1?: string;
    street2?: string;
    city?: string;
    pin_code?: string;
    country?: string;
    state?: string;
    phone?: string;
    fax?: string;
  };
  access_users?: { user_id: number; role: string }[];
}

interface ListResponse   { success: true; data: LocationListItem[]; }
interface ItemResponse   { success: true; message: string; data: LocationListItem; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; errors?: Record<string, string[]>; }

type ListResult   = ListResponse   | ErrorResponse;
type ItemResult   = ItemResponse   | ErrorResponse;
type DeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

export async function fetchLocation(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.get<ItemResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchLocations(params?: { active_only?: boolean; type?: string; trashed?: boolean }): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeLocation(payload: StoreLocationPayload): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateLocation(id: number, payload: Partial<StoreLocationPayload>): Promise<ItemResult> {
  try {
    const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyLocation(id: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function setPrimaryLocation(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(`${BASE}/${id}/set-primary`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function restoreLocation(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(`${BASE}/${id}/restore`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function uploadLocationLogo(file: File): Promise<{ success: boolean; path?: string; message?: string }> {
  try {
    const form = new FormData();
    form.append("logo", file);
    const { data } = await axios.post(`${BASE}/upload-logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    const err = handleError(e);
    return { success: false, message: err.message };
  }
}

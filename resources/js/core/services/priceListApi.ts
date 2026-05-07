import axios, { AxiosError } from "axios";

const BASE = "/api/price-lists";

// ─── Payload types ────────────────────────────────────────────────────────────

export interface VolumeRange {
  start_qty:   string;
  end_qty:     string;
  custom_rate: string;
  discount?:   string | null;
}

export interface PriceListItemPayload {
  item_id:       number;
  custom_rate?:  string | null;
  discount?:     string | null;
  volume_ranges?: VolumeRange[] | null;
}

export interface PriceListPayload {
  name:                  string;
  transaction_type:      "sales" | "purchase" | "both";
  customer_category_id?: number | null;
  price_list_type:       "all_items" | "individual_items";
  description?:          string | null;
  is_active?:            boolean;
  admin_only?:           boolean;
  settings?:             Record<string, unknown> | null;
  items?:                PriceListItemPayload[];
}

// ─── Response types ───────────────────────────────────────────────────────────

interface SuccessResponse { success: true;  message: string; data: Record<string, unknown>; }
interface ErrorResponse   { success: false; message: string; errors?: Record<string, string[]>; }

export type PriceListResult = SuccessResponse | ErrorResponse;

export interface PriceListRecord {
  id:                     number;
  name:                   string;
  transaction_type:       "sales" | "purchase" | "both";
  price_list_type:        "all_items" | "individual_items";
  customer_category_id:   number | null;
  customer_category_name: string | null;
  is_active:              boolean;
  admin_only:             boolean;
  created_at:             string;
  updated_at:             string;
  deleted_at:             string | null;
}

interface ListResponse {
  success: true;
  data: {
    data:         PriceListRecord[];
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

export type FetchPriceListsResult = ListResponse | ErrorResponse;

// ─── Error handler ────────────────────────────────────────────────────────────

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

// ─── API functions ────────────────────────────────────────────────────────────

interface DetailResponse { success: true; data: Record<string, unknown>; }
export type FetchPriceListResult = DetailResponse | ErrorResponse;

export async function fetchPriceList(id: number): Promise<FetchPriceListResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchPriceLists(
  params?: { search?: string; transaction_type?: string; price_list_type?: string; page?: number; per_page?: number }
): Promise<FetchPriceListsResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function storePriceList(payload: PriceListPayload): Promise<PriceListResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updatePriceList(id: number, payload: Partial<PriceListPayload>): Promise<PriceListResult> {
  try {
    const { data } = await axios.put<SuccessResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyPriceList(id: number): Promise<PriceListResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchPriceListsAll(trashed = false): Promise<PriceListRecord[]> {
  const res = await fetchPriceLists(trashed ? { per_page: 1000, trashed: true } as any : { per_page: 1000 });
  if (!res.success) throw new Error((res as ErrorResponse).message ?? "Failed to fetch price lists.");
  return (res as ListResponse).data.data;
}

interface RestorePriceListResponse { success: true; message: string; }
export type RestorePriceListResult = RestorePriceListResponse | ErrorResponse;
export async function restorePriceList(id: number): Promise<RestorePriceListResult> {
  try {
    const { data } = await axios.post<RestorePriceListResponse>(`${BASE}/${id}/restore`);
    return data;
  } catch (e) { return handleError(e); }
}

import axios, { AxiosError } from "axios";
import type { ItemRefs } from "./itemApi";
// Re-export uploadItemImage pointed at the composite-items endpoint
export { uploadItemImage, uploadCustomFieldFile } from "./itemApi";

const BASE = "/api/composite-items";

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CompositeComponentPayload {
  component_item_id: number;
  component_type:    "item" | "service";
  quantity:          number;
  selling_price?:    number | null;
  cost_price?:       number | null;
  sort_order?:       number;
}

export interface CompositeItemPayload {
  name:                  string;
  composite_type:        "assembly" | "kit";
  item_type?:            "goods" | "service";
  unit?:                 string | null;
  sku?:                  string | null;
  description?:          string | null;
  image?:                string | null;
  refs?:                 ItemRefs;
  product_tag?:          string | null;
  has_sales_info?:       boolean;
  selling_price?:        number | null;
  sales_description?:    string | null;
  has_purchase_info?:    boolean;
  cost_price?:           number | null;
  purchase_description?: string | null;
  preferred_vendor?:     string | null;
  track_inventory?:      boolean;
  valuation_method?:     "fifo" | "average" | null;
  reorder_point?:        number | null;
  is_returnable?:        boolean;
  dimensions?:           { length?: number | null; width?: number | null; height?: number | null; unit?: string } | null;
  weight?:               { value?: number | null; unit?: string } | null;
  identifiers?:          { upc?: string; mpn?: string; ean?: string; isbn?: string } | null;
  custom_fields?:        Record<string, string> | null;
  components:            CompositeComponentPayload[];
}

// ─── Response types ───────────────────────────────────────────────────────────

interface SuccessResponse  { success: true;  message: string; data: Record<string, unknown>; }
interface ErrorResponse    { success: false; message: string; errors?: Record<string, string[]>; }

export type CompositeItemResult = SuccessResponse | ErrorResponse;

export interface CompositeComponentRecord {
  id:                 number;
  composite_item_id:  number;
  component_item_id:  number;
  component_type:     "item" | "service";
  quantity:           string;
  selling_price:      string | null;
  cost_price:         string | null;
  sort_order:         number;
  component_item?: {
    id:         number;
    name:       string;
    image:      string | null;
    item_type:  string;
    sku:        string | null;
    unit:       string | null;
    selling_price: string | null;
    cost_price:    string | null;
  };
}

export interface CompositeItemRecord {
  id:             number;
  name:           string;
  composite_type: "assembly" | "kit";
  item_type:      string;
  sku:            string | null;
  selling_price:  string | null;
  cost_price:     string | null;
  image:          string | null;
  refs:           ItemRefs | null;
  track_inventory: boolean;
  reorder_point:  number | null;
  created_at:     string;
  components?:    CompositeComponentRecord[];
}

interface ListResponse {
  success: true;
  data: {
    data:         CompositeItemRecord[];
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

interface DetailResponse { success: true; data: CompositeItemRecord; }

export type FetchCompositeItemsResult = ListResponse  | ErrorResponse;
export type FetchCompositeItemResult  = DetailResponse | ErrorResponse;

// ─── Error normaliser ─────────────────────────────────────────────────────────

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return {
      success: false,
      message: body?.message ?? "Unexpected error.",
      errors:  body?.errors,
    };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchCompositeItems(
  params?: { search?: string; composite_type?: string; page?: number; per_page?: number; trashed?: boolean }
): Promise<FetchCompositeItemsResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchCompositeItem(id: number): Promise<FetchCompositeItemResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeCompositeItem(payload: CompositeItemPayload): Promise<CompositeItemResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateCompositeItem(
  id: number,
  payload: Partial<CompositeItemPayload>
): Promise<CompositeItemResult> {
  try {
    const { data } = await axios.put<SuccessResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyCompositeItem(id: number): Promise<CompositeItemResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function restoreCompositeItem(id: number): Promise<CompositeItemResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(`${BASE}/${id}/restore`);
    return data;
  } catch (e) { return handleError(e); }
}

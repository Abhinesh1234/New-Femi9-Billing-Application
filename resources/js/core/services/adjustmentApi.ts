import axios, { AxiosError } from "axios";

const REASONS_BASE     = "/api/inventory/adjustment-reasons";
const ADJUSTMENTS_BASE = "/api/inventory/adjustments";

// ─── Shared types ─────────────────────────────────────────────────────────────
interface SuccessResponse { success: true;  data: unknown; message?: string; }
interface ErrorResponse   { success: false; message: string; errors?: Record<string, string[]>; }
type ApiResult = SuccessResponse | ErrorResponse;

// ─── Reason types ─────────────────────────────────────────────────────────────
export interface AdjustmentReason {
  id:         number;
  name:       string;
  sort_order: number;
}

// ─── Adjustment types ─────────────────────────────────────────────────────────
export interface AdjustmentItemPayload {
  item_id?:         number | null;
  item_name:        string;
  item_sku?:        string | null;
  item_unit?:       string | null;
  cost_price?:      number | null;
  qty_available?:   number | null;
  new_qty_on_hand:  number;
  qty_adjusted:     number;
  sort_order?:      number;
}

export interface StoreAdjustmentPayload {
  reference_number?: string | null;
  adjustment_date:   string;
  reason_id?:        number | null;
  reason_name:       string;
  location_id:       number;
  party_id?:         number | null;
  description?:      string | null;
  status?:           "draft" | "committed";
  items:             AdjustmentItemPayload[];
}

export interface AdjustmentItemRecord {
  id:              number;
  adjustment_id:   number;
  item_id:         number | null;
  item_name:       string;
  item_sku:        string | null;
  item_unit:       string | null;
  cost_price:      string;
  qty_available:   string | null;
  new_qty_on_hand: string;
  qty_adjusted:    string;
  sort_order:      number;
}

export interface AdjustmentRecord {
  id:               number;
  reference_number: string | null;
  adjustment_date:  string;
  reason_id:        number | null;
  reason_name:      string;
  location_id:      number;
  party_id:         number | null;
  description:      string | null;
  status:           "draft" | "committed";
  created_by:       number | null;
  created_at:       string;
  items_count?:     number;
  location?:        { id: number; name: string };
  party?:           { id: number; display_name: string } | null;
  reason?:          { id: number; name: string } | null;
  items?:           AdjustmentItemRecord[];
  attachments?:     AdjustmentAttachmentRecord[];
  createdBy?:       { id: number; name: string } | null;
}

export interface AdjustmentAttachmentRecord {
  id:          number;
  file_name:   string;
  file_path:   string;
  mime_type:   string;
  file_size:   number;
  uploaded_by: number | null;
  created_at:  string;
}

// ─── Reason API ───────────────────────────────────────────────────────────────

export async function fetchAdjustmentReasons(): Promise<AdjustmentReason[]> {
  try {
    const { data } = await axios.get<SuccessResponse>(REASONS_BASE);
    return (data.data as AdjustmentReason[]) ?? [];
  } catch {
    return [];
  }
}

export async function storeAdjustmentReason(name: string): Promise<ApiResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(REASONS_BASE, { name });
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function updateAdjustmentReason(id: number, name: string): Promise<ApiResult> {
  try {
    const { data } = await axios.put<SuccessResponse>(`${REASONS_BASE}/${id}`, { name });
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function destroyAdjustmentReason(id: number): Promise<ApiResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${REASONS_BASE}/${id}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

// ─── Adjustment API ───────────────────────────────────────────────────────────

export async function fetchAdjustments(params?: {
  location_id?: number;
  party_id?:    number;
  status?:      string;
  from_date?:   string;
  to_date?:     string;
  search?:      string;
  trashed?:     boolean;
  page?:        number;
  per_page?:    number;
}): Promise<ApiResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(ADJUSTMENTS_BASE, { params });
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function fetchAdjustment(id: number): Promise<ApiResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${ADJUSTMENTS_BASE}/${id}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function storeAdjustment(payload: StoreAdjustmentPayload): Promise<ApiResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(ADJUSTMENTS_BASE, payload);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function destroyAdjustment(id: number): Promise<ApiResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${ADJUSTMENTS_BASE}/${id}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function uploadAdjustmentAttachment(adjustmentId: number, file: File): Promise<ApiResult> {
  try {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axios.post<SuccessResponse>(`${ADJUSTMENTS_BASE}/${adjustmentId}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function deleteAdjustmentAttachment(adjustmentId: number, attachmentId: number): Promise<ApiResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${ADJUSTMENTS_BASE}/${adjustmentId}/attachments/${attachmentId}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

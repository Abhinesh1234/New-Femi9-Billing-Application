import axios, { AxiosError } from "axios";

const BASE = "/api/transfer-orders";

interface SuccessData<T = any> { success: true; message?: string; data: T; }
interface ErrorData            { success: false; message: string; errors?: Record<string, string[]>; }

function handleError(err: unknown): ErrorData {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorData;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

export type TransferOrderStatus = "draft" | "in_transit" | "transferred" | "cancelled";

export interface TransferOrderRecord {
  id:                      number;
  transfer_number:         string;
  transfer_date:           string;
  source_location_id:      number;
  destination_location_id: number;
  reason:                  string | null;
  status:                  TransferOrderStatus;
  lines_count?:            number;
  created_at:              string;
  source_location?:        { id: number; name: string } | null;
  destination_location?:   { id: number; name: string } | null;
  created_by_user?:        { id: number; name: string } | null;
}

export interface TransferOrderLine {
  id:                  number;
  item_id:             number;
  qty_to_transfer:     number;
  source_qty_snapshot: number | null;
  dest_qty_snapshot:   number | null;
  description:         string | null;
  item?: {
    id:    number;
    name:  string;
    sku:   string | null;
    unit:  string | null;
    image: string | null;
  } | null;
}

export interface TransferOrderDetail extends TransferOrderRecord {
  initiated_at:        string | null;
  transferred_at:      string | null;
  cancelled_at:        string | null;
  cancellation_reason: string | null;
  lines:               TransferOrderLine[];
  source_location?:    { id: number; name: string; type: string } | null;
  destination_location?: { id: number; name: string; type: string } | null;
  created_by?:         { id: number; name: string } | null;
  initiated_by?:       { id: number; name: string } | null;
  transferred_by?:     { id: number; name: string } | null;
  cancelled_by?:       { id: number; name: string } | null;
}

export async function fetchTransferOrder(id: number): Promise<SuccessData<TransferOrderDetail> | ErrorData> {
  try {
    const { data } = await axios.get(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function cancelTransferOrder(id: number, reason?: string): Promise<SuccessData | ErrorData> {
  try {
    const { data } = await axios.post(`${BASE}/${id}/cancel`, { reason: reason ?? null });
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchTransferOrders(params?: {
  status?:   string;
  search?:   string;
  per_page?: number;
  trashed?:  boolean;
}): Promise<SuccessData<TransferOrderRecord[]> | ErrorData> {
  try {
    const { data } = await axios.get(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export interface StoreTransferOrderPayload {
  transfer_number:         string;
  transfer_date:           string;
  source_location_id:      number;
  destination_location_id: number;
  reason?:                 string | null;
  lines: {
    item_id:          number;
    qty_to_transfer:  number;
    description?:     string | null;
  }[];
}

export async function fetchNextTransferOrderNumber(): Promise<{ success: boolean; data?: { transfer_number: string } }> {
  try {
    const { data } = await axios.get(`${BASE}/next-number`);
    return data;
  } catch {
    return { success: false };
  }
}

export async function storeTransferOrder(payload: StoreTransferOrderPayload): Promise<SuccessData | ErrorData> {
  try {
    const { data } = await axios.post(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function initiateTransferOrder(id: number): Promise<SuccessData | ErrorData> {
  try {
    const { data } = await axios.post(`${BASE}/${id}/initiate`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function markTransferOrderAsTransferred(id: number): Promise<SuccessData | ErrorData> {
  try {
    const { data } = await axios.post(`${BASE}/${id}/transfer`);
    return data;
  } catch (e) { return handleError(e); }
}

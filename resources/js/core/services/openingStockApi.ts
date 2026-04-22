import axios, { AxiosError } from "axios";

const BASE = "/api/items";

export interface OpeningStockEntry {
  location_id: number;
  opening_stock: number;
  opening_stock_value: number;
}

export interface OpeningStockPayload {
  entries: OpeningStockEntry[];
}

interface SuccessResponse { success: true; message: string; }
interface ErrorResponse   { success: false; message: string; errors?: Record<string, string[]>; }

export type OpeningStockResult = SuccessResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

export async function saveOpeningStock(itemId: number, payload: OpeningStockPayload): Promise<OpeningStockResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(`${BASE}/${itemId}/opening-stock`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchOpeningStock(itemId: number): Promise<{ success: true; data: OpeningStockEntry[] } | ErrorResponse> {
  try {
    const { data } = await axios.get(`${BASE}/${itemId}/opening-stock`);
    return data;
  } catch (e) { return handleError(e); }
}

export interface ItemStockRow {
  location_id: number;
  stock_on_hand: number;
  committed_stock: number;
  available_for_sale: number;
}

export async function fetchItemStock(itemId: number): Promise<{ success: true; data: ItemStockRow[] } | ErrorResponse> {
  try {
    const { data } = await axios.get(`${BASE}/${itemId}/stock`);
    return data;
  } catch (e) { return handleError(e); }
}

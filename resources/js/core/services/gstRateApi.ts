import axios, { AxiosError } from "axios";

const BASE = "/api/gst-rates";

export interface GstRate { id: number; label: string; rate: string; }

interface ListResponse  { success: true;  data: GstRate[]; }
interface ItemResponse  { success: true;  message: string; data: GstRate; }
interface DeleteResponse{ success: true;  message: string; }
interface ErrorResponse { success: false; message: string; }

export type GstListResult   = ListResponse   | ErrorResponse;
export type GstItemResult   = ItemResponse   | ErrorResponse;
export type GstDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as ErrorResponse)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchGstRates(): Promise<GstListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function storeGstRate(label: string, rate: number): Promise<GstItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, { label, rate }); return data; }
  catch (e) { return handleError(e); }
}

export async function updateGstRate(id: number, label: string, rate: number): Promise<GstItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, { label, rate }); return data; }
  catch (e) { return handleError(e); }
}

export async function destroyGstRate(id: number): Promise<GstDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

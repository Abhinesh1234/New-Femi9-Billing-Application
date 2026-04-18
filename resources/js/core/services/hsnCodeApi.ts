import axios, { AxiosError } from "axios";

const BASE = "/api/hsn-codes";

export interface HsnCode { id: number; code: string; description?: string | null; }

interface ListResponse  { success: true;  data: HsnCode[]; }
interface ItemResponse  { success: true;  message: string; data: HsnCode; }
interface DeleteResponse{ success: true;  message: string; }
interface ErrorResponse { success: false; message: string; }

export type HsnListResult   = ListResponse   | ErrorResponse;
export type HsnItemResult   = ItemResponse   | ErrorResponse;
export type HsnDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as ErrorResponse)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchHsnCodes(): Promise<HsnListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function storeHsnCode(code: string, description?: string): Promise<HsnItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, { code, description }); return data; }
  catch (e) { return handleError(e); }
}

export async function updateHsnCode(id: number, code: string, description?: string): Promise<HsnItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, { code, description }); return data; }
  catch (e) { return handleError(e); }
}

export async function destroyHsnCode(id: number): Promise<HsnDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

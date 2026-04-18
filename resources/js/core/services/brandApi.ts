import axios, { AxiosError } from "axios";

const BASE = "/api/brands";

export interface Brand { id: number; name: string; }

interface ListResponse  { success: true;  data: Brand[]; }
interface ItemResponse  { success: true;  message: string; data: Brand; }
interface DeleteResponse{ success: true;  message: string; }
interface ErrorResponse { success: false; message: string; }

type ListResult   = ListResponse   | ErrorResponse;
type ItemResult   = ItemResponse   | ErrorResponse;
type DeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as ErrorResponse)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchBrands(): Promise<ListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function storeBrand(name: string): Promise<ItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, { name }); return data; }
  catch (e) { return handleError(e); }
}

export async function updateBrand(id: number, name: string): Promise<ItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, { name }); return data; }
  catch (e) { return handleError(e); }
}

export async function destroyBrand(id: number): Promise<DeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

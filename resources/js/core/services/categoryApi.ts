import axios, { AxiosError } from "axios";

const BASE = "/api/categories";

export interface Category { id: number; name: string; parent_id: number | null; parent?: { id: number; name: string } | null; }

interface ListResponse  { success: true;  data: Category[]; }
interface ItemResponse  { success: true;  message: string; data: Category; }
interface DeleteResponse{ success: true;  message: string; }
interface ErrorResponse { success: false; message: string; }

export type CategoryListResult   = ListResponse   | ErrorResponse;
export type CategoryItemResult   = ItemResponse   | ErrorResponse;
export type CategoryDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as ErrorResponse)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchCategories(): Promise<CategoryListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function storeCategory(name: string, parent_id: number | null): Promise<CategoryItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, { name, parent_id }); return data; }
  catch (e) { return handleError(e); }
}

export async function updateCategory(id: number, name: string, parent_id: number | null): Promise<CategoryItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, { name, parent_id }); return data; }
  catch (e) { return handleError(e); }
}

export async function destroyCategory(id: number): Promise<CategoryDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

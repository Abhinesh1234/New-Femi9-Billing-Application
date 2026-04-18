import axios, { AxiosError } from "axios";

const BASE = "/api/accounts";

export type AccountType = "sales" | "purchase" | "inventory";
export interface Account { id: number; name: string; type: AccountType; }

interface ListResponse  { success: true;  data: Account[]; }
interface ItemResponse  { success: true;  message: string; data: Account; }
interface DeleteResponse{ success: true;  message: string; }
interface ErrorResponse { success: false; message: string; }

export type AccountListResult   = ListResponse   | ErrorResponse;
export type AccountItemResult   = ItemResponse   | ErrorResponse;
export type AccountDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as ErrorResponse)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchAccounts(type?: AccountType): Promise<AccountListResult> {
  try {
    const params = type ? { type } : {};
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeAccount(name: string, type: AccountType): Promise<AccountItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, { name, type }); return data; }
  catch (e) { return handleError(e); }
}

export async function updateAccount(id: number, name: string, type: AccountType): Promise<AccountItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, { name, type }); return data; }
  catch (e) { return handleError(e); }
}

export async function destroyAccount(id: number): Promise<AccountDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

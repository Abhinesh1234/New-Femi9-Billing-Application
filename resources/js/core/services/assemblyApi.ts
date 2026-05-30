import axios, { AxiosError } from "axios";

const BASE = "/api/assemblies";

// ─── Payload types ────────────────────────────────────────────────────────────

export interface AssemblyItemPayload {
  item_id:           number;
  item_name:         string;
  item_unit?:        string | null;
  quantity_required: number;
  total_quantity:    number;
  cost_price?:       number | null;
}

export interface StoreAssemblyPayload {
  composite_item_id:    number;
  location_id:          number;
  assembled_date:       string;
  quantity_to_assemble: number;
  description?:         string | null;
  items:                AssemblyItemPayload[];
}

// ─── Response types ───────────────────────────────────────────────────────────

interface SuccessResponse { success: true;  message: string; data: Record<string, unknown>; }
interface ErrorResponse   { success: false; message: string; errors?: Record<string, string[]>; }

export type AssemblyResult = SuccessResponse | ErrorResponse;

export interface AssemblyItemRecord {
  id:                number;
  assembly_id:       number;
  item_id:           number;
  item_name:         string;
  item_unit:         string | null;
  quantity_required: string;
  total_quantity:    string;
  cost_price:        string;
}

export interface AssemblyRecord {
  id:                   number;
  assembly_number:      string;
  composite_item_id:    number;
  location_id:          number;
  assembled_date:       string;
  quantity_to_assemble: string;
  description:          string | null;
  status:               "completed" | "cancelled";
  created_by:           number | null;
  cancelled_by:         number | null;
  cancelled_at:         string | null;
  created_at:           string;
  composite_item?:      { id: number; name: string; sku: string | null; image: string | null };
  location?:            { id: number; name: string };
  items?:               AssemblyItemRecord[];
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchNextAssemblyNumber(): Promise<AssemblyResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/next-number`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function fetchAssemblies(params?: {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<AssemblyResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(BASE, { params });
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function fetchAssembly(id: number): Promise<AssemblyResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/${id}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function storeAssembly(payload: StoreAssemblyPayload): Promise<AssemblyResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(BASE, payload);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function cancelAssembly(id: number): Promise<AssemblyResult> {
  try {
    const { data } = await axios.post<SuccessResponse>(`${BASE}/${id}/cancel`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

export async function deleteAssembly(id: number): Promise<AssemblyResult> {
  try {
    const { data } = await axios.delete<SuccessResponse>(`${BASE}/${id}`);
    return data;
  } catch (err) {
    const e = err as AxiosError<ErrorResponse>;
    return e.response?.data ?? { success: false, message: "Network error." };
  }
}

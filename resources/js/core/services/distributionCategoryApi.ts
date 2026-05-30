import axios, { AxiosError } from "axios";

const BASE = "/api/distribution-categories";

export interface DistributionCategory {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  parent_id: number | null;
  level: number;
  linked_location_country_id: number | null;
  linked_location_node_id: number | null;
  linked_location_depth: number | null;
  portal_access: boolean;
  visible_in_hierarchy: boolean;
  party_type: string | null;
  is_system: boolean;
  role_id: number | null;
  parent?: { id: number; name: string } | null;
  linked_country?: { id: number; name: string } | null;
  linked_node?: { id: number; name: string } | null;
  role?: { id: number; name: string } | null;
}

interface ListResponse   { success: true; data: DistributionCategory[]; }
interface ItemResponse   { success: true; message: string; data: DistributionCategory; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; errors?: Record<string, string[]>; }

export type DistributionCategoryListResult   = ListResponse   | ErrorResponse;
export type DistributionCategoryItemResult   = ItemResponse   | ErrorResponse;
export type DistributionCategoryDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

export async function fetchDistributionCategories(): Promise<DistributionCategoryListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function fetchDistributionCategory(id: number): Promise<DistributionCategoryItemResult> {
  try { const { data } = await axios.get<ItemResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

export async function storeDistributionCategory(payload: {
  name: string;
  code?: string | null;
  description?: string | null;
  parent_id?: number | null;
  linked_location_country_id?: number | null;
  linked_location_node_id?: number | null;
  linked_location_depth?: number | null;
  portal_access?: boolean;
  visible_in_hierarchy?: boolean;
  role_id?: number | null;
}): Promise<DistributionCategoryItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateDistributionCategory(
  id: number,
  payload: Partial<{
    name: string;
    code: string | null;
    description: string | null;
    parent_id: number | null;
    linked_location_country_id: number | null;
    linked_location_node_id: number | null;
    linked_location_depth: number | null;
    portal_access: boolean;
    visible_in_hierarchy: boolean;
    role_id: number | null;
  }>,
): Promise<DistributionCategoryItemResult> {
  try {
    const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyDistributionCategory(id: number): Promise<DistributionCategoryDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

export async function restoreDistributionCategory(id: number): Promise<DistributionCategoryDeleteResult> {
  try { const { data } = await axios.post<DeleteResponse>(`${BASE}/${id}/restore`); return data; }
  catch (e) { return handleError(e); }
}

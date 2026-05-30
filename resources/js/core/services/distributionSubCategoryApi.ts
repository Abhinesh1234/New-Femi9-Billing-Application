import axios, { AxiosError } from "axios";

const BASE = "/api/distribution-sub-categories";

export interface DistributionSubCategory {
  id: number;
  name: string;
  distribution_category_id: number | null;
  description: string | null;
  status: "active" | "inactive";
  target_amount: string | null;
  cashback_referral: string | null;
  parent_id: number | null;
  level: number;
  linked_location_country_id: number | null;
  linked_location_node_id: number | null;
  portal_access: boolean;
  visible_in_hierarchy: boolean;
  distribution_category?: { id: number; name: string } | null;
  parent?: { id: number; name: string } | null;
  linked_country?: { id: number; name: string } | null;
  linked_node?: { id: number; name: string } | null;
}

interface ListResponse   { success: true; data: DistributionSubCategory[]; }
interface ItemResponse   { success: true; message: string; data: DistributionSubCategory; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; errors?: Record<string, string[]>; }

export type DistributionSubCategoryListResult   = ListResponse   | ErrorResponse;
export type DistributionSubCategoryItemResult   = ItemResponse   | ErrorResponse;
export type DistributionSubCategoryDeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

export async function fetchDistributionSubCategories(): Promise<DistributionSubCategoryListResult> {
  try { const { data } = await axios.get<ListResponse>(BASE); return data; }
  catch (e) { return handleError(e); }
}

export async function fetchDistributionSubCategory(id: number): Promise<DistributionSubCategoryItemResult> {
  try { const { data } = await axios.get<ItemResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

export async function storeDistributionSubCategory(payload: {
  name: string;
  distribution_category_id?: number | null;
  description?: string | null;
  status?: "active" | "inactive";
  target_amount?: number | null;
  cashback_referral?: string | null;
  parent_id?: number | null;
  linked_location_country_id?: number | null;
  linked_location_node_id?: number | null;
  portal_access?: boolean;
  visible_in_hierarchy?: boolean;
}): Promise<DistributionSubCategoryItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateDistributionSubCategory(
  id: number,
  payload: Partial<{
    name: string;
    distribution_category_id: number | null;
    description: string | null;
    status: "active" | "inactive";
    target_amount: number | null;
    cashback_referral: string | null;
    parent_id: number | null;
    linked_location_country_id: number | null;
    linked_location_node_id: number | null;
    portal_access: boolean;
    visible_in_hierarchy: boolean;
  }>,
): Promise<DistributionSubCategoryItemResult> {
  try {
    const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyDistributionSubCategory(id: number): Promise<DistributionSubCategoryDeleteResult> {
  try { const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

export async function restoreDistributionSubCategory(id: number): Promise<DistributionSubCategoryDeleteResult> {
  try { const { data } = await axios.post<DeleteResponse>(`${BASE}/${id}/restore`); return data; }
  catch (e) { return handleError(e); }
}

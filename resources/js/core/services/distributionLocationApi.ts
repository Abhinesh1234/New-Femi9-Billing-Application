import axios, { AxiosError } from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Country {
  id: number;
  name: string;
  code: string | null;
  phone_code: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  phone_digits: number | null;
  is_active: boolean;
  children_count: number;
  created_at: string;
  deleted_at?: string | null;
}

export interface LayerSchema {
  id: number;
  country_id: number;
  depth: number;
  layer_name: string;
  parent_node_id: number; // 0 = global for this country/depth
}

export interface DistributionLocationNode {
  id: number;
  country_id: number;
  parent_id: number | null;
  depth: number;
  name: string;
  code: string | null;
  is_active: boolean;
  children_count: number;
  created_at: string;
  deleted_at?: string | null;
}

export interface NodeAncestors {
  country: Country;
  ancestors: DistributionLocationNode[];
  current: DistributionLocationNode;
}

// ── Error helper ──────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export function extractApiError(err: unknown): ApiError {
  if (err instanceof AxiosError && err.response?.data) {
    return {
      success: false,
      message: err.response.data.message ?? "An error occurred.",
      errors:  err.response.data.errors,
    };
  }
  return { success: false, message: "Network error. Please try again." };
}

// ── Country Suggest (proxied through backend — never calls restcountries.com directly) ──

export interface CountrySuggestion {
  name: string;
  code: string | null;
  phone_code: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
}

export async function suggestCountries(q: string, signal?: AbortSignal): Promise<CountrySuggestion[]> {
  const { data } = await axios.get("/api/countries/suggest", { params: { q }, signal });
  return data.data;
}

// ── Countries ─────────────────────────────────────────────────────────────────

export async function getCountries(trashed = false, search = ""): Promise<Country[]> {
  const { data } = await axios.get("/api/countries", {
    params: { trashed: trashed || undefined, search: search || undefined },
  });
  return data.data;
}

export async function getCountry(id: number): Promise<Country> {
  const { data } = await axios.get(`/api/countries/${id}`);
  return data.data;
}

export interface CountryPayload {
  name: string;
  code?: string;
  is_active?: boolean;
  phone_code?: string;
  currency_code?: string;
  currency_symbol?: string;
  phone_digits?: number | null;
}

export async function createCountry(payload: CountryPayload): Promise<Country> {
  const { data } = await axios.post("/api/countries", payload);
  return data.data;
}

export async function updateCountry(id: number, payload: CountryPayload): Promise<Country> {
  const { data } = await axios.put(`/api/countries/${id}`, payload);
  return data.data;
}

export async function deleteCountry(id: number): Promise<void> {
  await axios.delete(`/api/countries/${id}`);
}

export async function bulkDeleteCountries(ids: number[]): Promise<void> {
  await axios.delete("/api/countries", { data: { ids } });
}

export async function bulkRestoreCountries(ids: number[]): Promise<void> {
  await axios.post("/api/countries/bulk-restore", { ids });
}

export async function restoreCountry(id: number): Promise<Country> {
  const { data } = await axios.post(`/api/countries/${id}/restore`);
  return data.data;
}

// ── Layer Schema ──────────────────────────────────────────────────────────────

export async function getLayerSchema(countryId: number): Promise<LayerSchema[]> {
  const { data } = await axios.get(`/api/countries/${countryId}/layer-schema`);
  return data.data;
}

export async function upsertLayerSchema(
  countryId: number,
  depth: number,
  layerName: string,
  parentNodeId = 0,
): Promise<LayerSchema> {
  const { data } = await axios.post(`/api/countries/${countryId}/layer-schema`, {
    depth,
    layer_name: layerName,
    parent_node_id: parentNodeId,
  });
  return data.data;
}

export async function deleteLayerSchema(countryId: number, depth: number, parentNodeId?: number): Promise<void> {
  await axios.delete(`/api/countries/${countryId}/layer-schema/${depth}`, {
    params: parentNodeId !== undefined ? { parent_node_id: parentNodeId } : undefined,
  });
}

// ── Distribution Location Nodes ───────────────────────────────────────────────

export async function getNodes(params: {
  country_id: number;
  parent_id?: number | null;
  trashed?: boolean;
  search?: string;
}): Promise<DistributionLocationNode[]> {
  const p: Record<string, unknown> = { country_id: params.country_id };
  if (params.parent_id !== undefined) p.parent_id = params.parent_id ?? "";
  if (params.trashed)  p.trashed  = true;
  if (params.search)   p.search   = params.search;
  const { data } = await axios.get("/api/distribution-location-nodes", { params: p });
  return data.data;
}

export async function getNodeAncestors(nodeId: number): Promise<NodeAncestors> {
  const { data } = await axios.get(`/api/distribution-location-nodes/${nodeId}/ancestors`);
  return data.data;
}

export async function createNode(payload: {
  country_id: number;
  parent_id: number | null;
  depth: number;
  name: string;
  code?: string;
  is_active?: boolean;
}): Promise<DistributionLocationNode> {
  const { data } = await axios.post("/api/distribution-location-nodes", payload);
  return data.data;
}

export async function updateNode(
  id: number,
  payload: { name: string; code?: string; is_active?: boolean },
): Promise<DistributionLocationNode> {
  const { data } = await axios.put(`/api/distribution-location-nodes/${id}`, payload);
  return data.data;
}

export async function deleteNode(id: number): Promise<void> {
  await axios.delete(`/api/distribution-location-nodes/${id}`);
}

export async function bulkDeleteNodes(ids: number[]): Promise<void> {
  await axios.delete("/api/distribution-location-nodes", { data: { ids } });
}

export async function bulkRestoreNodes(ids: number[]): Promise<void> {
  await axios.post("/api/distribution-location-nodes/bulk-restore", { ids });
}

export async function restoreNode(id: number): Promise<DistributionLocationNode> {
  const { data } = await axios.post(`/api/distribution-location-nodes/${id}/restore`);
  return data.data;
}

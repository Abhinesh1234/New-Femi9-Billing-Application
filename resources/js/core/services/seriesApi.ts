import axios, { AxiosError } from "axios";

const BASE = "/api/series";

export interface SeriesModule {
  module: string;
  prefix: string;
  starting_number: string;
  current_number: number;
  restart_numbering: string;
  last_reset_at: string | null;
}

export interface SeriesItem {
  id: number;
  name: string;
  locations_count?: number;
  modules_config?: {
    id: number;
    series_id: number;
    modules: SeriesModule[];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface SeriesPayload {
  name: string;
  modules: {
    module: string;
    prefix: string;
    starting_number: string;
    restart_numbering: string;
  }[];
}

interface ListResponse   { success: true; data: SeriesItem[]; }
interface ItemResponse   { success: true; message: string; data: SeriesItem; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; errors?: Record<string, string[]>; }

type ListResult   = ListResponse   | ErrorResponse;
type ItemResult   = ItemResponse   | ErrorResponse;
type DeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

export async function fetchSeries(params?: { search?: string }): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeSeries(payload: SeriesPayload): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function showSeries(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.get<ItemResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateSeries(id: number, payload: Partial<SeriesPayload>): Promise<ItemResult> {
  try {
    const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroySeries(id: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function assignSeriesLocations(id: number, locationIds: number[]): Promise<DeleteResult> {
  try {
    const { data } = await axios.patch<DeleteResponse>(`${BASE}/${id}/locations`, { location_ids: locationIds });
    return data;
  } catch (e) { return handleError(e); }
}

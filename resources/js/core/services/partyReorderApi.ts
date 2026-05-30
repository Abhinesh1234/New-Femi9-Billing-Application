import axios, { AxiosError } from "axios";

const BASE = "/api/party/items";

interface ErrorResponse { success: false; message: string; }

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

export interface PartyReorderPointData {
  reorder_point: number;
  last_notified_at: string | null;
}

export async function fetchPartyReorderPoint(
  itemId: number
): Promise<{ success: true; data: PartyReorderPointData | null } | ErrorResponse> {
  try {
    const { data } = await axios.get(`${BASE}/${itemId}/reorder-point`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function savePartyReorderPoint(
  itemId: number,
  reorderPoint: number
): Promise<{ success: true; message: string } | ErrorResponse> {
  try {
    const { data } = await axios.post(`${BASE}/${itemId}/reorder-point`, { reorder_point: reorderPoint });
    return data;
  } catch (e) { return handleError(e); }
}

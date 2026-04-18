import axios, { AxiosError } from "axios";

const BASE = "/api/audit-logs";

export interface AuditLogEntry {
  id:             number;
  auditable_type: string;
  auditable_id:   number;
  event:          "created" | "updated" | "deleted" | "restored" | string;
  user_id:        number | null;
  ip_address:     string | null;
  user_agent:     string | null;
  old_values:     Record<string, any> | null;
  new_values:     Record<string, any> | null;
  created_at:     string;
  user:           { id: number; name: string; email: string } | null;
}

interface AuditLogPage {
  data:         AuditLogEntry[];
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
}

interface SuccessResponse { success: true;  data: AuditLogPage; }
interface ErrorResponse   { success: false; message: string; }

export type AuditLogResult = SuccessResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    return { success: false, message: (err.response.data as any)?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchPriceListAuditLogs(
  priceListId: number,
  page = 1,
  perPage = 25
): Promise<AuditLogResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/price_lists/${priceListId}`, {
      params: { page, per_page: perPage },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchLocationAuditLogs(
  locationId: number,
  page = 1,
  perPage = 25
): Promise<AuditLogResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/location/${locationId}`, {
      params: { page, per_page: perPage },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchItemAuditLogs(
  itemId: number,
  page = 1,
  perPage = 25
): Promise<AuditLogResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/items/${itemId}`, {
      params: { page, per_page: perPage },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchSeriesAuditLogs(
  seriesId: number,
  page = 1,
  perPage = 25
): Promise<AuditLogResult> {
  try {
    const { data } = await axios.get<SuccessResponse>(`${BASE}/series/${seriesId}`, {
      params: { page, per_page: perPage },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

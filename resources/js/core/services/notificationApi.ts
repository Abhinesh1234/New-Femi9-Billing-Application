import axios, { AxiosError } from "axios";

const BASE = "/api/notifications";

interface ErrorResponse { success: false; message: string; }

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

export interface AppNotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export async function fetchNotifications(): Promise<{ success: true; data: AppNotificationItem[] } | ErrorResponse> {
  try {
    const { data } = await axios.get(BASE);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchUnreadCount(): Promise<{ success: true; count: number } | ErrorResponse> {
  try {
    const { data } = await axios.get(`${BASE}/unread-count`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function markNotificationRead(id: number): Promise<{ success: true; message: string } | ErrorResponse> {
  try {
    const { data } = await axios.post(`${BASE}/${id}/read`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function markAllNotificationsRead(): Promise<{ success: true; message: string } | ErrorResponse> {
  try {
    const { data } = await axios.post(`${BASE}/read-all`);
    return data;
  } catch (e) { return handleError(e); }
}

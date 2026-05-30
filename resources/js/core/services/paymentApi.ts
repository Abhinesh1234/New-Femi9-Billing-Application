import axios, { AxiosError } from "axios";

const BASE = "/api/payments";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = "open" | "closed" | "draft";

export interface PaymentListItem {
  id:               number;
  payment_number:   string;
  status:           PaymentStatus;
  payment_date:     string;
  amount:           string;
  unused_amount:    string;
  payment_mode:     string;
  reference_number: string | null;
  notes:            string | null;
  bank_charges:     string | null;
  tax_deducted:     boolean;
  customer_id:      number | null;
  location_id:      number | null;
  series_id:        number | null;
  created_at:       string;
  refunds_sum_amount?: string | null;
  customer?:        { id: number; display_name: string } | null;
  invoices?:        { id: number; invoice_number: string; pivot?: { applied_amount: string } }[] | null;
}

export interface PaymentListResult {
  data:  PaymentListItem[];
  total: number;
}

// ── Response shapes ────────────────────────────────────────────────────────────

interface ListResponse  { success: true; data: { data: PaymentListItem[]; total: number; current_page: number; last_page: number; per_page: number } }
interface ErrorResponse { success: false; message: string; errors?: Record<string, string[]> }

type ListResult = ListResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

// ── API functions ─────────────────────────────────────────────────────────────

export interface PaymentDetail {
  id:               number;
  payment_number:   string;
  status:           PaymentStatus;
  payment_date:     string;
  amount:           string;
  unused_amount:    string;
  bank_charges:     string | null;
  tax_deducted:     boolean;
  payment_mode:     string;
  reference_number: string | null;
  notes:            string | null;
  customer_id:      number | null;
  location_id:      number | null;
  series_id:        number | null;
  created_at:       string;
  updated_at:       string | null;
  customer?: { id: number; display_name: string; mobile: string | null } | null;
  location?: {
    id: number; name: string;
    address?: { street1?: string | null; street2?: string | null; city?: string | null; state?: string | null; country?: string | null; pin_code?: string | null; phone?: string | null } | null;
    website_url?: string | null;
    logo_path?: string | null;
  } | null;
  invoices?: {
    id: number; invoice_number: string; invoice_date: string; grand_total: string; status: string;
    pivot?: { applied_amount: string };
  }[] | null;
}

interface DetailResponse { success: true; data: PaymentDetail }
type DetailResult = DetailResponse | ErrorResponse;

export async function fetchPayment(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export interface PaymentRefundPayload {
  amount:           number;
  refunded_on:      string;
  payment_mode:     string;
  reference_number?: string | null;
  from_account_id?: number | null;
  description?:     string | null;
}

export async function createPaymentRefund(paymentId: number, payload: PaymentRefundPayload): Promise<{ success: true; data: any } | ErrorResponse> {
  try {
    const { data } = await axios.post(`${BASE}/${paymentId}/refund`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchPaymentRefunds(paymentId: number): Promise<{ success: true; data: any[] } | ErrorResponse> {
  try {
    const { data } = await axios.get(`${BASE}/${paymentId}/refunds`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updatePaymentRefund(paymentId: number, refundId: number, payload: PaymentRefundPayload): Promise<{ success: true; data: any } | ErrorResponse> {
  try {
    const { data } = await axios.put(`${BASE}/${paymentId}/refunds/${refundId}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyPaymentRefund(paymentId: number, refundId: number): Promise<{ success: true } | ErrorResponse> {
  try {
    const { data } = await axios.delete(`${BASE}/${paymentId}/refunds/${refundId}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyPayment(id: number): Promise<{ success: true } | ErrorResponse> {
  try {
    await axios.delete(`${BASE}/${id}`);
    return { success: true };
  } catch (e) { return handleError(e); }
}

// ── Activity log ──────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id:           number;
  event_type:   string;
  subject_type: string;
  subject_id:   number;
  related_type: string | null;
  related_id:   number | null;
  amount:       string | null;
  metadata:     Record<string, any> | null;
  performed_by: number | null;
  created_at:   string;
  performer:    { id: number; name: string } | null;
}

interface ActivityResponse { success: true; data: ActivityEntry[]; }

export async function fetchPaymentActivity(id: number): Promise<ActivityResponse | ErrorResponse> {
  try {
    const { data } = await axios.get<ActivityResponse>(`${BASE}/${id}/activity`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchPayments(params?: {
  search?:      string;
  status?:      string;
  customer_id?: number;
  from_date?:   string;
  to_date?:     string;
  page?:        number;
  per_page?:    number;
}): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

import axios, { AxiosError } from "axios";

const BASE = "/api/invoices";

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "void";

export interface InvoiceListItem {
  id:             number;
  invoice_number: string;
  status:         InvoiceStatus;
  invoice_date:   string;
  due_date:       string | null;
  grand_total:    string;
  total_paid:     string;
  balance_amount: string;
  customer?:      { id: number; display_name: string; distribution_category_id: number | null; distribution_category?: { id: number; name: string } | null } | null;
  location?:      { id: number; name: string } | null;
  created_at:     string;
  deleted_at:     string | null;
}

export interface InvoiceLineItem {
  id:           number;
  item_id:      number | null;
  item_name:    string;
  quantity:     string;
  unit_price:   string;
  base_rate:    string;
  gst_rate:     string | null;
  gst_amount:   string | null;
  amount:       string;
  sort_order:   number;
}

export interface InvoiceDetail {
  id:               number;
  invoice_number:   string;
  status:           InvoiceStatus;
  order_number:     string | null;
  invoice_date:     string;
  payment_terms:    string | null;
  due_date:         string | null;
  salesperson:      string | null;
  sub_total:        string;
  discount_type:    string | null;
  discount_value:   string | null;
  discount_amount:  string | null;
  tax_type:         string | null;
  tax_rate:         string | null;
  tax_amount:       string | null;
  total_charges:    string | null;
  grand_total:      string;
  total_paid:       string;
  credit_applied?:  string;
  balance_amount:   string;
  customer_notes:   string | null;
  terms_conditions: string | null;
  created_at:       string;
  updated_at:       string | null;
  deleted_at:       string | null;
  customer?:        { id: number; display_name: string; mobile: string | null; gst: string | null; distribution_category_id: number | null } | null;
  location?:        {
    id: number;
    name: string;
    logo_path?: string | null;
    website_url?: string | null;
    address?: {
      street1?: string | null;
      street2?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      pin_code?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  reference?:       { id: number; name: string; phone: string | null } | null;
  tax?:             { id: number; name: string; rate: string } | null;
  items?:           InvoiceLineItem[];
  attachments?:     { id: number; original_name: string; storage_path: string; file_size: number; mime_type: string }[];
  payments?:        { id: number; payment_number: string; payment_date: string; amount: string; payment_mode: string; source?: string; pivot?: { applied_amount: string } }[];
  charges_json?:      { label: string; amount: number }[] | null;
  pricelist_id?:      number | null;
  series_id?:         number | null;
  is_fully_credited?: boolean;
}

export interface InvoiceListMeta {
  current_page: number;
  last_page:    number;
  total:        number;
  per_page:     number;
}

// ── Response shapes ───────────────────────────────────────────────────────────

interface ListResponse   { success: true; data: { data: InvoiceListItem[]; current_page: number; last_page: number; total: number; per_page: number } }
interface DetailResponse { success: true; data: InvoiceDetail; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; errors?: Record<string, string[]>; }

type ListResult   = ListResponse   | ErrorResponse;
type DetailResult = DetailResponse | ErrorResponse;
type DeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchInvoices(params?: {
  search?: string;
  status?: string;
  customer_id?: number;
  distribution_category_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
  trashed?: boolean;
}): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchInvoice(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyInvoice(id: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function restoreInvoice(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.post<DetailResponse>(`${BASE}/${id}/restore`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function voidInvoice(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.patch<DetailResponse>(`${BASE}/${id}/void`);
    return data;
  } catch (e) { return handleError(e); }
}

// ── Activity log ──────────────────────────────────────────────────────────────

export interface InvoiceActivityEntry {
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

interface ActivityResponse { success: true; data: InvoiceActivityEntry[]; }
type ActivityResult = ActivityResponse | ErrorResponse;

export async function fetchInvoiceActivity(id: number): Promise<ActivityResult> {
  try {
    const { data } = await axios.get<ActivityResponse>(`${BASE}/${id}/activity`);
    return data;
  } catch (e) { return handleError(e); }
}

// ── Record payment ────────────────────────────────────────────────────────────

export interface RecordPaymentPayload {
  customer_id:       number;
  location_id?:      number | null;
  payment_date:      string;
  amount:            number;
  bank_charges?:     number | null;
  tax_deducted?:     boolean;
  payment_mode:      string;
  reference_number?: string | null;
  notes?:            string | null;
  invoice_id:        number;
  applied_amount:    number;
}

interface PaymentResponse { success: true; data: { id: number } & Record<string, unknown>; }
type PaymentResult = PaymentResponse | ErrorResponse;

export async function recordInvoicePayment(payload: RecordPaymentPayload): Promise<PaymentResult> {
  try {
    const { data } = await axios.post<PaymentResponse>("/api/payments", payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function deletePayment(id: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`/api/payments/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function unapplyPaymentFromInvoice(paymentId: number, invoiceId: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`/api/payments/${paymentId}/apply/${invoiceId}`);
    return data;
  } catch (e) { return handleError(e); }
}

interface ApplyResponse { success: true; data: Record<string, unknown>; }
type ApplyResult = ApplyResponse | ErrorResponse;

export async function applyPaymentToInvoice(
  paymentId: number,
  payload: { invoice_id: number; applied_amount: number }
): Promise<ApplyResult> {
  try {
    const { data } = await axios.post<ApplyResponse>(`/api/payments/${paymentId}/apply`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

interface AttachmentResponse { success: true; data: Record<string, unknown>; }
type AttachmentResult = AttachmentResponse | ErrorResponse;

export async function applyAdvanceToInvoice(
  invoiceId: number,
  amount: number
): Promise<{ success: boolean; data?: Record<string, unknown>; applied?: number; message?: string }> {
  try {
    const { data } = await axios.post(`/api/invoices/${invoiceId}/apply-advance`, { amount });
    return data;
  } catch (e) { return handleError(e) as any; }
}

export async function fetchAdvanceBalance(customerId: number): Promise<{ success: boolean; data: { balance: number }; message?: string }> {
  try {
    const { data } = await axios.get<{ success: true; data: { balance: number } }>(
      `/api/payments/advance-balance/${customerId}`
    );
    return data;
  } catch { return { success: false, data: { balance: 0 }, message: "Failed to fetch advance balance." }; }
}

export interface CustomerCreditEntry {
  id:             number;
  credit_note_id: number;
  amount:         string;
  unused_amount:  string;
  created_at:     string;
  credit_note?:   { id: number; credit_note_number: string } | null;
}

export async function fetchCustomerCreditBalance(customerId: number): Promise<{
  success: boolean;
  data: { balance: number; credits: CustomerCreditEntry[] };
  message?: string;
}> {
  try {
    const { data } = await axios.get(`/api/customer-credits/balance/${customerId}`);
    return data;
  } catch { return { success: false, data: { balance: 0, credits: [] }, message: "Failed to fetch credit balance." }; }
}

export interface AvailableCreditRow {
  type:               'credit_note' | 'excess_payment';
  id:                 number;
  transaction_number: string;
  transaction_date:   string | null;
  location:           string | null;
  credit_amount:      number;
  credits_available:  number;
}

export async function fetchAvailableCreditsBalance(customerId: number): Promise<{
  success: boolean;
  data: { rows: AvailableCreditRow[]; total: number; credit_note_balance: number; excess_payment_balance: number };
  message?: string;
}> {
  try {
    const { data } = await axios.get(`/api/customer-credits/available-balance/${customerId}`);
    return data;
  } catch { return { success: false, data: { rows: [], total: 0, credit_note_balance: 0, excess_payment_balance: 0 }, message: "Failed to fetch available credits." }; }
}

export async function applyAvailableCredits(
  invoiceId: number,
  credits: { type: string; id: number; amount: number }[],
): Promise<{ success: boolean; data?: Record<string, unknown>; applied?: number; message?: string }> {
  try {
    const { data } = await axios.post(`/api/invoices/${invoiceId}/apply-available-credits`, { credits });
    return data;
  } catch (e) { return handleError(e) as any; }
}

export async function applyCreditToInvoice(
  invoiceId: number,
  amount: number,
): Promise<{ success: boolean; data?: Record<string, unknown>; applied?: number; message?: string }> {
  try {
    const { data } = await axios.post(`/api/invoices/${invoiceId}/apply-credit`, { amount });
    return data;
  } catch (e) { return handleError(e) as any; }
}

export async function removeInvoiceCreditApplications(invoiceId: number): Promise<DetailResult> {
  try {
    const { data } = await axios.delete<DetailResponse>(`${BASE}/${invoiceId}/credit-applications`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function uploadPaymentAttachment(paymentId: number, file: File): Promise<AttachmentResult> {
  try {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axios.post<AttachmentResponse>(
      `/api/payments/${paymentId}/attachments`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (e) { return handleError(e); }
}

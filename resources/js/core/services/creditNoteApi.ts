import axios, { AxiosError } from "axios";

const BASE = "/api/credit-notes";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreditNoteStatus = "draft" | "issued";

export interface CreditNoteListItem {
  id:                 number;
  credit_note_number: string;
  status:             CreditNoteStatus;
  credit_note_date:   string;
  grand_total:        string;
  created_at:         string;
  deleted_at:         string | null;
  customer?:          { id: number; display_name: string } | null;
  location?:          { id: number; name: string } | null;
  source_invoice?:    { id: number; invoice_number: string } | null;
}

export interface CreditNoteListResult {
  data:  CreditNoteListItem[];
  total: number;
}

export interface CreditNoteLineItem {
  id:          number;
  item_id:     number | null;
  item_name:   string;
  quantity:    string;
  unit_price:  string;
  base_rate:   string;
  gst_rate:    string | null;
  gst_amount:  string | null;
  amount:      string;
  sort_order:  number;
}

export interface CreditNoteDetail {
  id:                 number;
  credit_note_number: string;
  status:             CreditNoteStatus;
  credit_note_date:   string;
  salesperson:        string | null;
  sub_total:          string;
  discount_type:      string | null;
  discount_value:     string | null;
  discount_amount:    string | null;
  tax_type:           string | null;
  tax_rate:           string | null;
  tax_amount:         string | null;
  total_charges:      string | null;
  charges_json:       { label: string; amount: number }[] | null;
  grand_total:        string;
  customer_notes:     string | null;
  terms_conditions:   string | null;
  created_at:         string;
  updated_at:         string | null;
  deleted_at:         string | null;
  customer?: {
    id: number; display_name: string; mobile: string | null; gst: string | null;
  } | null;
  location?: {
    id: number; name: string;
    logo_path?: string | null;
    website_url?: string | null;
    address?: {
      street1?: string | null; street2?: string | null;
      city?: string | null; state?: string | null;
      country?: string | null; pin_code?: string | null; phone?: string | null;
    } | null;
  } | null;
  tax?:           { id: number; name: string; rate: string } | null;
  items?:         CreditNoteLineItem[];
  attachments?:   { id: number; file_name: string; file_path: string; mime_type: string; file_size: number }[];
  source_invoice?:  { id: number; invoice_number: string } | null;
  customerCredit?: {
    id: number; amount: string; unused_amount: string; status: "open" | "closed";
    applications?: {
      id: number; customer_credit_id: number; invoice_id: number; applied_amount: string;
      invoice?: { id: number; invoice_number: string; invoice_date: string | null; grand_total: string; status: string } | null;
    }[];
  } | null;
}

// ── Response shapes ────────────────────────────────────────────────────────────

export interface CreditNoteActivityEntry {
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

interface ListResponse     { success: true; data: { data: CreditNoteListItem[]; total: number; current_page: number; last_page: number; per_page: number } }
interface DetailResponse   { success: true; data: CreditNoteDetail }
interface ActivityResponse { success: true; data: CreditNoteActivityEntry[] }
interface ErrorResponse    { success: false; message: string; errors?: Record<string, string[]> }

type ListResult   = ListResponse   | ErrorResponse;
type DetailResult = DetailResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchCreditNotes(params?: {
  search?:      string;
  customer_id?: number;
  location_id?: number;
  page?:        number;
  per_page?:    number;
}): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchCreditNote(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchCreditNoteActivity(id: number): Promise<ActivityResponse | ErrorResponse> {
  try {
    const { data } = await axios.get<ActivityResponse>(`${BASE}/${id}/activity`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyCreditNote(id: number): Promise<{ success: true } | ErrorResponse> {
  try {
    await axios.delete(`${BASE}/${id}`);
    return { success: true };
  } catch (e) { return handleError(e); }
}

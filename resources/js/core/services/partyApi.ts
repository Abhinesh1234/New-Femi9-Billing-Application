import axios, { AxiosError } from "axios";

const BASE = "/api/parties";

export interface PartySearchResult {
  id:          number;
  name:        string;
  mobile:      string | null;
  category:    string | null;
  category_id: number | null;
}

export async function searchParties(q: string, limit = 20, signal?: AbortSignal): Promise<PartySearchResult[]> {
  try {
    const { data } = await axios.get<{ success: boolean; data: PartySearchResult[] }>(
      `${BASE}/search`,
      { params: { q, limit }, signal }
    );
    return data.data ?? [];
  } catch {
    return [];
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PartyAddress {
  attention:  string | null;
  country_id: number | null;
  street1:    string | null;
  street2:    string | null;
  city:       string | null;
  state:      string | null;
  pin_code:   string | null;
  phone_code: string | null;
  phone:      string | null;
  fax:        string | null;
}

export interface PartyListItem {
  id:                          number;
  party_id:                    string;
  party_type:                  "business" | "individual";
  display_name:                string;
  company_name:                string | null;
  first_name:                  string | null;
  last_name:                   string | null;
  email:                       string | null;
  mobile_code:                 string | null;
  mobile:                      string | null;
  distribution_category_id:    number | null;
  distribution_sub_category_id: number | null;
  enable_portal:               boolean;
  is_active:                   boolean;
  party_image:                 string | null;
  currency:                    string | null;
  payment_terms:               string | null;
  created_at:                  string;
  parent_party_id?:            number | null;
  parent?:                     { id: number; display_name: string; party_type: string; mobile_code: string | null; mobile: string | null; distribution_category: { id: number; name: string } | null } | null;
  distribution_category?:      { id: number; name: string; code: string } | null;
  distribution_sub_category?:  { id: number; name: string } | null;
  created_by?:                 { id: number; name: string } | null;
}

// ── Full party detail (returned by GET /parties/:id) ─────────────────────────

export interface PartyAddressDetail {
  attention:  string | null;
  country_id: number | null;
  country:    { id: number; name: string } | null;
  street1:    string | null;
  street2:    string | null;
  city:       string | null;
  state:      string | null;
  pin_code:   string | null;
  phone_code: string | null;
  phone:      string | null;
  fax:        string | null;
}

export interface PartyContactPersonDetail {
  salutation:  string | null;
  name:        string;
  email:       string | null;
  mobile_code: string | null;
  mobile:      string | null;
}

export interface PartyLocationAssignment {
  party_id:         number;
  location_node_id: number;
  created_at:       string;
  location_node:    { id: number; name: string } | null;
}

export interface PartyDetail {
  id:                           number;
  party_id:                     string;
  party_type:                   "business" | "individual";
  salutation:                   string | null;
  first_name:                   string | null;
  last_name:                    string | null;
  company_name:                 string | null;
  display_name:                 string;
  email:                        string | null;
  work_phone_code:              string | null;
  work_phone:                   string | null;
  mobile_code:                  string | null;
  mobile:                       string | null;
  language:                     string | null;
  distribution_category_id:     number | null;
  distribution_sub_category_id: number | null;
  parent_party_id:              number | null;
  pan:                          string | null;
  gst:                          string | null;
  account_number:               string | null;
  ifsc_code:                    string | null;
  upi_number:                   string | null;
  currency:                     string | null;
  payment_terms:                string | null;
  enable_portal:                boolean;
  is_active:                    boolean;
  party_image:                  string | null;
  remarks:                      string | null;
  contact_persons:              PartyContactPersonDetail[] | null;
  created_at:                   string;
  updated_at:                   string | null;
  deleted_at:                   string | null;
  distribution_category:        { id: number; name: string; code: string } | null;
  distribution_sub_category:    { id: number; name: string } | null;
  parent:                       { id: number; display_name: string; party_type: string } | null;
  created_by:                   { id: number; name: string } | null;
  billing_address:              PartyAddressDetail | null;
  shipping_address:             PartyAddressDetail | null;
  locations:                    PartyLocationAssignment[];
  location_type:                "unified" | "separate" | null;
  role_id:                      number | null;
  role:                         { id: number; name: string } | null;
  permissions:                  PartyPermissionEntry[] | null;
}

export interface PartyPermissionEntry {
  module:       string;
  can_view:     boolean;
  can_create:   boolean;
  can_edit:     boolean;
  can_delete:   boolean;
  can_others:   boolean;
  others_data?: Record<string, unknown> | null;
}

export interface StorePartyAddressPayload {
  attention?:  string | null;
  country?:    string | null;
  street1?:    string | null;
  street2?:    string | null;
  city?:       string | null;
  state?:      string | null;
  pin_code?:   string | null;
  phone_code?: string | null;
  phone?:      string | null;
  fax?:        string | null;
}

export interface StorePartyPayload {
  party_type:                    "business" | "individual";
  salutation?:                   string | null;
  first_name?:                   string | null;
  last_name?:                    string | null;
  company_name?:                 string | null;
  display_name:                  string;
  email?:                        string | null;
  work_phone_code?:              string | null;
  work_phone?:                   string | null;
  mobile_code?:                  string | null;
  mobile?:                       string | null;
  language?:                     string | null;
  distribution_category_id?:     number | null;
  distribution_sub_category_id?: number | null;
  parent_party_id?:              number | null;
  pan?:                          string | null;
  gst?:                          string | null;
  account_number?:               string | null;
  ifsc_code?:                    string | null;
  upi_number?:                   string | null;
  currency?:                     string | null;
  payment_terms?:                string | null;
  enable_portal?:                boolean;
  party_image?:                  string | null;
  remarks?:                      string | null;
  contact_persons?: {
    salutation?:  string | null;
    name:         string;
    email?:       string | null;
    mobile_code?: string | null;
    mobile?:      string | null;
  }[];
  custom_fields?:    Record<string, string>;
  documents?: {
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }[];
  billing_address?:  StorePartyAddressPayload;
  shipping_address?: StorePartyAddressPayload;
  location_node_ids?: number[];
  location_type?: "unified" | "separate" | null;
  role_id?: number | null;
  permissions?: PartyPermissionEntry[] | null;
}

export interface PartyListMeta {
  current_page: number;
  last_page:    number;
  total:        number;
  per_page:     number;
}

interface ListResponse          { success: true; data: PartyListItem[]; meta: PartyListMeta; }
interface ItemResponse          { success: true; message: string; data: PartyListItem; }
interface DetailResponse        { success: true; data: PartyDetail; }
interface DeleteResponse        { success: true; message: string; }
interface UploadResponse        { success: true; path: string; file_name?: string; file_size?: number; mime_type?: string; }
interface IdResponse            { success: true; party_id: string; }
interface TakenLocationsResponse{ success: true; data: number[]; }
interface ErrorResponse         { success: false; message: string; errors?: Record<string, string[]>; }

type ListResult           = ListResponse           | ErrorResponse;
type ItemResult           = ItemResponse           | ErrorResponse;
type DetailResult         = DetailResponse         | ErrorResponse;
type DeleteResult         = DeleteResponse         | ErrorResponse;
type UploadResult         = UploadResponse         | ErrorResponse;
type IdResult             = IdResponse             | ErrorResponse;
type TakenLocationsResult = TakenLocationsResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error.", errors: body?.errors };
  }
  return { success: false, message: "Network error." };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchParties(params?: {
  party_type?: string;
  search?: string;
  trashed?: boolean;
  page?: number;
  per_page?: number;
  order_by?: string;
  order_dir?: string;
  distribution_category_id?: number;
  creator_type?: "company" | "party";
}): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

export async function checkPartyDisplayNameExists(
  name: string,
  excludeId?: number
): Promise<boolean> {
  try {
    const params: Record<string, string> = { name: name.trim() };
    if (excludeId !== undefined) params.exclude_id = String(excludeId);
    const { data } = await axios.get<{ success: boolean; data: { exists: boolean } }>(
      `${BASE}/check-display-name`,
      { params }
    );
    return data.data?.exists ?? false;
  } catch {
    return false; // fail open — don't block save on network error
  }
}

export async function fetchParty(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.get<ItemResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchPartyDetail(id: number): Promise<DetailResult> {
  try {
    const { data } = await axios.get<DetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeParty(payload: StorePartyPayload): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(BASE, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function updateParty(id: number, payload: Partial<StorePartyPayload>): Promise<ItemResult> {
  try {
    const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload);
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyParty(id: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function restoreParty(id: number): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(`${BASE}/${id}/restore`);
    return data;
  } catch (e) { return handleError(e); }
}

function compressPartyImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round((MAX / width) * height); width = MAX; }
        else                 { width  = Math.round((MAX / height) * width); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
        "image/jpeg",
        0.85,
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadPartyImage(file: File): Promise<UploadResult> {
  try {
    const compressed = await compressPartyImage(file);
    const form = new FormData();
    form.append("image", compressed, "image.jpg");
    const { data } = await axios.post<UploadResponse>(`${BASE}/upload-image`, form);
    return data;
  } catch (e) { return { ...handleError(e), success: false } as ErrorResponse; }
}

export async function uploadPartyDocument(file: File): Promise<UploadResult> {
  try {
    const form = new FormData();
    form.append("document", file);
    const { data } = await axios.post<UploadResponse>(`${BASE}/upload-document`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) { return { ...handleError(e), success: false } as ErrorResponse; }
}

export async function previewPartyId(partyType: string, categoryCode?: string): Promise<IdResult> {
  try {
    const { data } = await axios.get<IdResponse>(`${BASE}/preview-id`, {
      params: { party_type: partyType, category_code: categoryCode },
    });
    return data;
  } catch (e) { return handleError(e); }
}

export async function fetchTakenLocations(categoryId: number): Promise<TakenLocationsResult> {
  try {
    const { data } = await axios.get<TakenLocationsResponse>(`${BASE}/taken-locations`, {
      params: { distribution_category_id: categoryId },
    });
    return data;
  } catch (e) { return handleError(e); }
}

interface ToggleStatusResponse { success: true; message: string; is_active: boolean; }
type ToggleStatusResult = ToggleStatusResponse | ErrorResponse;

export async function togglePartyStatus(id: number): Promise<ToggleStatusResult> {
  try {
    const { data } = await axios.post<ToggleStatusResponse>(`${BASE}/${id}/toggle-status`);
    return data;
  } catch (e) { return handleError(e); }
}

export interface PartyReceivables {
  outstanding_receivables: number;
  unused_credits:          number;
}

interface ReceivablesResponse { success: true; data: PartyReceivables; }
type ReceivablesResult = ReceivablesResponse | ErrorResponse;

export async function fetchPartyReceivables(id: number): Promise<ReceivablesResult> {
  try {
    const { data } = await axios.get<ReceivablesResponse>(`${BASE}/${id}/receivables`);
    return data;
  } catch (e) { return handleError(e); }
}

export interface PartyChildItem {
  id:                       number;
  party_id:                 string;
  party_type:               "business" | "individual";
  display_name:             string;
  company_name:             string | null;
  mobile:                   string | null;
  is_active:                boolean;
  distribution_category_id: number | null;
  parent_party_id:          number | null;
  distribution_category?:   { id: number; name: string; code: string } | null;
}

interface ChildrenResponse { success: true; data: PartyChildItem[]; }
type ChildrenResult = ChildrenResponse | ErrorResponse;

export async function fetchPartyChildren(id: number): Promise<ChildrenResult> {
  try {
    const { data } = await axios.get<ChildrenResponse>(`${BASE}/${id}/children`);
    return data;
  } catch (e) { return handleError(e); }
}

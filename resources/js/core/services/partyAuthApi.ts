import axios, { AxiosError } from "axios";

export interface PartyCategoryOption {
  party_user_id: number;
  party_id:      number;
  party_name:    string | null;
  category_id:   number | null;
  category_name: string | null;
  last_login_at: string | null;
  is_active:     boolean;
}

export interface PartyPermissions {
  [module: string]: {
    view:        boolean;
    create:      boolean;
    edit:        boolean;
    delete:      boolean;
    others:      boolean;
    others_data?: { party_category_ids?: number[] | null } | null;
  };
}

export interface PartySettings {
  enable_composite_items: boolean;
  enable_price_lists:     boolean;
}

export interface PartyAuthUser {
  id:            number;
  party_id:      number;
  name:          string;
  email:         string | null;
  mobile:        string | null;
  user_type:     "party";
  role_id:       number | null;
  party_name:    string | null;
  party_type:    string | null;
  category_id:   number | null;
  category_name: string | null;
  last_login_at: string | null;
  categories:    PartyCategoryOption[];
  permissions:   PartyPermissions;
  settings:      PartySettings;
}

interface LoginSuccessResponse {
  success:    true;
  user_type:  "party";
  token:      string;
  token_type: string;
  user:       PartyAuthUser;
}

interface LoginPendingResponse {
  success:    true;
  user_type:  "party_pending";
  categories: PartyCategoryOption[];
}

interface MeResponse      { success: true;  user: PartyAuthUser }
interface MessageResponse { success: true;  message: string }
interface ErrorResponse   { success: false; message: string }

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const msg = (err.response.data as ErrorResponse)?.message;
    return { success: false, message: msg ?? "Unexpected error." };
  }
  return { success: false, message: "Network error. Please check your connection." };
}

// ── POST /api/party/auth/login ────────────────────────────────────────────────
export async function partyLogin(
  login: string,
  password: string
): Promise<LoginSuccessResponse | LoginPendingResponse | ErrorResponse> {
  try {
    const { data } = await axios.post("/api/party/auth/login", { login, password });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/select ───────────────────────────────────────────────
// Confirms category selection after a party_pending response.
export async function partySelect(
  login: string,
  password: string,
  party_user_id: number
): Promise<LoginSuccessResponse | ErrorResponse> {
  try {
    const { data } = await axios.post("/api/party/auth/select", { login, password, party_user_id });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/switch ───────────────────────────────────────────────
// Switches to a different distribution category (authenticated).
export async function partySwitchCategory(
  party_user_id: number
): Promise<LoginSuccessResponse | ErrorResponse> {
  try {
    const { data } = await axios.post("/api/party/auth/switch", { party_user_id });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/logout ───────────────────────────────────────────────
export async function partyLogout(): Promise<MessageResponse | ErrorResponse> {
  try {
    const { data } = await axios.post("/api/party/auth/logout");
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── GET /api/party/auth/me ────────────────────────────────────────────────────
export async function partyMe(): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.get("/api/party/auth/me");
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/change-password ──────────────────────────────────────
export async function partyChangePassword(
  current_password: string,
  new_password: string,
  new_password_confirmation: string
): Promise<MessageResponse | ErrorResponse> {
  try {
    const { data } = await axios.post("/api/party/auth/change-password", {
      current_password,
      new_password,
      new_password_confirmation,
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/avatar ───────────────────────────────────────────────
export async function partyUpdateAvatar(file: File): Promise<MeResponse | ErrorResponse> {
  try {
    const form = new FormData();
    form.append("image", file);
    const { data } = await axios.post("/api/party/auth/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── DELETE /api/party/auth/avatar ─────────────────────────────────────────────
export async function partyRemoveAvatar(): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.delete("/api/party/auth/avatar");
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── POST /api/party/auth/location/{id}/logo ──────────────────────────────────
export async function partyUpdateLocationLogo(locationId: number, file: File): Promise<MeResponse | ErrorResponse> {
  try {
    const form = new FormData();
    form.append("logo", file);
    const { data } = await axios.post(`/api/party/auth/location/${locationId}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── DELETE /api/party/auth/location/{id}/logo ─────────────────────────────────
export async function partyRemoveLocationLogo(locationId: number): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.delete(`/api/party/auth/location/${locationId}/logo`);
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── PUT /api/party/auth/location/{id}/address ─────────────────────────────────
export type AddressPayload = {
  attention?: string | null;
  country?:   string | null;
  street1?:   string | null;
  street2?:   string | null;
  city?:      string | null;
  state?:     string | null;
  pin_code?:  string | null;
  phone_code?: string | null;
  phone?:     string | null;
  fax?:       string | null;
};
export async function partyUpdateLocationAddress(
  locationId: number,
  billing?: AddressPayload | null,
  shipping?: AddressPayload | null,
): Promise<MeResponse | ErrorResponse> {
  try {
    const payload: Record<string, any> = {};
    if (billing  !== undefined) payload.billing  = billing;
    if (shipping !== undefined) payload.shipping = shipping;
    const { data } = await axios.put(`/api/party/auth/location/${locationId}/address`, payload);
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── PUT /api/party/auth/organisation ─────────────────────────────────────────
export async function partyUpdateOrganisation(display_name: string): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.put("/api/party/auth/organisation", { display_name });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

// ── PUT /api/party/auth/banking ───────────────────────────────────────────────
export async function partyUpdateBanking(payload: {
  account_number?: string | null;
  ifsc_code?:      string | null;
  upi_number?:     string | null;
}): Promise<MeResponse | ErrorResponse> {
  try {
    const { data } = await axios.put("/api/party/auth/banking", payload);
    return data;
  } catch (e) {
    return handleError(e);
  }
}

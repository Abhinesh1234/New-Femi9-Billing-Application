import axios, { AxiosError } from "axios";

const BASE_URL = "/api/custom-fields";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomFieldConfig {
  label: string;
  field_key: string;
  data_type: string;
  is_mandatory: boolean;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  help_text: string | null;
  show_in_transactions: boolean;
  show_in_all_pdfs: boolean;
  include_in_modules: string[];
  default_value: string | null;
  privacy: {
    is_pii: boolean;
    is_ephi: boolean;
    encrypt_data: boolean;
  };
  type_config: Record<string, unknown>;
}

export interface CustomField {
  id: number;
  config: CustomFieldConfig;
  created_at: string;
  updated_at: string;
}

export interface CfListResponse {
  success: true;
  module: string;
  data: CustomField[];
}

export interface CfSingleResponse {
  success: true;
  message: string;
  data: CustomField;
}

export interface CfDeleteResponse {
  success: true;
  message: string;
}

export interface CfErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type CfListResult   = CfListResponse   | CfErrorResponse;
export type CfSingleResult = CfSingleResponse | CfErrorResponse;
export type CfDeleteResult = CfDeleteResponse | CfErrorResponse;

// ─── API calls ────────────────────────────────────────────────────────────────

export async function storeCustomField(
  module: string,
  config: CustomFieldConfig
): Promise<CfSingleResult> {
  try {
    const { data } = await axios.post<CfSingleResponse>(BASE_URL, { module, config });
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function fetchCustomFields(module: string): Promise<CfListResult> {
  try {
    const { data } = await axios.get<CfListResponse>(`${BASE_URL}/${module}`);
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function fetchCustomField(id: number): Promise<CfSingleResult> {
  try {
    const { data } = await axios.get<CfSingleResponse>(`${BASE_URL}/show/${id}`);
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function updateCustomField(
  id: number,
  config: CustomFieldConfig
): Promise<CfSingleResult> {
  try {
    const { data } = await axios.put<CfSingleResponse>(`${BASE_URL}/${id}`, { config });
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function fetchAutoGeneratePreview(module: string): Promise<{ success: boolean; data: Record<string, string> }> {
  try {
    const { data } = await axios.get<{ success: true; data: Record<string, string> }>(
      `/api/${module}/auto-generate-preview`
    );
    return data;
  } catch {
    return { success: false, data: {} };
  }
}

export async function deleteCustomField(id: number): Promise<CfDeleteResult> {
  try {
    const { data } = await axios.delete<CfDeleteResponse>(`${BASE_URL}/${id}`);
    return data;
  } catch (err) {
    return handleError(err);
  }
}

// ─── Error normalisation ──────────────────────────────────────────────────────

function handleError(err: unknown): CfErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as CfErrorResponse;
    return {
      success: false,
      message: body?.message ?? "An unexpected error occurred.",
      errors: body?.errors,
    };
  }
  return {
    success: false,
    message: "Network error. Please check your connection.",
  };
}

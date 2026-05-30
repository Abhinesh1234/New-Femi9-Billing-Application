import axios, { AxiosError } from "axios";

const BASE_URL = "/api/settings";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerConfiguration {
  allow_duplicate_names: boolean;
  default_customer_type: "business" | "individual";
  credit_limit_enabled: boolean;
  credit_limit_action: "restrict" | "warn";
  include_sales_orders_in_credit: boolean;
  billing_address_format: string;
  shipping_address_format: string;
}

export interface ProductConfiguration {
  decimal_rate: number;
  dimension_unit: string;
  weight_unit: string;
  barcode_scan_using: string;
  allow_duplicate_names: boolean;
  enhanced_search: boolean;
  enable_price_lists: boolean;
  apply_price_list_line_item: boolean;
  enable_composite_items: boolean;
  inventory_start_date: string;
  enable_serial_tracking: boolean;
  enable_batch_tracking: boolean;
  tracking_preference: string;
  mandate_tracking: boolean;
  allow_duplicate_batch: boolean;
  allow_qty_to_sold_batch: boolean;
  allow_diff_selling_price: boolean;
  prevent_stock_below_zero: boolean;
  stock_level: "org" | "location";
  out_of_stock_warning: boolean;
  notify_reorder_point: boolean;
  notify_to_user_ids: number[];
  track_landed_cost: boolean;
}

export interface InvoiceConfiguration {
  allow_edit_sent_invoice: boolean;
  invoice_order_number: "sales_order_number" | "sales_order_ref_number";
  notify_online_payment: boolean;
  include_payment_receipt_thank_you: boolean;
  automate_thank_you_note: boolean;
  enable_qr_code: boolean;
  qr_code_type: "upi_id" | "invoice_url" | "custom";
  qr_upi_id: string;
  qr_upi_confirm: string;
  qr_description: string;
  qr_custom_content: string;
  hide_zero_value_line_items: boolean;
  terms_and_conditions: string;
  customer_notes: string;
  advanced_payment_enabled: boolean;
  advanced_payment_categories: number[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  module: string;
  configuration: T | null;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Client-side validation ───────────────────────────────────────────────────

export interface ValidationErrors {
  [field: string]: string;
}

export function validateProductSettings(
  data: ProductConfiguration
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.decimal_rate < 0 || data.decimal_rate > 6) {
    errors.decimal_rate = "Decimal rate must be between 0 and 6.";
  }

  if (!["cm", "mm", "in", "ft"].includes(data.dimension_unit)) {
    errors.dimension_unit = "Invalid dimension unit selected.";
  }

  if (!["kg", "g", "lb", "oz"].includes(data.weight_unit)) {
    errors.weight_unit = "Invalid weight unit selected.";
  }

  if (!["sku", "upc", "ean", "isbn"].includes(data.barcode_scan_using)) {
    errors.barcode_scan_using = "Invalid barcode scan field selected.";
  }

  if (!data.inventory_start_date) {
    errors.inventory_start_date = "Inventory start date is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.inventory_start_date)) {
    errors.inventory_start_date = "Date must be in YYYY-MM-DD format.";
  }

  if (
    data.prevent_stock_below_zero &&
    !["org", "location"].includes(data.stock_level)
  ) {
    errors.stock_level =
      'Stock level must be "Organization level" or "Location level".';
  }

  if (
    (data.enable_serial_tracking || data.enable_batch_tracking) &&
    !["packages", "invoices"].includes(data.tracking_preference)
  ) {
    errors.tracking_preference = "Please select a valid tracking preference.";
  }

  if (data.notify_reorder_point && (!data.notify_to_user_ids || data.notify_to_user_ids.length === 0)) {
    errors.notify_to_user_ids = "Please select at least one user to notify.";
  }

  return errors;
}

export function validateCustomerSettings(
  data: CustomerConfiguration
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!["business", "individual"].includes(data.default_customer_type)) {
    errors.default_customer_type = "Invalid customer type selected.";
  }

  if (data.credit_limit_enabled) {
    if (!["restrict", "warn"].includes(data.credit_limit_action)) {
      errors.credit_limit_action = "Please select a valid credit limit action.";
    }
  }

  if (!data.billing_address_format || data.billing_address_format.trim() === "") {
    errors.billing_address_format = "Billing address format is required.";
  } else if (data.billing_address_format.length > 2000) {
    errors.billing_address_format = "Billing address format must not exceed 2000 characters.";
  }

  if (!data.shipping_address_format || data.shipping_address_format.trim() === "") {
    errors.shipping_address_format = "Shipping address format is required.";
  } else if (data.shipping_address_format.length > 2000) {
    errors.shipping_address_format = "Shipping address format must not exceed 2000 characters.";
  }

  return errors;
}

export function validateInvoiceSettings(_data: InvoiceConfiguration): ValidationErrors {
  return {};
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch settings for a module.
 */
export async function fetchSettings<T>(
  module: string
): Promise<ApiResponse<T>> {
  try {
    const { data } = await axios.get<ApiSuccessResponse<T>>(
      `${BASE_URL}/${module}`
    );
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

/**
 * Save settings for a module.
 */
export async function saveSettings<T>(
  module: string,
  payload: T
): Promise<ApiResponse<T>> {
  try {
    const { data } = await axios.put<ApiSuccessResponse<T>>(
      `${BASE_URL}/${module}`,
      payload
    );
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
}

// ─── Error normalisation ──────────────────────────────────────────────────────

function handleAxiosError(err: unknown): ApiErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ApiErrorResponse;
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

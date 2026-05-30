import axios, { AxiosError } from "axios";

const BASE = "/api/items";

export interface ItemRefs {
  brand_id?:            number | null;
  category_id?:         number | null;
  hsn_code_id?:         number | null;
  gst_rate_id?:         number | null;
  sales_account_id?:    number | null;
  purchase_account_id?: number | null;
  inventory_account_id?:number | null;
}

export interface VariantPayload {
  combo_key:     string;
  name?:         string;
  sku?:          string;
  cost_price?:   number | null;
  selling_price?:number | null;
  image?:        string | null;
}

export interface ItemPayload {
  name:           string;
  item_type:      "goods" | "service";
  form_type:      "single" | "variants";
  unit?:          string | null;
  sku?:           string | null;
  description?:   string | null;
  image?:         string | null;
  refs?:          ItemRefs;
  product_tag?:   string | null;
  has_sales_info?:       boolean;
  selling_price?:        number | null;
  sales_description?:    string | null;
  has_purchase_info?:    boolean;
  cost_price?:           number | null;
  purchase_description?: string | null;
  preferred_vendor?:     string | null;
  track_inventory?:      boolean;
  valuation_method?:     "fifo" | "average" | null;
  reorder_point?:        number | null;
  is_returnable?:        boolean;
  dimensions?:           { length?: number | null; width?: number | null; height?: number | null; unit?: string } | null;
  weight?:               { value?: number | null; unit?: string } | null;
  identifiers?:          { upc?: string; mpn?: string; ean?: string; isbn?: string } | null;
  variation_config?:     { attribute: string; options: string[] }[] | null;
  custom_fields?:        Record<string, string> | null;
  variants?:             VariantPayload[];
  is_composite?:         boolean;
  composite_type?:       "assembly" | "kit" | null;
  components?:           ComponentPayload[];
  admin_only?:           boolean;
  points:                number;
}

export interface ComponentPayload {
  component_item_id: number;
  component_type:    "item" | "service";
  quantity:          number;
  selling_price?:    number | null;
  cost_price?:       number | null;
  sort_order?:       number;
}

interface ItemResponse  { success: true;  message: string; data: Record<string, unknown>; }
interface ErrorResponse { success: false; message: string; errors?: Record<string, string[]>; }

export type ItemResult = ItemResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const status = err.response.status;
    const body   = err.response.data as ErrorResponse;
    const msg    = body?.message ?? "Unexpected error.";

    // 422 = validation / business-rule failure; surface field errors to the form
    if (status === 422) {
      return { success: false, message: msg, errors: body?.errors };
    }
    // 403 = permission denied
    if (status === 403) {
      return { success: false, message: body?.message ?? "You don't have permission to perform this action." };
    }
    // 5xx = server-side failure; tell the user to retry
    if (status >= 500) {
      return { success: false, message: "A server error occurred. Please try again in a moment." };
    }
    return { success: false, message: msg, errors: body?.errors };
  }
  if (err instanceof AxiosError && !err.response) {
    return { success: false, message: "Network error. Please check your connection and try again." };
  }
  return { success: false, message: "An unexpected error occurred." };
}

export interface ItemComponentRecord {
  id:                 number;
  composite_item_id:  number;
  component_item_id:  number;
  component_type:     "item" | "service";
  quantity:           string;
  sort_order:         number;
  component_item?: {
    id:        number;
    name:      string;
    item_type: string;
    sku:       string | null;
    unit:      string | null;
  };
}

export interface ItemListRecord {
  id:           number;
  name:         string;
  item_type:    string;
  form_type:    string;
  sku:          string | null;
  unit:         string | null;
  selling_price:string | null;
  cost_price:   string | null;
  image:        string | null;
  refs:         ItemRefs | null;
  track_inventory: boolean;
  reorder_point:   number | null;
  created_at:   string;
  is_composite:    boolean;
  composite_type:  "assembly" | "kit" | null;
  components:      ItemComponentRecord[];
}

export interface ItemListResponse {
  success: true;
  data: {
    data:          ItemListRecord[];
    current_page:  number;
    last_page:     number;
    per_page:      number;
    total:         number;
  };
}

export type FetchItemsResult = ItemListResponse | ErrorResponse;

export async function fetchItems(params?: { search?: string; item_type?: string; page?: number; per_page?: number; exclude_composite?: boolean; trashed?: boolean }): Promise<FetchItemsResult> {
  try {
    const { data } = await axios.get<ItemListResponse>(BASE, { params });
    return data;
  } catch (e) { return handleError(e); }
}

interface RestoreItemResponse { success: true; message: string; }
export type RestoreItemResult = RestoreItemResponse | ErrorResponse;
export async function restoreItem(id: number): Promise<RestoreItemResult> {
  try { const { data } = await axios.post<RestoreItemResponse>(`${BASE}/${id}/restore`); return data; }
  catch (e) { return handleError(e); }
}

interface DeleteItemResponse { success: true; message: string; }
export type DeleteItemResult = DeleteItemResponse | ErrorResponse;
export async function deleteItem(id: number): Promise<DeleteItemResult> {
  try { const { data } = await axios.delete<DeleteItemResponse>(`${BASE}/${id}`); return data; }
  catch (e) { return handleError(e); }
}

interface ItemDetailResponse { success: true; data: Record<string, unknown>; }
export type FetchItemResult = ItemDetailResponse | ErrorResponse;

export async function fetchItem(id: number): Promise<FetchItemResult> {
  try {
    const { data } = await axios.get<ItemDetailResponse>(`${BASE}/${id}`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function storeItem(payload: ItemPayload): Promise<ItemResult> {
  try { const { data } = await axios.post<ItemResponse>(BASE, payload); return data; }
  catch (e) { return handleError(e); }
}

export async function updateItem(id: number, payload: Partial<ItemPayload>): Promise<ItemResult> {
  try { const { data } = await axios.put<ItemResponse>(`${BASE}/${id}`, payload); return data; }
  catch (e) { return handleError(e); }
}

interface ImageUploadResponse { success: true; path: string; url: string; }
export type ImageUploadResult = ImageUploadResponse | ErrorResponse;

/** Compress a File to a JPEG Blob using canvas (max 1200px, 85% quality). */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Revoke after the image is decoded — safe here, canvas already has the pixels
      URL.revokeObjectURL(objectUrl);

      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round((MAX / width) * height); width = MAX; }
        else                 { width  = Math.round((MAX / height) * width); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () => {
      // Always revoke to prevent memory leaks, even on failure
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

export async function uploadItemImage(file: File): Promise<ImageUploadResult> {
  try {
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("image", compressed, "image.jpg");
    const { data } = await axios.post<ImageUploadResponse>(`${BASE}/upload-image`, form);
    return data;
  } catch (e) {
    return handleError(e) as ErrorResponse;
  }
}

export async function uploadCustomFieldFile(file: File): Promise<ImageUploadResult> {
  try {
    const form = new FormData();
    form.append("file", file, file.name);
    const { data } = await axios.post<ImageUploadResponse>(`${BASE}/upload-attachment`, form);
    return data;
  } catch (e) {
    return handleError(e) as ErrorResponse;
  }
}

export interface ItemStockEntry {
  location_id:        number;
  stock_on_hand:      string;
  committed_stock:    string;
  available_for_sale: string;
}

interface StockResponse  { success: true; data: ItemStockEntry[]; }
type StockResult = StockResponse | ErrorResponse;

export async function fetchItemStock(itemId: number): Promise<StockResult> {
  try {
    const { data } = await axios.get<StockResponse>(`${BASE}/${itemId}/stock`);
    return data;
  } catch (e) { return handleError(e) as ErrorResponse; }
}

interface StockBatchResponse { success: true; data: Record<string, string>; } // item_id string → available_for_sale
type StockBatchResult = StockBatchResponse | ErrorResponse;

export async function fetchStockBatch(itemIds: number[], locationId: number): Promise<StockBatchResult> {
  try {
    const { data } = await axios.post<StockBatchResponse>(`${BASE}/stock-batch`, { item_ids: itemIds, location_id: locationId });
    return data;
  } catch (e) { return handleError(e) as ErrorResponse; }
}

interface StockTotalsResponse { success: true; data: Record<string, string>; } // item_id string → stock_on_hand (all locations summed)
type StockTotalsResult = StockTotalsResponse | ErrorResponse;

export async function fetchStockTotals(itemIds: number[]): Promise<StockTotalsResult> {
  try {
    const { data } = await axios.post<StockTotalsResponse>(`${BASE}/stock-totals`, { item_ids: itemIds });
    return data;
  } catch (e) { return handleError(e) as ErrorResponse; }
}

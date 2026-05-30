import axios, { AxiosError } from "axios";

export interface InventorySummaryRow {
  item_id:            number;
  item_name:          string;
  sku:                string | null;
  unit:               string | null;
  image:              string | null;
  stock_on_hand:      number;
  committed:          number;
  available_for_sale: number;
}

interface SummarySuccess {
  success: true;
  data:    InventorySummaryRow[];
}

interface SummaryError {
  success: false;
  message: string;
}

type SummaryResponse = SummarySuccess | SummaryError;

export async function fetchInventorySummary(params?: {
  location_id?: number;
  as_of_date?:  string;
  party_id?:    number;
}): Promise<SummaryResponse> {
  try {
    const { data } = await axios.get<SummarySuccess>("/api/inventory/summary", { params });
    return data;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const body = err.response.data as SummaryError;
      return { success: false, message: body?.message ?? "Unexpected error." };
    }
    return { success: false, message: "Network error." };
  }
}

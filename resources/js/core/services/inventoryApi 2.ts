import axios from "axios";

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

interface SummaryResponse {
  success: boolean;
  data:    InventorySummaryRow[];
  message?: string;
}

export async function fetchInventorySummary(params?: {
  location_id?: number;
  as_of_date?:  string;
}): Promise<SummaryResponse> {
  const res = await axios.get<SummaryResponse>("/api/inventory/summary", { params });
  return res.data;
}

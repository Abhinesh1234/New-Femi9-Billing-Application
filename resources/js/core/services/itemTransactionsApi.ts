import axios from "axios";

export type TransactionStatus = "all" | "draft" | "sent" | "paid" | "partially_paid" | "overdue" | "void";

export interface TransactionRow {
  invoice_id: number;
  invoice_number: string;
  invoice_date: string;
  status: string;
  customer_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface TransactionMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

type SuccessResponse = { success: true; data: TransactionRow[]; meta: TransactionMeta };
type ErrorResponse   = { success: false; message: string };

export async function fetchItemTransactions(
  itemId: number,
  params: { status?: TransactionStatus; page?: number; per_page?: number }
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const { data } = await axios.get<SuccessResponse>(`/api/items/${itemId}/transactions`, { params });
    return data;
  } catch {
    return { success: false, message: "Failed to load transactions." };
  }
}

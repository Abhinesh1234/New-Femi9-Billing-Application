import axios from "axios";

export type SalesPeriod = "week" | "month" | "quarter" | "year";

export interface SalesChartData {
  labels:  string[];
  amounts: number[];
  total:   number;
}

type SuccessResponse = { success: true } & SalesChartData;
type ErrorResponse   = { success: false; message: string };

export async function fetchItemSalesChart(
  itemId: number,
  period: SalesPeriod
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const { data } = await axios.get<SuccessResponse>(
      `/api/items/${itemId}/sales-chart`,
      { params: { period } }
    );
    return data;
  } catch {
    return { success: false, message: "Failed to load sales data." };
  }
}

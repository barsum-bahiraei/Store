import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { InvoiceListItem } from "../types/invoice";

export async function getInvoices(signal?: AbortSignal): Promise<InvoiceListItem[]> {
  const { data } = await apiClient.get<ApiResponse<InvoiceListItem[]>>("/Invoice", { signal });
  return resolveApiResponse(data, "بارگذاری سفارش‌ها انجام نشد.");
}

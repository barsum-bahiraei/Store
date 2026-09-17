import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { InvoiceListItem } from "../types/invoice";

export async function getCompletedInvoices(signal?: AbortSignal): Promise<InvoiceListItem[]> {
  const { data } = await apiClient.get<ApiResponse<InvoiceListItem[]>>("/Invoice", { signal });
  return resolveApiResponse(data, "بارگذاری خریدهای تکمیل‌شده انجام نشد.");
}

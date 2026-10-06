import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CheckoutOutput } from "@/features/checkout/types/checkout";
import type { InvoiceListItem } from "../types/invoice";

export async function getInvoices(signal?: AbortSignal): Promise<InvoiceListItem[]> {
  const { data } = await apiClient.get<ApiResponse<InvoiceListItem[]>>("/Invoice", { signal });
  return resolveApiResponse(data, "بارگذاری سفارش‌ها انجام نشد.");
}

export async function retryInvoicePayment(invoiceId: number): Promise<CheckoutOutput> {
  const { data } = await apiClient.post<ApiResponse<CheckoutOutput>>(`/Invoice/${invoiceId}/Payment`);
  return resolveApiResponse(data, "پرداخت مجدد سفارش انجام نشد.");
}

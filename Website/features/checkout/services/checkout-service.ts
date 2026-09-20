import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CheckoutInput, CheckoutOutput } from "../types/checkout";

export async function checkout(input: CheckoutInput): Promise<CheckoutOutput> {
  const { data } = await apiClient.post<ApiResponse<CheckoutOutput>>("/Invoice/Checkout", input);
  return resolveApiResponse(data, "ثبت سفارش انجام نشد.");
}

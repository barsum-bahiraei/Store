import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CheckoutInput, CheckoutOutput, DiscountValidationInput, DiscountValidationOutput } from "../types/checkout";

export async function checkout(input: CheckoutInput): Promise<CheckoutOutput> {
  const { data } = await apiClient.post<ApiResponse<CheckoutOutput>>("/Invoice/Checkout", input);
  return resolveApiResponse(data, "ثبت سفارش انجام نشد.");
}

export async function validateDiscount(input: DiscountValidationInput): Promise<DiscountValidationOutput> {
  const { data } = await apiClient.post<ApiResponse<DiscountValidationOutput>>("/Invoice/Discount/Validate", input);
  return resolveApiResponse(data, "کد تخفیف معتبر نیست.");
}

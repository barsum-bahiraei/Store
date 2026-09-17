import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CartItem, CreateCartItemInput, UpdateCartItemInput } from "../types/cart";

const endpoint = "/Invoice/Order";

export async function getCart(signal?: AbortSignal): Promise<CartItem[]> {
  const { data } = await apiClient.get<ApiResponse<CartItem[]>>(endpoint, { signal });
  return resolveApiResponse(data, "بارگذاری سبد خرید انجام نشد.");
}

export async function createCartItem(input: CreateCartItemInput): Promise<CartItem> {
  const { data } = await apiClient.post<ApiResponse<CartItem>>(endpoint, input);
  return resolveApiResponse(data, "افزودن محصول انجام نشد.");
}

export async function updateCartItem(id: number, input: UpdateCartItemInput): Promise<CartItem> {
  const { data } = await apiClient.put<ApiResponse<CartItem>>(`${endpoint}/${id}`, input);
  return resolveApiResponse(data, "به‌روزرسانی محصول انجام نشد.");
}

export async function deleteCartItem(id: number): Promise<void> {
  const { data } = await apiClient.delete<ApiResponse<boolean>>(`${endpoint}/${id}`);
  if (!resolveApiResponse(data, "حذف محصول انجام نشد.")) {
    throw new Error("حذف محصول انجام نشد.");
  }
}

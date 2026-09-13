import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CartItem, CreateCartItemInput, UpdateCartItemInput } from "../types/cart";

// Invoice routes are at the API host root, outside the /api prefix.
const invoiceConfig = {
  baseURL: (apiClient.defaults.baseURL ?? "").replace(/\/api\/?$/, ""),
};
const endpoint = "/Invoice/Pre";

export async function getCart(signal?: AbortSignal): Promise<CartItem[]> {
  const { data } = await apiClient.get<ApiResponse<CartItem[]>>(endpoint, {
    ...invoiceConfig,
    signal,
  });
  return resolveApiResponse(data, "Unable to load your cart.");
}

export async function createCartItem(input: CreateCartItemInput): Promise<CartItem> {
  const { data } = await apiClient.post<ApiResponse<CartItem>>(endpoint, input, invoiceConfig);
  return resolveApiResponse(data, "Unable to add this product.");
}

export async function updateCartItem(id: number, input: UpdateCartItemInput): Promise<CartItem> {
  const { data } = await apiClient.put<ApiResponse<CartItem>>(`${endpoint}/${id}`, input, invoiceConfig);
  return resolveApiResponse(data, "Unable to update this product.");
}

export async function deleteCartItem(id: number): Promise<void> {
  const { data } = await apiClient.delete<ApiResponse<boolean>>(`${endpoint}/${id}`, invoiceConfig);
  if (!resolveApiResponse(data, "Unable to remove this product.")) {
    throw new Error("Unable to remove this product.");
  }
}

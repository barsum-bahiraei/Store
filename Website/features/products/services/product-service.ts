import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { CreateProductCommentInput, CreatedProductComment, ProductBrandListItem, ProductDetail, ProductSearchInput, ProductSearchResult } from "../types/product";

export async function searchProducts(input: ProductSearchInput, signal?: AbortSignal): Promise<ProductSearchResult> {
  const { data } = await apiClient.post<ApiResponse<ProductSearchResult>>("/Product/Search", input, { signal });
  return resolveApiResponse(data, "بارگذاری محصولات انجام نشد.");
}

export async function getProductDetail(id: number, signal?: AbortSignal): Promise<ProductDetail> {
  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(`/Product/Detail/${id}`, { signal });
  return resolveApiResponse(data, "بارگذاری این محصول انجام نشد.");
}

export async function getProductBrands(signal?: AbortSignal): Promise<ProductBrandListItem[]> {
  const { data } = await apiClient.get<ApiResponse<ProductBrandListItem[]>>("/Product/Brand", { signal });
  return resolveApiResponse(data, "بارگذاری برندها انجام نشد.");
}

export async function createProductComment(productId: number, input: CreateProductCommentInput): Promise<CreatedProductComment> {
  const { data } = await apiClient.post<ApiResponse<CreatedProductComment>>(`/Product/Comment/${productId}`, input);
  return resolveApiResponse(data, "ثبت نظر انجام نشد.");
}

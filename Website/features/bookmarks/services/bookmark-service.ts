import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { BookmarkItem } from "../types/bookmark";

export async function getBookmarks(signal?: AbortSignal): Promise<BookmarkItem[]> {
  const { data } = await apiClient.get<ApiResponse<BookmarkItem[]>>("/Product/Bookmark", { signal });
  return resolveApiResponse(data, "بارگذاری علاقه‌مندی‌ها انجام نشد.");
}

export async function addBookmark(productId: number): Promise<void> {
  const { data } = await apiClient.post<ApiResponse<void>>(`/Product/Bookmark/${productId}`);
  resolveApiResponse(data, "افزودن به علاقه‌مندی‌ها انجام نشد.");
}

export async function removeBookmark(productId: number): Promise<void> {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/Product/Bookmark/${productId}`);
  resolveApiResponse(data, "حذف از علاقه‌مندی‌ها انجام نشد.");
}

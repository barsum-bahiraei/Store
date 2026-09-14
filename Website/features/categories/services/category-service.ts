import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { Category } from "../types/category";

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/Category", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری دسته‌بندی‌ها انجام نشد.");
}

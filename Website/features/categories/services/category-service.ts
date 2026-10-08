import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { BestSellingCategory, Category } from "../types/category";

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/Category", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری دسته‌بندی‌ها انجام نشد.");
}

export async function getBestSellingCategories(signal?: AbortSignal): Promise<BestSellingCategory[]> {
  const { data } = await apiClient.get<ApiResponse<BestSellingCategory[]>>("/Category/BestSelling", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری دسته‌بندی‌های محبوب انجام نشد.");
}

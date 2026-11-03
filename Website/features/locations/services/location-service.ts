import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { LocationOption } from "../types/location";

export async function getProvinces(signal?: AbortSignal): Promise<LocationOption[]> {
  const { data } = await apiClient.get<ApiResponse<LocationOption[]>>("/Location/Province", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری استان‌ها انجام نشد.");
}

export async function getCities(provinceId: number, signal?: AbortSignal): Promise<LocationOption[]> {
  const { data } = await apiClient.get<ApiResponse<LocationOption[]>>(`/Location/Province/${provinceId}/City`, {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری شهرها انجام نشد.");
}

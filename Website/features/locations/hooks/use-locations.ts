"use client";

import { useQuery } from "@tanstack/react-query";
import { getCities, getProvinces } from "../services/location-service";

export const locationKeys = {
  provinces: ["locations", "provinces"] as const,
  cities: (provinceId: number) => ["locations", "provinces", provinceId, "cities"] as const,
};

export function useProvinces() {
  return useQuery({
    queryKey: locationKeys.provinces,
    queryFn: ({ signal }) => getProvinces(signal),
  });
}

export function useCities(provinceId: number) {
  return useQuery({
    queryKey: locationKeys.cities(provinceId),
    queryFn: ({ signal }) => getCities(provinceId, signal),
    enabled: Number.isSafeInteger(provinceId) && provinceId > 0,
  });
}

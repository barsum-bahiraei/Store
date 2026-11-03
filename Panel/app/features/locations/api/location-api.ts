import { httpClient } from "~/shared/http/http-client";
import { dedupe } from "~/shared/http/dedupe";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type { LocationOption } from "../models/location";

export const locationApi = {
  provinces(): Promise<LocationOption[]> {
    return dedupe("locations:provinces", async () => {
      const { data } = await httpClient.get<ApiResult<LocationOption[]>>("/api/Location/Province");
      return resolveResult(data, "بارگذاری استان‌ها ناموفق بود");
    });
  },

  cities(provinceId: number): Promise<LocationOption[]> {
    return dedupe(`locations:cities:${provinceId}`, async () => {
      const { data } = await httpClient.get<ApiResult<LocationOption[]>>(
        `/api/Location/Province/${provinceId}/City`,
      );
      return resolveResult(data, "بارگذاری شهرها ناموفق بود");
    });
  },
};

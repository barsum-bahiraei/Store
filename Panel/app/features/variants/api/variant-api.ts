import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type { ProductVariant, ProductVariantInput } from "../models/variant";

let variantsRequest: Promise<ProductVariant[]> | null = null;

export const variantApi = {
  async list(): Promise<ProductVariant[]> {
    if (!variantsRequest) {
      variantsRequest = httpClient
        .get<ApiResult<ProductVariant[]>>("/api/Product/Variant")
        .then(({ data }) => resolveResult(data, "Failed to load colors"))
        .finally(() => {
          variantsRequest = null;
        });
    }
    return variantsRequest;
  },

  async get(id: number): Promise<ProductVariant> {
    const { data } = await httpClient.get<ApiResult<ProductVariant>>(`/api/Product/Variant/${id}`);
    return resolveResult(data, "Failed to load color");
  },

  async create(input: ProductVariantInput): Promise<ProductVariant> {
    const { data } = await httpClient.post<ApiResult<ProductVariant>>("/api/Product/Variant", input);
    return resolveResult(data, "Failed to create color");
  },

  async update(id: number, input: ProductVariantInput): Promise<ProductVariant> {
    const { data } = await httpClient.put<ApiResult<ProductVariant>>(`/api/Product/Variant/${id}`, input);
    return resolveResult(data, "Failed to update color");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Product/Variant/${id}`);
    resolveResult(data, "Failed to delete color");
  },
};

import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  SellerCreateInput,
  SellerCreateOutput,
  SellerGetOutput,
  SellerListOutput,
  SellerUpdateInput,
  SellerUpdateOutput,
} from "../models/seller";

export const sellerApi = {
  async list(): Promise<SellerListOutput[]> {
    const { data } = await httpClient.get<ApiResult<SellerListOutput[]>>("/api/Seller");
    return resolveResult(data, "Failed to load sellers");
  },

  async get(id: number): Promise<SellerGetOutput> {
    const { data } = await httpClient.get<ApiResult<SellerGetOutput>>(`/api/Seller/${id}`);
    return resolveResult(data, "Failed to load seller");
  },

  async create(input: SellerCreateInput): Promise<SellerCreateOutput> {
    const { data } = await httpClient.post<ApiResult<SellerCreateOutput>>("/api/Seller", input);
    return resolveResult(data, "Failed to create seller");
  },

  async update(id: number, input: SellerUpdateInput): Promise<SellerUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<SellerUpdateOutput>>(`/api/Seller/${id}`, input);
    return resolveResult(data, "Failed to update seller");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Seller/${id}`);
    resolveResult(data, "Failed to delete seller");
  },
};

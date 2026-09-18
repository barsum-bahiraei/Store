import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  SellerCreateInput,
  SellerCreateOutput,
  SellerGetOutput,
  SellerImageOutput,
  SellerImageSaveInput,
  SellerListOutput,
  SellerUpdateInput,
  SellerUpdateOutput,
} from "../models/seller";

let sellersRequest: Promise<SellerListOutput[]> | null = null;
const sellerRequests = new Map<number, Promise<SellerGetOutput>>();

export const sellerApi = {
  async list(): Promise<SellerListOutput[]> {
    if (!sellersRequest) {
      sellersRequest = httpClient
        .get<ApiResult<SellerListOutput[]>>("/api/Seller")
        .then(({ data }) => resolveResult(data, "Failed to load sellers"))
        .finally(() => {
          sellersRequest = null;
        });
    }
    return sellersRequest;
  },

  async get(id: number): Promise<SellerGetOutput> {
    const pending = sellerRequests.get(id);
    if (pending) return pending;

    const request = httpClient
      .get<ApiResult<SellerGetOutput>>(`/api/Seller/${id}`)
      .then(({ data }) => resolveResult(data, "Failed to load seller"))
      .finally(() => {
        sellerRequests.delete(id);
      });
    sellerRequests.set(id, request);
    return request;
  },

  async create(input: SellerCreateInput): Promise<SellerCreateOutput> {
    const { data } = await httpClient.post<ApiResult<SellerCreateOutput>>("/api/Seller", input);
    return resolveResult(data, "Failed to create seller");
  },

  async update(id: number, input: SellerUpdateInput): Promise<SellerUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<SellerUpdateOutput>>(`/api/Seller/${id}`, input);
    return resolveResult(data, "Failed to update seller");
  },

  async saveImage(input: SellerImageSaveInput): Promise<SellerImageOutput> {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("name", input.name);
    formData.append("tableName", "1");
    formData.append("targetId", String(input.sellerId));
    formData.append("targetName", "1");
    formData.append("isMain", "true");
    formData.append("fileType", String(input.fileType));

    const request = input.imageId === undefined
      ? httpClient.post<ApiResult<SellerImageOutput>>("/api/File", formData)
      : httpClient.put<ApiResult<SellerImageOutput>>(`/api/File/${input.imageId}`, formData);
    const { data } = await request;
    return resolveResult(data, "Failed to save seller image");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Seller/${id}`);
    resolveResult(data, "Failed to delete seller");
  },
};

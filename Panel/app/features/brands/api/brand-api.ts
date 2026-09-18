import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  Brand,
  BrandImage,
  BrandImageSaveInput,
  BrandInput,
  BrandSaveOutput,
} from "../models/brand";

let brandsRequest: Promise<Brand[]> | null = null;

export const brandApi = {
  async list(): Promise<Brand[]> {
    if (!brandsRequest) {
      brandsRequest = httpClient
        .get<ApiResult<Brand[]>>("/api/Product/Brand")
        .then(({ data }) => resolveResult(data, "Failed to load brands"))
        .finally(() => {
          brandsRequest = null;
        });
    }
    return brandsRequest;
  },

  async get(id: number): Promise<Brand> {
    const { data } = await httpClient.get<ApiResult<Brand>>(`/api/Product/Brand/${id}`);
    return resolveResult(data, "Failed to load brand");
  },

  async create(input: BrandInput): Promise<BrandSaveOutput> {
    const { data } = await httpClient.post<ApiResult<BrandSaveOutput>>("/api/Product/Brand", input);
    return resolveResult(data, "Failed to create brand");
  },

  async update(id: number, input: BrandInput): Promise<BrandSaveOutput> {
    const { data } = await httpClient.put<ApiResult<BrandSaveOutput>>(`/api/Product/Brand/${id}`, input);
    return resolveResult(data, "Failed to update brand");
  },

  async saveImage(input: BrandImageSaveInput): Promise<BrandImage> {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("name", input.name);
    formData.append("tableName", "2");
    formData.append("targetId", String(input.brandId));
    formData.append("targetName", "2");
    formData.append("isMain", "true");
    formData.append("fileType", String(input.fileType));

    const request = input.imageId === undefined
      ? httpClient.post<ApiResult<BrandImage>>("/api/File", formData)
      : httpClient.put<ApiResult<BrandImage>>(`/api/File/${input.imageId}`, formData);
    const { data } = await request;
    return resolveResult(data, "Failed to save brand image");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Product/Brand/${id}`);
    resolveResult(data, "Failed to delete brand");
  },
};

import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  ProductCreateInput,
  ProductCreateOutput,
  ProductGetOutput,
  ProductImageOutput,
  ProductImageUploadInput,
  ProductListOutput,
  ProductListParams,
  ProductUpdateInput,
  ProductUpdateOutput,
} from "../models/product";

const productRequests = new Map<number, Promise<ProductGetOutput>>();
const productCache = new Map<number, ProductGetOutput>();

export const productApi = {
  async list(params?: ProductListParams): Promise<ProductListOutput[]> {
    const query: Record<string, string> = {};
    if (params?.name) query.name = params.name;
    if (params?.categoryId) query.categoryId = String(params.categoryId);
    if (params?.sellerId) query.sellerId = String(params.sellerId);
    if (params?.minPrice != null) query.minPrice = String(params.minPrice);
    if (params?.maxPrice != null) query.maxPrice = String(params.maxPrice);
    if (params?.isAvailable != null) query.isAvailable = String(params.isAvailable);
    const { data } = await httpClient.get<ApiResult<ProductListOutput[]>>("/api/Product", { params: query });
    return resolveResult(data, "Failed to load products");
  },

  async create(input: ProductCreateInput): Promise<ProductCreateOutput> {
    const { data } = await httpClient.post<ApiResult<ProductCreateOutput>>("/api/Product", input);
    return resolveResult(data, "Failed to create product");
  },

  async get(id: number): Promise<ProductGetOutput> {
    const cached = productCache.get(id);
    if (cached) return cached;

    const pending = productRequests.get(id);
    if (pending) return pending;

    const request = httpClient
      .get<ApiResult<ProductGetOutput>>(`/api/Product/${id}`)
      .then(({ data }) => {
        const product = resolveResult(data, "Failed to load product");
        productCache.set(id, product);
        return product;
      })
      .finally(() => {
        productRequests.delete(id);
      });
    productRequests.set(id, request);
    return request;
  },

  async update(id: number, input: ProductUpdateInput): Promise<ProductUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<ProductUpdateOutput>>(
      `/api/Product/${id}`,
      input
    );
    const product = resolveResult(data, "Failed to update product");
    productCache.delete(id);
    return product;
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Product/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete product");
    }
    productCache.delete(id);
  },

  async uploadImage(input: ProductImageUploadInput): Promise<ProductImageOutput> {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("name", input.name);
    formData.append("tableName", "0");
    formData.append("targetId", String(input.productId));
    formData.append("targetName", "0");
    formData.append("isMain", String(input.isMain));
    formData.append("fileType", String(input.fileType));

    const { data } = await httpClient.post<ApiResult<ProductImageOutput>>("/api/File", formData);
    const image = resolveResult(data, `Failed to upload ${input.file.name}`);
    productCache.delete(input.productId);
    return image;
  },

  async removeImage(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/File/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete image");
    }
    productCache.clear();
  },
};

import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type { CategoryAttributeAddInput } from "../models/input/category-attribute-add-input";
import type { CategoryAttributeAddOutput } from "../models/output/category-attribute-add-output";
import type { CategoryAttributeListOutput } from "../models/output/category-attribute-list-output";
import type { CategoryCreateInput } from "../models/input/category-create-input";
import type { CategoryCreateOutput } from "../models/output/category-create-output";
import type { CategoryGetOutput } from "../models/output/category-get-output";
import type { CategoryListOutput } from "../models/output/category-list-output";
import type { CategoryUpdateInput } from "../models/input/category-update-input";
import type { CategoryUpdateOutput } from "../models/output/category-update-output";

let categoriesRequest: Promise<CategoryListOutput[]> | null = null;
let categoriesCache: CategoryListOutput[] | null = null;
const categoryAttributesRequests = new Map<number, Promise<CategoryAttributeListOutput[]>>();
const categoryAttributesCache = new Map<number, CategoryAttributeListOutput[]>();

export const categoryApi = {
  async list(): Promise<CategoryListOutput[]> {
    if (categoriesCache) return categoriesCache;
    if (!categoriesRequest) {
      categoriesRequest = httpClient
        .get<ApiResult<CategoryListOutput[]>>("/api/Category")
        .then(({ data }) => {
          categoriesCache = resolveResult(data, "Failed to load categories");
          return categoriesCache;
        })
        .finally(() => {
          categoriesRequest = null;
        });
    }
    return categoriesRequest;
  },

  async get(id: number): Promise<CategoryGetOutput> {
    const { data } = await httpClient.get<ApiResult<CategoryGetOutput>>(`/api/Category/${id}`);
    return resolveResult(data, "Failed to load category");
  },

  async create(input: CategoryCreateInput): Promise<CategoryCreateOutput> {
    const { data } = await httpClient.post<ApiResult<CategoryCreateOutput>>("/api/Category", input);
    const category = resolveResult(data, "Failed to create category");
    categoriesCache = null;
    return category;
  },

  async update(id: number, input: CategoryUpdateInput): Promise<CategoryUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<CategoryUpdateOutput>>(
      `/api/Category/${id}`,
      input
    );
    const category = resolveResult(data, "Failed to update category");
    categoriesCache = null;
    return category;
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Category/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete category");
    }
    categoriesCache = null;
    categoryAttributesCache.delete(id);
  },

  async listCategoryAttributes(categoryId: number): Promise<CategoryAttributeListOutput[]> {
    const cached = categoryAttributesCache.get(categoryId);
    if (cached) return cached;

    const pending = categoryAttributesRequests.get(categoryId);
    if (pending) return pending;

    const request = httpClient
      .get<ApiResult<CategoryAttributeListOutput[]>>(`/api/Category/Attribute/${categoryId}`)
      .then(({ data }) => {
        const list = resolveResult(data, "Failed to load category attributes");
        categoryAttributesCache.set(categoryId, list);
        return list;
      })
      .finally(() => {
        categoryAttributesRequests.delete(categoryId);
      });
    categoryAttributesRequests.set(categoryId, request);
    return request;
  },

  async addCategoryAttribute(input: CategoryAttributeAddInput): Promise<CategoryAttributeAddOutput> {
    const { data } = await httpClient.post<ApiResult<CategoryAttributeAddOutput>>(
      "/api/Category/Attribute",
      input
    );
    const item = resolveResult(data, "Failed to add attribute to category");
    categoryAttributesCache.delete(input.categoryId);
    return item;
  },

  async removeCategoryAttribute(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(
      `/api/Category/Attribute/${id}`
    );
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to remove attribute from category");
    }
    categoryAttributesCache.clear();
  },
};

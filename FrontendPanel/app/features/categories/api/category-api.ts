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

export const categoryApi = {
  async list(): Promise<CategoryListOutput[]> {
    const { data } = await httpClient.get<ApiResult<CategoryListOutput[]>>("/api/Category");
    return resolveResult(data, "Failed to load categories");
  },

  async get(id: number): Promise<CategoryGetOutput> {
    const { data } = await httpClient.get<ApiResult<CategoryGetOutput>>(`/api/Category/${id}`);
    return resolveResult(data, "Failed to load category");
  },

  async create(input: CategoryCreateInput): Promise<CategoryCreateOutput> {
    const { data } = await httpClient.post<ApiResult<CategoryCreateOutput>>("/api/Category", input);
    return resolveResult(data, "Failed to create category");
  },

  async update(id: number, input: CategoryUpdateInput): Promise<CategoryUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<CategoryUpdateOutput>>(
      `/api/Category/${id}`,
      input
    );
    return resolveResult(data, "Failed to update category");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Category/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete category");
    }
  },

  async listCategoryAttributes(categoryId: number): Promise<CategoryAttributeListOutput[]> {
    const { data } = await httpClient.get<ApiResult<CategoryAttributeListOutput[]>>(
      `/api/Category/Attribute/${categoryId}`
    );
    return resolveResult(data, "Failed to load category attributes");
  },

  async addCategoryAttribute(input: CategoryAttributeAddInput): Promise<CategoryAttributeAddOutput> {
    const { data } = await httpClient.post<ApiResult<CategoryAttributeAddOutput>>(
      "/api/Category/Attribute",
      input
    );
    return resolveResult(data, "Failed to add attribute to category");
  },

  async removeCategoryAttribute(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(
      `/api/Category/Attribute/${id}`
    );
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to remove attribute from category");
    }
  },
};

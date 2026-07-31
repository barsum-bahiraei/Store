import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type { AttributeCreateInput } from "../models/input/attribute-create-input";
import type { AttributeCreateOutput } from "../models/output/attribute-create-output";
import type { AttributeGetOutput } from "../models/output/attribute-get-output";
import type { AttributeListOutput } from "../models/output/attribute-list-output";
import type { AttributeUpdateInput } from "../models/input/attribute-update-input";
import type { AttributeUpdateOutput } from "../models/output/attribute-update-output";

export const attributeApi = {
  async list(): Promise<AttributeListOutput[]> {
    const { data } = await httpClient.get<ApiResult<AttributeListOutput[]>>("/api/Attribute");
    return resolveResult(data, "Failed to load attributes");
  },

  async get(id: number): Promise<AttributeGetOutput> {
    const { data } = await httpClient.get<ApiResult<AttributeGetOutput>>(`/api/Attribute/${id}`);
    return resolveResult(data, "Failed to load attribute");
  },

  async create(input: AttributeCreateInput): Promise<AttributeCreateOutput> {
    const { data } = await httpClient.post<ApiResult<AttributeCreateOutput>>("/api/Attribute", input);
    return resolveResult(data, "Failed to create attribute");
  },

  async update(id: number, input: AttributeUpdateInput): Promise<AttributeUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<AttributeUpdateOutput>>(
      `/api/Attribute/${id}`,
      input
    );
    return resolveResult(data, "Failed to update attribute");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Attribute/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete attribute");
    }
  },
};

import { httpClient } from "~/shared/http/http-client";
import type { ApiResult } from "~/shared/models/api-result";
import type { AttributeDto } from "../models/attribute";
import type { CreateAttributeInput } from "../models/attribute-inputs";
import type { UpdateAttributeInput } from "../models/attribute-inputs";

function resolve<T>(result: ApiResult<T> | null, fallbackMessage: string): T {
  if (!result?.isSuccess) {
    throw new Error(result?.errorMessage ?? fallbackMessage);
  }
  if (result.data === null || result.data === undefined) {
    throw new Error(fallbackMessage);
  }
  return result.data;
}

export const attributeApi = {
  async list(): Promise<AttributeDto[]> {
    const { data } = await httpClient.get<ApiResult<AttributeDto[]>>("/api/Attribute");
    return resolve(data, "Failed to load attributes");
  },

  async get(id: number): Promise<AttributeDto> {
    const { data } = await httpClient.get<ApiResult<AttributeDto>>(`/api/Attribute/${id}`);
    return resolve(data, "Failed to load attribute");
  },

  async create(input: CreateAttributeInput): Promise<AttributeDto> {
    const { data } = await httpClient.post<ApiResult<AttributeDto>>("/api/Attribute", input);
    return resolve(data, "Failed to create attribute");
  },

  async update(id: number, input: UpdateAttributeInput): Promise<AttributeDto> {
    const { data } = await httpClient.put<ApiResult<AttributeDto>>(`/api/Attribute/${id}`, input);
    return resolve(data, "Failed to update attribute");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Attribute/${id}`);
    if (!data?.isSuccess) {
      throw new Error(data?.errorMessage ?? "Failed to delete attribute");
    }
  },
};

import { httpClient } from "~/shared/http/http-client";
import { dedupe } from "~/shared/http/dedupe";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import { dateTimeToUtcIso } from "~/shared/utils/date-time";
import type {
  DiscountCodeListOutput,
  DiscountCodeOutput,
  DiscountCodeUpsertInput,
} from "../models/discount-code";

function normalizeInput(input: DiscountCodeUpsertInput): DiscountCodeUpsertInput {
  const expireAt = dateTimeToUtcIso(input.expireAt);
  if (input.expireAt && !expireAt) throw new Error("تاریخ انقضا معتبر نیست.");
  return { ...input, expireAt };
}

export const discountCodeApi = {
  async list(): Promise<DiscountCodeListOutput[]> {
    return dedupe("discount-codes", async () => {
      const { data } = await httpClient.get<ApiResult<DiscountCodeListOutput[]>>(
        "/api/Account/DiscountCode",
      );
      return resolveResult(data, "Unable to load discount codes");
    });
  },

  async get(id: number): Promise<DiscountCodeOutput> {
    const { data } = await httpClient.get<ApiResult<DiscountCodeOutput>>(
      `/api/Account/DiscountCode/${id}`,
    );
    return resolveResult(data, "Unable to load discount code");
  },

  async create(input: DiscountCodeUpsertInput): Promise<DiscountCodeOutput> {
    const { data } = await httpClient.post<ApiResult<DiscountCodeOutput>>(
      "/api/Account/DiscountCode",
      normalizeInput(input),
    );
    return resolveResult(data, "Unable to create discount code");
  },

  async update(id: number, input: DiscountCodeUpsertInput): Promise<DiscountCodeOutput> {
    const { data } = await httpClient.put<ApiResult<DiscountCodeOutput>>(
      `/api/Account/DiscountCode/${id}`,
      normalizeInput(input),
    );
    return resolveResult(data, "Unable to update discount code");
  },

  async remove(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(
      `/api/Account/DiscountCode/${id}`,
    );
    resolveResult(data, "Unable to delete discount code");
  },
};

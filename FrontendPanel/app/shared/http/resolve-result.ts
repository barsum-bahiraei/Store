import type { ApiResult } from "~/shared/models/api-result";

export function resolveResult<T>(result: ApiResult<T> | null, fallbackMessage: string): T {
  if (!result?.isSuccess) {
    throw new Error(result?.errorMessage ?? fallbackMessage);
  }
  if (result.data === null || result.data === undefined) {
    throw new Error(fallbackMessage);
  }
  return result.data;
}

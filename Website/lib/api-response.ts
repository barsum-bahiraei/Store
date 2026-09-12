export type ApiResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  errorMessage: string | null;
};

export function resolveApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.isSuccess || response.data === null) {
    throw new Error(response.errorMessage ?? fallbackMessage);
  }

  return response.data;
}

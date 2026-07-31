export interface ApiResult<T> {
  isSuccess: boolean;
  data: T | null;
  errorMessage: string | null;
}

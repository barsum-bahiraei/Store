import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { AccountUser, AuthenticatedUser, LoginInput, RegisterInput } from "../types/account";

export async function login(input: LoginInput): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
    "/Account/UserLogin",
    input,
  );

  return resolveApiResponse(data, "ورود انجام نشد.");
}

export async function register(input: RegisterInput): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
    "/Account/UserRegister",
    input,
  );

  return resolveApiResponse(data, "ساخت حساب انجام نشد.");
}

export async function getUserProfile(signal?: AbortSignal): Promise<AccountUser> {
  const { data } = await apiClient.get<ApiResponse<AccountUser>>("/Account/UserProfile", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری پروفایل انجام نشد.");
}

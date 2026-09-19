import { apiClient } from "@/lib/api-client";
import { resolveApiResponse, type ApiResponse } from "@/lib/api-response";
import type { AccountUser, AuthenticatedUser, OtpSendInput, OtpVerifyInput, UpdatedUserProfile, UpdateUserProfileInput } from "../types/account";

export async function sendOtp(input: OtpSendInput): Promise<void> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/Account/UserOtpSend",
    input,
  );

  resolveApiResponse(data, "ارسال کد انجام نشد.");
}

export async function verifyOtp(input: OtpVerifyInput): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
    "/Account/UserOtpVerify",
    input,
  );

  return resolveApiResponse(data, "تأیید کد انجام نشد.");
}

export async function getUserProfile(signal?: AbortSignal): Promise<AccountUser> {
  const { data } = await apiClient.get<ApiResponse<AccountUser>>("/Account/UserProfile", {
    signal,
  });

  return resolveApiResponse(data, "بارگذاری پروفایل انجام نشد.");
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<UpdatedUserProfile> {
  const { data } = await apiClient.put<ApiResponse<UpdatedUserProfile>>("/Account/UserProfile", input);
  return resolveApiResponse(data, "ویرایش پروفایل انجام نشد.");
}

import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  AccountUser,
  OtpSendInput,
  OtpSendOutput,
  OtpVerifyInput,
  OtpVerifyOutput,
  UserProfileUpdateInput,
  UserProfileUpdateOutput,
} from "../models/account";

let pendingProfile: Promise<AccountUser> | null = null;

export const authApi = {
  async sendOtp(input: OtpSendInput): Promise<OtpSendOutput> {
    const { data } = await httpClient.post<ApiResult<OtpSendOutput>>(
      "/api/Account/UserOtpSend",
      input,
    );
    return resolveResult(data, "ارسال کد تأیید ناموفق بود");
  },

  async verifyOtp(input: OtpVerifyInput): Promise<OtpVerifyOutput> {
    const { data } = await httpClient.post<ApiResult<OtpVerifyOutput>>(
      "/api/Account/UserOtpVerify",
      input,
    );
    return resolveResult(data, "تأیید کد ناموفق بود");
  },

  async profile(): Promise<AccountUser> {
    if (pendingProfile) return pendingProfile;

    pendingProfile = httpClient
      .get<ApiResult<AccountUser>>("/api/Account/UserProfile")
      .then(({ data }) => resolveResult(data, "Unable to load your profile"))
      .finally(() => {
        pendingProfile = null;
      });
    return pendingProfile;
  },

  async updateProfile(input: UserProfileUpdateInput): Promise<UserProfileUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<UserProfileUpdateOutput>>(
      "/api/Account/UserProfile",
      input,
    );
    return resolveResult(data, "Unable to update profile");
  },
};

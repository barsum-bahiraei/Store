import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  AccountUser,
  AuthenticatedUser,
  LoginInput,
  RegisterInput,
} from "../models/account";

let pendingProfile: Promise<AccountUser> | null = null;

export const authApi = {
  async login(input: LoginInput): Promise<AuthenticatedUser> {
    const { data } = await httpClient.post<ApiResult<AuthenticatedUser>>(
      "/api/Account/UserLogin",
      input,
    );
    return resolveResult(data, "Unable to sign in");
  },

  async register(input: RegisterInput): Promise<AuthenticatedUser> {
    const { data } = await httpClient.post<ApiResult<AuthenticatedUser>>(
      "/api/Account/UserRegister",
      input,
    );
    return resolveResult(data, "Unable to create account");
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
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  AUTH_TOKEN_EVENT,
  AUTH_TOKEN_KEY,
  clearAuthToken,
  getAuthToken,
  getAuthTokenExpiresAt,
  setAuthToken,
} from "@/lib/auth-token";
import { getUserProfile, sendOtp, verifyOtp, updateUserProfile } from "../services/account-service";
import type { AccountUser, AuthenticatedUser, OtpVerifyInput } from "../types/account";

export const accountKeys = {
  profile: ["account", "profile"] as const,
};

const MAX_TIMEOUT_DELAY_MS = 2_147_000_000;

function subscribeToAuthToken(onStoreChange: () => void) {
  let currentToken = getAuthToken();
  let expirationTimer: number | undefined;

  const scheduleExpiration = (token: string | null) => {
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    expirationTimer = undefined;
    if (!token) return;

    const expiresAt = getAuthTokenExpiresAt(token);
    if (expiresAt === null) return;
    const remainingTime = expiresAt - Date.now();
    if (remainingTime <= 0) {
      clearAuthToken();
      return;
    }

    expirationTimer = window.setTimeout(() => {
      const activeToken = getAuthToken();
      if (activeToken !== token) {
        currentToken = activeToken;
        scheduleExpiration(activeToken);
        onStoreChange();
        return;
      }

      const activeExpiresAt = getAuthTokenExpiresAt(activeToken);
      if (activeExpiresAt !== null && activeExpiresAt <= Date.now()) {
        clearAuthToken();
        return;
      }

      scheduleExpiration(activeToken);
    }, Math.min(remainingTime, MAX_TIMEOUT_DELAY_MS));
  };

  const checkCookie = () => {
    const nextToken = getAuthToken();
    if (nextToken === currentToken) return;
    currentToken = nextToken;
    scheduleExpiration(nextToken);
    onStoreChange();
  };

  const handleAuthTokenChange = () => {
    currentToken = getAuthToken();
    scheduleExpiration(currentToken);
    onStoreChange();
  };

  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_TOKEN_KEY) handleAuthTokenChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_TOKEN_EVENT, handleAuthTokenChange);
  window.addEventListener("focus", checkCookie);
  const interval = window.setInterval(checkCookie, 1000);
  scheduleExpiration(currentToken);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_TOKEN_EVENT, handleAuthTokenChange);
    window.removeEventListener("focus", checkCookie);
    window.clearInterval(interval);
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
  };
}

export function useAuthToken() {
  return useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => null);
}

function useAuthenticationMutation<TInput>(mutationFn: (input: TInput) => Promise<AuthenticatedUser>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async ({ token, ...user }) => {
      setAuthToken(token);
      queryClient.setQueryData<AccountUser>(accountKeys.profile, user);
      const profile = await getUserProfile();
      queryClient.setQueryData<AccountUser>(accountKeys.profile, profile);
    },
  });
}

export function useSendOtp() {
  return useMutation({ mutationFn: sendOtp });
}

export function useVerifyOtp() {
  return useAuthenticationMutation<OtpVerifyInput>(verifyOtp);
}

export function useUserProfile() {
  const token = useAuthToken();

  return useQuery({
    queryKey: accountKeys.profile,
    queryFn: ({ signal }) => getUserProfile(signal),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData<AccountUser>(accountKeys.profile, (current) => current ? { ...current, ...profile, email: profile.email ?? current.email, roles: (profile as AccountUser).roles ?? current.roles ?? [] } : current);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearAuthToken();
    queryClient.removeQueries({ queryKey: accountKeys.profile });
  };
}

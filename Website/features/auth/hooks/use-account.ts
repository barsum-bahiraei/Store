"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  AUTH_TOKEN_EVENT,
  AUTH_TOKEN_KEY,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/auth-token";
import { getUserProfile, sendOtp, verifyOtp, updateUserProfile } from "../services/account-service";
import type { AccountUser, AuthenticatedUser, OtpVerifyInput } from "../types/account";

export const accountKeys = {
  profile: ["account", "profile"] as const,
};

function subscribeToAuthToken(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_TOKEN_KEY) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_TOKEN_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_TOKEN_EVENT, onStoreChange);
  };
}

export function useAuthToken() {
  return useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => null);
}

function useAuthenticationMutation<TInput>(mutationFn: (input: TInput) => Promise<AuthenticatedUser>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: ({ token, ...user }) => {
      setAuthToken(token);
      queryClient.setQueryData<AccountUser>(accountKeys.profile, user);
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
      queryClient.setQueryData<AccountUser>(accountKeys.profile, (current) => current ? { ...current, ...profile, email: profile.email ?? current.email } : current);
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

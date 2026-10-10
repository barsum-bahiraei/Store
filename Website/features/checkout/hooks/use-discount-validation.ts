"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { validateDiscount } from "../services/checkout-service";

export function useDiscountValidation() {
  const token = useAuthToken();

  return useMutation({
    mutationKey: ["discount-validation", token],
    mutationFn: validateDiscount,
    retry: false,
  });
}

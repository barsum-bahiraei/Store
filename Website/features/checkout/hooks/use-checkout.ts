"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { cartKeys } from "@/features/cart/hooks/use-cart";
import { invoiceKeys } from "@/features/orders/hooks/use-invoices";
import { checkout } from "../services/checkout-service";

export function useCheckout() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["checkout", token],
    mutationFn: checkout,
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartKeys.detail(token), exact: true }),
        queryClient.invalidateQueries({ queryKey: invoiceKeys.list(token), exact: true }),
      ]);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(token), exact: true });
    },
  });
}

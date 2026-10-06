"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { retryInvoicePayment } from "../services/invoice-service";
import { invoiceKeys } from "./use-invoices";

export function useRetryPayment() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryInvoicePayment,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.list(token), exact: true }),
  });
}

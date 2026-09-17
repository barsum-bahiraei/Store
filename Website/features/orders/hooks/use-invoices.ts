"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getCompletedInvoices } from "../services/invoice-service";

export const invoiceKeys = {
  completed: (token: string | null) => ["invoices", "completed", token] as const,
};

export function useCompletedInvoices() {
  const token = useAuthToken();

  return useQuery({
    queryKey: invoiceKeys.completed(token),
    queryFn: ({ signal }) => {
      if (!token) throw new Error("برای مشاهده خریدها وارد حساب خود شوید.");
      return getCompletedInvoices(signal);
    },
    enabled: Boolean(token),
    retry: false,
  });
}

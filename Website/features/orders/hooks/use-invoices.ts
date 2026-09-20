"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getInvoices } from "../services/invoice-service";

export const invoiceKeys = {
  list: (token: string | null) => ["invoices", "list", token] as const,
};

export function useInvoices() {
  const token = useAuthToken();

  return useQuery({
    queryKey: invoiceKeys.list(token),
    queryFn: ({ signal }) => {
      if (!token) throw new Error("برای مشاهده خریدها وارد حساب خود شوید.");
      return getInvoices(signal);
    },
    enabled: Boolean(token),
    retry: false,
  });
}

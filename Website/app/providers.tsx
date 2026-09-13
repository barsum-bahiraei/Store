"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartSession } from "@/features/cart/components/cart-session";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false, 
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}><CartSession />{children}</QueryClientProvider>;
}

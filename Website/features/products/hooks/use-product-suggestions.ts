"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../services/product-service";

export function useProductSuggestions(value: string, active: boolean) {
  const term = value.trim().replace(/\s+/g, " ");
  const [settledTerm, setSettledTerm] = useState("");

  useEffect(() => {
    if (!active || term.length < 2) return;
    const timer = window.setTimeout(() => setSettledTerm(term), 1500);
    return () => window.clearTimeout(timer);
  }, [term, active]);

  const ready = active && term.length >= 2 && term === settledTerm;
  const query = useQuery({
    queryKey: ["products", "suggestions", active ? term : ""],
    queryFn: ({ signal }) => searchProducts({ page: 1, pageSize: 6, name: term, hasDiscount: false }, signal),
    enabled: ready,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { ...query, term, ready };
}

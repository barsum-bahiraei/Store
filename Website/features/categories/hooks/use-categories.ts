"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/category-service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getCategories(signal),
  });
}

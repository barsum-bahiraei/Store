"use client";

import { useQuery } from "@tanstack/react-query";
import { getBestSellingCategories, getCategories } from "../services/category-service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getCategories(signal),
  });
}

export function useBestSellingCategories() {
  return useQuery({
    queryKey: ["categories", "best-selling"],
    queryFn: ({ signal }) => getBestSellingCategories(signal),
  });
}

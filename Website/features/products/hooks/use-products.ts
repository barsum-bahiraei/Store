"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProductComment, getProductDetail, searchProducts } from "../services/product-service";
import type { CreateProductCommentInput, ProductSearchInput } from "../types/product";

export const productKeys = {
  all: ["products"] as const,
  search: (input: ProductSearchInput) => ["products", "search", input] as const,
  detail: (id: number) => ["products", "detail", id] as const,
};

export function useProductSearch(input: ProductSearchInput) {
  return useQuery({
    queryKey: productKeys.search(input),
    queryFn: ({ signal }) => searchProducts(input, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => getProductDetail(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: false,
  });
}

export function useCreateProductComment(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductCommentInput) => createProductComment(productId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  });
}

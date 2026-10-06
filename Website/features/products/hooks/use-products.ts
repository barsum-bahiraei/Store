"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProductComment, getProductBrands, getProductDetail, searchProducts } from "../services/product-service";
import type { CreateProductCommentInput, ProductSearchFilters, ProductSearchInput } from "../types/product";

export const productKeys = {
  all: ["products"] as const,
  search: (input: ProductSearchInput) => ["products", "search", input] as const,
  searchInfinite: (filters: ProductSearchFilters) => ["products", "search-infinite", filters] as const,
  detail: (id: number) => ["products", "detail", id] as const,
  brands: () => ["products", "brands"] as const,
};

export function useProductSearch(input: ProductSearchInput) {
  return useQuery({
    queryKey: productKeys.search(input),
    queryFn: ({ signal }) => searchProducts(input, signal),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteProductSearch(filters: ProductSearchFilters) {
  return useInfiniteQuery({
    queryKey: productKeys.searchInfinite(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => searchProducts({ ...filters, page: pageParam }, signal),
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((total, page) => total + page.items.length, 0);
      return lastPage.items.length > 0 && loadedCount < lastPage.totalCount ? pages.length + 1 : undefined;
    },
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

export function useProductBrands() {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: ({ signal }) => getProductBrands(signal),
  });
}

export function useCreateProductComment(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductCommentInput) => createProductComment(productId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  });
}

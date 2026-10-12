"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getAuthToken } from "@/lib/auth-token";
import { addBookmark, removeBookmark } from "../services/bookmark-service";
import { loadBookmarksWithGuestItems } from "../services/guest-bookmark-sync";
import { useGuestBookmarkStore } from "../stores/guest-bookmark-store";
import type { BookmarkItem } from "../types/bookmark";

export const bookmarkKeys = {
  list: (token: string | null) => ["bookmarks", token] as const,
};

function bookmarkOptions(token: string | null) {
  return queryOptions({
    queryKey: bookmarkKeys.list(token),
    queryFn: ({ signal }) => {
      if (!token) throw new Error("برای بارگذاری علاقه‌مندی‌ها وارد شوید.");
      return loadBookmarksWithGuestItems(token, signal);
    },
    staleTime: 30_000,
    gcTime: 0,
    retry: false,
  });
}

export function useBookmarks() {
  const token = useAuthToken();
  const guestItems = useGuestBookmarkStore((state) => state.items);
  const query = useQuery({ ...bookmarkOptions(token), enabled: Boolean(token) });
  return { ...query, guestItems, isAuthenticated: Boolean(token) };
}

export function useBookmarkToggle(productId: number, productName?: string) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const guestToggle = useGuestBookmarkStore((state) => state.toggle);
  const guestIsBookmarked = useGuestBookmarkStore((state) => state.isBookmarked(productId));
  const hasGuestItems = useGuestBookmarkStore((state) => state.items.length > 0);

  const authBookmarks = useQuery({ ...bookmarkOptions(token), enabled: Boolean(token) });
  const queryKey = bookmarkKeys.list(token);

  const isBookmarked = token
    ? authBookmarks.data?.some((item) => item.productId === productId) ?? false
    : guestIsBookmarked;

  const addMutation = useMutation({
    mutationFn: () => addBookmark(productId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const previous = queryClient.getQueryData<BookmarkItem[]>(queryKey);
      queryClient.setQueryData<BookmarkItem[]>(queryKey, (current) => {
        if (!current) return current;
        return [...current, {
          id: 0,
          productId,
          userId: 0,
          createdAt: new Date().toISOString(),
          product: { id: productId, name: productName ?? "", shortDescription: null, price: 0, discount: 0, categoryId: 0, categoryTitle: "", image: null },
        }];
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey, exact: true }),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeBookmark(productId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const previous = queryClient.getQueryData<BookmarkItem[]>(queryKey);
      queryClient.setQueryData<BookmarkItem[]>(queryKey, (current) => {
        if (!current) return current;
        return current.filter((item) => item.productId !== productId);
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey, exact: true }),
  });

  function toggle() {
    if (isPending) return;
    if (!token && !getAuthToken()) {
      guestToggle(productId, productName);
      return;
    }
    if (isBookmarked) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }

  const isPending = addMutation.isPending || removeMutation.isPending
    || Boolean(token && (authBookmarks.isLoading || (authBookmarks.isFetching && hasGuestItems)));

  return { isBookmarked, toggle, isPending };
}

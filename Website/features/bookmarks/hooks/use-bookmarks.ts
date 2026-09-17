"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getAuthToken } from "@/lib/auth-token";
import { getBookmarks, addBookmark, removeBookmark } from "../services/bookmark-service";
import { useGuestBookmarkStore } from "../stores/guest-bookmark-store";
import type { BookmarkItem } from "../types/bookmark";

export const bookmarkKeys = {
  list: ["bookmarks"] as const,
};

export function useBookmarks() {
  const token = useAuthToken();
  const guestItems = useGuestBookmarkStore((state) => state.items);
  const query = useQuery({
    queryKey: bookmarkKeys.list,
    queryFn: ({ signal }) => getBookmarks(signal),
    enabled: Boolean(token),
    retry: false,
  });
  return { ...query, guestItems, isAuthenticated: Boolean(token) };
}

export function useBookmarkToggle(productId: number, productName?: string) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const guestToggle = useGuestBookmarkStore((state) => state.toggle);
  const guestIsBookmarked = useGuestBookmarkStore((state) => state.isBookmarked(productId));

  const authBookmarks = useQuery({
    queryKey: bookmarkKeys.list,
    queryFn: ({ signal }) => getBookmarks(signal),
    enabled: Boolean(token),
    retry: false,
  });

  const isBookmarked = token
    ? authBookmarks.data?.some((item) => item.productId === productId) ?? false
    : guestIsBookmarked;

  const addMutation = useMutation({
    mutationFn: () => addBookmark(productId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.list, exact: true });
      const previous = queryClient.getQueryData<BookmarkItem[]>(bookmarkKeys.list);
      queryClient.setQueryData<BookmarkItem[]>(bookmarkKeys.list, (current) => {
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
      if (context?.previous) queryClient.setQueryData(bookmarkKeys.list, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookmarkKeys.list, exact: true }),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeBookmark(productId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.list, exact: true });
      const previous = queryClient.getQueryData<BookmarkItem[]>(bookmarkKeys.list);
      queryClient.setQueryData<BookmarkItem[]>(bookmarkKeys.list, (current) => {
        if (!current) return current;
        return current.filter((item) => item.productId !== productId);
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(bookmarkKeys.list, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookmarkKeys.list, exact: true }),
  });

  function toggle() {
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

  const isPending = addMutation.isPending || removeMutation.isPending;

  return { isBookmarked, toggle, isPending };
}

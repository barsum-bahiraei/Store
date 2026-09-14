"use client";

import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getAuthToken } from "@/lib/auth-token";
import { createCartItem, deleteCartItem, updateCartItem } from "../services/cart-service";
import { loadCartWithGuestItems } from "../services/guest-cart-sync";
import { useGuestCartStore } from "../stores/guest-cart-store";
import type { CartAction, CartItem } from "../types/cart";

function cartOptions(token: string | null, queryClient: QueryClient) {
  return queryOptions({
    queryKey: ["cart", token],
    queryFn: ({ signal }) => {
      if (!token) throw new Error("Please sign in to load your cart.");
      return loadCartWithGuestItems(token, queryClient, signal);
    },
    staleTime: 30_000,
    gcTime: 0,
    retry: false,
  });
}

export function useCart() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const guestItems = useGuestCartStore((state) => state.items);
  const query = useQuery({ ...cartOptions(token, queryClient), enabled: Boolean(token) });
  const totalCount = token ? query.data?.reduce((total, item) => total + item.productCount, 0)
    : guestItems.reduce((total, item) => total + item.count, 0);
  return { ...query, guestItems, totalCount, isAuthenticated: Boolean(token) };
}

export function useCartItemActions(productId: number, productName?: string) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const options = cartOptions(token, queryClient);
  const mutationKey = ["cart-action", token, productId];
  const pendingCount = useIsMutating({ mutationKey });
  const mutation = useMutation({
    mutationKey,
    scope: { id: "cart-actions" },
    retry: false,
    mutationFn: async (action: CartAction) => {
      if (!token || getAuthToken() !== token) throw new Error("Please sign in to manage your cart.");
      const items = await queryClient.fetchQuery(options);
      if (getAuthToken() !== token) throw new Error("Please sign in to manage your cart.");
      const item = items.find((entry) => entry.product.id === productId);
      await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });

      if (action === "remove" || (action === "decrease" && item?.productCount === 1)) {
        if (!item) return;
        await deleteCartItem(item.id);
        await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
        queryClient.setQueryData<CartItem[]>(options.queryKey, (current) =>
          (current ?? items).filter((entry) => entry.id !== item.id),
        );
        return;
      }

      if (!item && action !== "increase") return;
      const updated = item
        ? await updateCartItem(item.id, { productCount: item.productCount + (action === "increase" ? 1 : -1) })
        : await createCartItem({ productId, productCount: 1 });

      await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
      queryClient.setQueryData<CartItem[]>(options.queryKey, (current) => {
        const entries = current ?? items;
        return item
          ? entries.map((entry) => entry.id === item.id ? updated : entry)
          : [...entries, updated];
      });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: options.queryKey, exact: true }),
  });

  function change(action: CartAction) {
    if (!token && !getAuthToken()) {
      useGuestCartStore.getState().change(productId, action, productName);
      return;
    }
    if (queryClient.isMutating({ mutationKey }) > 0) return;
    mutation.mutate(action);
  }

  return { change, isPending: pendingCount > 0, error: mutation.error };
}

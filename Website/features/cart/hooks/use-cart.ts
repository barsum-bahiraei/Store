"use client";

import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getAuthToken } from "@/lib/auth-token";
import { createCartItem, deleteCartItem, updateCartItem } from "../services/cart-service";
import { loadCartWithGuestItems } from "../services/guest-cart-sync";
import { useGuestCartStore } from "../stores/guest-cart-store";
import type { CartAction, CartItem } from "../types/cart";

export const cartKeys = {
  detail: (token: string | null) => ["cart", token] as const,
};

function cartOptions(token: string | null) {
  return queryOptions({
    queryKey: cartKeys.detail(token),
    queryFn: ({ signal }) => {
      if (!token) throw new Error("Please sign in to load your cart.");
      return loadCartWithGuestItems(token, signal);
    },
    staleTime: 30_000,
    gcTime: 0,
    retry: false,
  });
}

export function useCart() {
  const token = useAuthToken();
  const guestItems = useGuestCartStore((state) => state.items);
  const query = useQuery({ ...cartOptions(token), enabled: Boolean(token) });
  const totalCount = token ? query.data?.reduce((total, item) => total + item.productCount, 0)
    : guestItems.reduce((total, item) => total + item.count, 0);
  return { ...query, guestItems, totalCount, isAuthenticated: Boolean(token) };
}

type CartItemActionOptions = {
  productId: number;
  productVariantId?: number;
  productName?: string;
  variantName?: string;
  cartItemId?: number;
  productCount?: number;
};

export function useCartItemActions({ productId, productVariantId, productName, variantName, cartItemId, productCount }: CartItemActionOptions) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [trackedItems, setTrackedItems] = useState<Record<number, CartItem>>({});
  const options = cartOptions(token);
  const mutationKey = ["cart-action", token, cartItemId ?? `${productId}:${productVariantId ?? "unselected"}`];
  const pendingCount = useIsMutating({ mutationKey });
  const trackedItem = productVariantId == null ? undefined : trackedItems[productVariantId];
  const mutation = useMutation({
    mutationKey,
    scope: { id: "cart-actions" },
    retry: false,
    mutationFn: async (action: CartAction) => {
      if (!token || getAuthToken() !== token) throw new Error("Please sign in to manage your cart.");
      const items = queryClient.getQueryData<CartItem[]>(options.queryKey) ?? await queryClient.fetchQuery(options);
      const item = cartItemId == null ? trackedItem : items.find((entry) => entry.id === cartItemId);
      await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });

      if (action === "remove" || (action === "decrease" && item?.productCount === 1)) {
        if (!item) return;
        await deleteCartItem(item.id);
        await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
        queryClient.setQueryData<CartItem[]>(options.queryKey, (current) =>
          (current ?? items).filter((entry) => entry.id !== item.id),
        );
        if (productVariantId != null) {
          setTrackedItems((current) => {
            const remaining = { ...current };
            delete remaining[productVariantId];
            return remaining;
          });
        }
        return;
      }

      if (!item && action !== "increase") return;
      let updated: CartItem;
      if (item) {
        updated = await updateCartItem(item.id, { productCount: (productCount ?? item.productCount) + (action === "increase" ? 1 : -1) });
      } else {
        if (productVariantId == null) throw new Error("لطفاً سایز محصول را انتخاب کنید");
        updated = await createCartItem({ productId, productVariantId, productCount: 1 });
      }
      if (productVariantId != null) {
        setTrackedItems((current) => ({ ...current, [productVariantId]: updated }));
      }

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
      if (productVariantId == null) return;
      useGuestCartStore.getState().change(productId, productVariantId, action, productName, variantName);
      return;
    }
    if (queryClient.isMutating({ mutationKey }) > 0) return;
    mutation.mutate(action);
  }

  return {
    change,
    productCount: trackedItem?.productCount ?? productCount ?? 0,
    isPending: pendingCount > 0,
    error: mutation.error,
  };
}

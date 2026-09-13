import type { QueryClient } from "@tanstack/react-query";
import { accountKeys } from "@/features/auth/hooks/use-account";
import { getUserProfile } from "@/features/auth/services/account-service";
import { getAuthToken } from "@/lib/auth-token";
import { useGuestCartStore } from "../stores/guest-cart-store";
import { createCartItem, getCart, updateCartItem } from "./cart-service";
import type { CartItem } from "../types/cart";

const transfers = new Map<string, Promise<CartItem[]>>();

export function loadCartWithGuestItems(token: string, queryClient: QueryClient, signal?: AbortSignal): Promise<CartItem[]> {
  const pending = transfers.get(token);
  if (pending) return pending;
  if (useGuestCartStore.getState().items.length === 0) return getCart(signal);

  async function transfer() {
    const [items, user] = await Promise.all([
      getCart(),
      queryClient.fetchQuery({ queryKey: accountKeys.profile, queryFn: ({ signal }) => getUserProfile(signal) }),
    ]);
    for (const guest of useGuestCartStore.getState().items) {
      if (getAuthToken() !== token) throw new Error("Your session changed. Please reload your cart.");
      if (guest.transfer && guest.transfer.account !== user.email) {
        throw new Error("Sign in to the account that started transferring your guest cart to finish the transfer.");
      }
      let item = items.find((entry) => entry.product.id === guest.productId);
      // Persist an absolute target before writing, so a retry/reload cannot add the same units twice.
      const target = guest.transfer?.target ?? (item?.productCount ?? 0) + guest.count;
      useGuestCartStore.getState().planTransfer(guest.productId, user.email, target);
      while ((item?.productCount ?? 0) < target) {
        if (getAuthToken() !== token) throw new Error("Your session changed. Please reload your cart.");
        const updated = item
          ? await updateCartItem(item.id, { productCount: item.productCount + 1 })
          : await createCartItem({ productId: guest.productId, productCount: 1 });
        const index = items.findIndex((entry) => entry.product.id === guest.productId);
        if (index < 0) items.push(updated);
        else items[index] = updated;
        item = updated;
      }
      useGuestCartStore.getState().completeTransfer(guest.productId);
    }
    return items;
  }

  const promise = (async () => {
    if (typeof navigator !== "undefined" && navigator.locks) {
      return await navigator.locks.request("store-guest-cart-transfer", async () => {
        await useGuestCartStore.persist.rehydrate();
        return transfer();
      });
    }
    return transfer();
  })().finally(() => transfers.delete(token));
  transfers.set(token, promise);
  return promise;
}

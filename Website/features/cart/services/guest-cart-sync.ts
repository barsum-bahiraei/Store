import { getAuthToken } from "@/lib/auth-token";
import { useGuestCartStore } from "../stores/guest-cart-store";
import { createCartItem, getCart } from "./cart-service";
import type { CartItem } from "../types/cart";

const transfers = new Map<string, Promise<CartItem[]>>();

export function loadCartWithGuestItems(token: string, signal?: AbortSignal): Promise<CartItem[]> {
  const pending = transfers.get(token);
  if (pending) return pending;
  if (useGuestCartStore.getState().items.length === 0) return getCart(signal);

  async function transfer() {
    const items = await getCart();
    for (const guest of useGuestCartStore.getState().items) {
      if (getAuthToken() !== token) throw new Error("نشست شما تغییر کرده است. لطفاً سبد خرید را دوباره بارگذاری کنید.");
      const created = await createCartItem({
        productId: guest.productId,
        productVariantId: guest.productVariantId,
        productCount: guest.count,
      });
      items.push(created);
      useGuestCartStore.getState().completeTransfer(guest.productId, guest.productVariantId);
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

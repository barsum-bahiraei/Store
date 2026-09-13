"use client";

import { useEffect } from "react";
import { useCart } from "../hooks/use-cart";
import { useGuestCartStore } from "../stores/guest-cart-store";

export function CartSession() {
  useCart();

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === "store-guest-cart" || event.key === null) {
        void useGuestCartStore.persist.rehydrate();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
}

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartAction } from "../types/cart";

export type GuestCartItem = {
  productId: number;
  productVariantId: number;
  variantName?: string;
  name?: string;
  count: number;
};

export type CartState = {
  items: GuestCartItem[];
};

export type CartStore = CartState & {
  change: (productId: number, productVariantId: number, action: CartAction, name?: string, variantName?: string) => void;
  completeTransfer: (productId: number, productVariantId: number) => void;
};

function isSameItem(item: GuestCartItem, productId: number, productVariantId: number) {
  return item.productId === productId && item.productVariantId === productVariantId;
}

function validItems(value: unknown): GuestCartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is GuestCartItem => {
    if (!item || typeof item !== "object") return false;
    return Number.isSafeInteger(item.productId) && item.productId > 0
      && Number.isSafeInteger(item.productVariantId) && item.productVariantId > 0
      && Number.isSafeInteger(item.count) && item.count > 0
      && (item.name === undefined || typeof item.name === "string")
      && (item.variantName === undefined || typeof item.variantName === "string");
  }).filter((item, index, items) => items.findIndex((entry) => isSameItem(entry, item.productId, item.productVariantId)) === index);
}

export const useGuestCartStore = create<CartStore>()(persist((set) => ({
  items: [],
  change: (productId, productVariantId, action, name, variantName) => set((state) => {
    const item = state.items.find((entry) => isSameItem(entry, productId, productVariantId));
    if (action === "remove" || (action === "decrease" && item?.count === 1)) {
      return { items: state.items.filter((entry) => !isSameItem(entry, productId, productVariantId)) };
    }
    if (!item) return action === "increase" ? { items: [...state.items, { productId, productVariantId, name, variantName, count: 1 }] } : state;
    return { items: state.items.map((entry) => isSameItem(entry, productId, productVariantId)
      ? { ...entry, name: name ?? entry.name, variantName: variantName ?? entry.variantName, count: entry.count + (action === "increase" ? 1 : -1) } : entry) };
  }),
  completeTransfer: (productId, productVariantId) => set((state) => ({
    items: state.items.filter((item) => !isSameItem(item, productId, productVariantId)),
  })),
}), {
  name: "store-guest-cart",
  storage: createJSONStorage(() => ({
    getItem: (name) => {
      try { return localStorage.getItem(name); } catch { return null; }
    },
    setItem: (name, value) => {
      try { localStorage.setItem(name, value); } catch { /* Keep the in-memory cart when storage is unavailable. */ }
    },
    removeItem: (name) => {
      try { localStorage.removeItem(name); } catch { /* Storage may be unavailable in private browsing. */ }
    },
  })),
  partialize: (state) => ({ items: state.items }),
  merge: (persisted, current) => ({
    ...current,
    items: persisted === undefined ? current.items : validItems(persisted && typeof persisted === "object" && "items" in persisted ? persisted.items : []),
  }),
}));

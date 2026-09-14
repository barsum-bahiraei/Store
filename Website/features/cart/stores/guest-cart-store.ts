"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartAction } from "../types/cart";

export type GuestCartItem = {
  productId: number;
  name?: string;
  count: number;
  transfer?: { account: string; target: number };
};

type GuestCartState = {
  items: GuestCartItem[];
  change: (productId: number, action: CartAction, name?: string) => void;
  planTransfer: (productId: number, account: string, target: number) => void;
  completeTransfer: (productId: number) => void;
};

function validItems(value: unknown): GuestCartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is GuestCartItem => {
    if (!item || typeof item !== "object") return false;
    return Number.isSafeInteger(item.productId) && item.productId > 0
      && Number.isSafeInteger(item.count) && item.count > 0
      && (item.name === undefined || typeof item.name === "string")
      && (item.transfer === undefined || (typeof item.transfer?.account === "string"
        && Number.isSafeInteger(item.transfer.target) && item.transfer.target > 0));
  }).filter((item, index, items) => items.findIndex((entry) => entry.productId === item.productId) === index);
}

export const useGuestCartStore = create<GuestCartState>()(persist((set) => ({
  items: [],
  change: (productId, action, name) => set((state) => {
    const item = state.items.find((entry) => entry.productId === productId);
    if (action === "remove" || (action === "decrease" && item?.count === 1)) {
      return { items: state.items.filter((entry) => entry.productId !== productId) };
    }
    if (!item) return action === "increase" ? { items: [...state.items, { productId, name, count: 1 }] } : state;
    return { items: state.items.map((entry) => entry.productId === productId
      ? { productId, name: name ?? entry.name, count: entry.count + (action === "increase" ? 1 : -1) } : entry) };
  }),
  planTransfer: (productId, account, target) => set((state) => ({
    items: state.items.map((item) => item.productId === productId ? { ...item, transfer: { account, target } } : item),
  })),
  completeTransfer: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
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

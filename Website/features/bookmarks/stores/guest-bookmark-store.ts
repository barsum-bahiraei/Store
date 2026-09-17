"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GuestBookmarkItem = {
  productId: number;
  name?: string;
  addedAt: string;
};

type GuestBookmarkState = {
  items: GuestBookmarkItem[];
  isBookmarked: (productId: number) => boolean;
  toggle: (productId: number, name?: string) => void;
};

function validItems(value: unknown): GuestBookmarkItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is GuestBookmarkItem => {
    if (!item || typeof item !== "object") return false;
    return Number.isSafeInteger(item.productId) && item.productId > 0
      && (item.name === undefined || typeof item.name === "string")
      && typeof item.addedAt === "string";
  }).filter((item, index, items) => items.findIndex((entry) => entry.productId === item.productId) === index);
}

export const useGuestBookmarkStore = create<GuestBookmarkState>()(persist((set, get) => ({
  items: [],
  isBookmarked: (productId) => get().items.some((item) => item.productId === productId),
  toggle: (productId, name) => set((state) => {
    const exists = state.items.some((item) => item.productId === productId);
    if (exists) {
      return { items: state.items.filter((item) => item.productId !== productId) };
    }
    return { items: [...state.items, { productId, name, addedAt: new Date().toISOString() }] };
  }),
}), {
  name: "store-guest-bookmarks",
  storage: createJSONStorage(() => ({
    getItem: (key) => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem: (key, value) => {
      try { localStorage.setItem(key, value); } catch { /* Storage may be unavailable. */ }
    },
    removeItem: (key) => {
      try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
    },
  })),
  partialize: (state) => ({ items: state.items }),
  merge: (persisted, current) => ({
    ...current,
    items: persisted === undefined ? current.items : validItems(persisted && typeof persisted === "object" && "items" in persisted ? persisted.items : []),
  }),
}));

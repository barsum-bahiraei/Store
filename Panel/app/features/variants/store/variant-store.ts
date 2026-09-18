import { create } from "zustand";
import { variantApi } from "../api/variant-api";
import type { ProductVariant, ProductVariantInput } from "../models/variant";

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "An unexpected error occurred.";

interface VariantStore {
  variants: ProductVariant[];
  loading: boolean;
  error: string | null;
  fetchVariants: () => Promise<void>;
  createVariant: (input: ProductVariantInput) => Promise<boolean>;
  updateVariant: (id: number, input: ProductVariantInput) => Promise<boolean>;
  deleteVariant: (id: number) => Promise<void>;
}

export const useVariantStore = create<VariantStore>((set) => ({
  variants: [],
  loading: false,
  error: null,
  fetchVariants: async () => {
    set({ loading: true, error: null });
    try {
      set({ variants: await variantApi.list(), loading: false });
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
    }
  },
  createVariant: async (input) => {
    set({ loading: true, error: null });
    try {
      const variant = await variantApi.create(input);
      set((state) => ({ variants: [...state.variants, variant], loading: false }));
      return true;
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
      return false;
    }
  },
  updateVariant: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const variant = await variantApi.update(id, input);
      set((state) => ({
        variants: state.variants.map((item) => (item.id === id ? variant : item)),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
      return false;
    }
  },
  deleteVariant: async (id) => {
    set({ loading: true, error: null });
    try {
      await variantApi.remove(id);
      set((state) => ({
        variants: state.variants.filter((variant) => variant.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
    }
  },
}));

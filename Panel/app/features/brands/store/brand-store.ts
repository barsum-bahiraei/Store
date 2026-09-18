import { create } from "zustand";
import { brandApi } from "../api/brand-api";
import type { Brand, BrandImageSaveInput, BrandInput, BrandSaveOutput } from "../models/brand";

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "An unexpected error occurred.";

interface BrandStore {
  brands: Brand[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
  createBrand: (input: BrandInput) => Promise<BrandSaveOutput | null>;
  updateBrand: (id: number, input: BrandInput) => Promise<boolean>;
  saveBrandImage: (input: BrandImageSaveInput) => Promise<boolean>;
  deleteBrand: (id: number) => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brands: [],
  loading: false,
  submitting: false,
  error: null,
  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      set({ brands: await brandApi.list(), loading: false });
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
    }
  },
  createBrand: async (input) => {
    set({ submitting: true, error: null });
    try {
      const brand = await brandApi.create(input);
      set({ submitting: false });
      return brand;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return null;
    }
  },
  updateBrand: async (id, input) => {
    set({ submitting: true, error: null });
    try {
      await brandApi.update(id, input);
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return false;
    }
  },
  saveBrandImage: async (input) => {
    set({ submitting: true, error: null });
    try {
      await brandApi.saveImage(input);
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return false;
    }
  },
  deleteBrand: async (id) => {
    set({ submitting: true, error: null });
    try {
      await brandApi.remove(id);
      set((state) => ({
        brands: state.brands.filter((brand) => brand.id !== id),
        submitting: false,
      }));
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
    }
  },
}));

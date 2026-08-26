import { create } from "zustand";
import { sellerApi } from "../api/seller-api";
import type {
  SellerCreateInput,
  SellerCreateOutput,
  SellerGetOutput,
  SellerImageSaveInput,
  SellerListOutput,
  SellerUpdateInput,
} from "../models/seller";

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "An unexpected error occurred.";

interface SellerStore {
  sellers: SellerListOutput[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchSellers: () => Promise<void>;
  getSeller: (id: number) => Promise<SellerGetOutput>;
  createSeller: (input: SellerCreateInput) => Promise<SellerCreateOutput | null>;
  updateSeller: (id: number, input: SellerUpdateInput) => Promise<boolean>;
  saveSellerImage: (input: SellerImageSaveInput) => Promise<boolean>;
  deleteSeller: (id: number) => Promise<void>;
}

export const useSellerStore = create<SellerStore>((set) => ({
  sellers: [],
  loading: false,
  submitting: false,
  error: null,
  fetchSellers: async () => {
    set({ loading: true, error: null });
    try {
      set({ sellers: await sellerApi.list(), loading: false });
    } catch (error) {
      set({ error: errorMessage(error), loading: false });
    }
  },
  getSeller: sellerApi.get,
  createSeller: async (input) => {
    set({ submitting: true, error: null });
    try {
      const seller = await sellerApi.create(input);
      set({ submitting: false });
      return seller;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return null;
    }
  },
  updateSeller: async (id, input) => {
    set({ submitting: true, error: null });
    try {
      await sellerApi.update(id, input);
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return false;
    }
  },
  saveSellerImage: async (input) => {
    set({ submitting: true, error: null });
    try {
      await sellerApi.saveImage(input);
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
      return false;
    }
  },
  deleteSeller: async (id) => {
    set({ submitting: true, error: null });
    try {
      await sellerApi.remove(id);
      set((state) => ({ sellers: state.sellers.filter((seller) => seller.id !== id), submitting: false }));
    } catch (error) {
      set({ error: errorMessage(error), submitting: false });
    }
  },
}));

import { create } from "zustand";
import { productApi } from "../api/product-api";
import type {
  ProductCreateInput,
  ProductCreateOutput,
  ProductGetOutput,
  ProductImageUploadInput,
  ProductListOutput,
  ProductUpdateInput,
} from "../models/product";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
}

interface ProductStore {
  products: ProductListOutput[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (input: ProductCreateInput) => Promise<ProductCreateOutput>;
  getProduct: (id: number) => Promise<ProductGetOutput>;
  updateProduct: (id: number, input: ProductUpdateInput) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  uploadImage: (input: ProductImageUploadInput) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  submitting: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productApi.list();
      set({ products, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  createProduct: async (input) => {
    set({ submitting: true, error: null });
    try {
      const product = await productApi.create(input);
      set({ submitting: false });
      return product;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, submitting: false });
      throw new Error(message);
    }
  },

  getProduct: async (id) => productApi.get(id),

  updateProduct: async (id, input) => {
    set({ submitting: true, error: null });
    try {
      await productApi.update(id, input);
      set({ submitting: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, submitting: false });
      throw new Error(message);
    }
  },

  deleteProduct: async (id) => {
    set({ submitting: true, error: null });
    try {
      await productApi.remove(id);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        submitting: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), submitting: false });
    }
  },

  uploadImage: async (input) => {
    await productApi.uploadImage(input);
  },

  deleteImage: async (id) => {
    await productApi.removeImage(id);
  },
}));

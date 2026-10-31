import { create } from "zustand";
import { productApi } from "../api/product-api";
import type {
  ProductCreateInput,
  ProductCreateOutput,
  ProductGetOutput,
  ProductImageOutput,
  ProductImageUploadInput,
  ProductListOutput,
  ProductListParams,
  ProductPricePercentageUpdateInput,
  ProductPricePercentageUpdateOutput,
  ProductUpdateInput,
} from "../models/product";

const DEFAULT_PAGE_SIZE = 50;

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
}

interface ProductStore {
  products: ProductListOutput[];
  totalCount: number;
  page: number;
  pageSize: number;
  lastParams: ProductListParams;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchProducts: (params?: ProductListParams) => Promise<void>;
  createProduct: (input: ProductCreateInput) => Promise<ProductCreateOutput>;
  getProduct: (id: number) => Promise<ProductGetOutput>;
  updateProduct: (id: number, input: ProductUpdateInput) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  updatePricesByPercentage: (input: ProductPricePercentageUpdateInput) => Promise<ProductPricePercentageUpdateOutput>;
  uploadImage: (input: ProductImageUploadInput) => Promise<ProductImageOutput>;
  deleteImage: (id: number) => Promise<void>;
  setMainImage: (id: number) => Promise<void>;
  reorderImages: (ids: number[]) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  totalCount: 0,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  lastParams: {},
  loading: false,
  submitting: false,
  error: null,

  fetchProducts: async (params) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE;
    const nextParams = { ...params, page, pageSize };

    set({ loading: true, error: null });
    try {
      const result = await productApi.list(nextParams);
      set({
        products: result.items,
        totalCount: result.totalCount,
        page,
        pageSize,
        lastParams: nextParams,
        loading: false,
      });
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
      const state = get();
      const page = state.products.length === 1 && state.page > 1 ? state.page - 1 : state.page;
      set({ submitting: false });
      await get().fetchProducts({ ...state.lastParams, page });
    } catch (error) {
      set({ error: getErrorMessage(error), submitting: false });
    }
  },

  updatePricesByPercentage: async (input) => {
    set({ submitting: true, error: null });
    try {
      const result = await productApi.updatePricesByPercentage(input);
      const lastParams = get().lastParams;
      set({ submitting: false });
      await get().fetchProducts(lastParams);
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, submitting: false });
      throw new Error(message);
    }
  },

  uploadImage: async (input) => productApi.uploadImage(input),

  deleteImage: async (id) => {
    await productApi.removeImage(id);
  },

  setMainImage: async (id) => {
    await productApi.setMainImage(id);
  },

  reorderImages: async (ids) => {
    await productApi.reorderImages(ids);
  },
}));

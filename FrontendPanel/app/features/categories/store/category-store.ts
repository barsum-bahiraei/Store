import { create } from "zustand";
import { categoryApi } from "../api/category-api";
import type { CategoryCreateInput } from "../models/input/category-create-input";
import type { CategoryListOutput } from "../models/output/category-list-output";
import type { CategoryUpdateInput } from "../models/input/category-update-input";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred.";
}

interface CategoryStore {
  categories: CategoryListOutput[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (input: CategoryCreateInput) => Promise<void>;
  updateCategory: (id: number, input: CategoryUpdateInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const categories = await categoryApi.list();
      set({ categories, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  createCategory: async (input) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryApi.create(input);
      set((state) => ({
        categories: [...state.categories, category],
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  updateCategory: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryApi.update(id, input);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? category : c)),
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await categoryApi.remove(id);
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
}));

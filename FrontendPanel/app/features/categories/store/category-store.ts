import { create } from "zustand";
import { categoryApi } from "../api/category-api";
import type { CategoryAttributeAddInput } from "../models/input/category-attribute-add-input";
import type { CategoryAttributeListOutput } from "../models/output/category-attribute-list-output";
import type { CategoryCreateInput } from "../models/input/category-create-input";
import type { CategoryListOutput } from "../models/output/category-list-output";
import type { CategoryUpdateInput } from "../models/input/category-update-input";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred.";
}

interface CategoryStore {
  categories: CategoryListOutput[];
  categoryAttributes: Record<number, CategoryAttributeListOutput[]>;
  loading: boolean;
  error: string | null;
  attributesLoading: boolean;
  attributesError: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (input: CategoryCreateInput) => Promise<void>;
  updateCategory: (id: number, input: CategoryUpdateInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  fetchCategoryAttributes: (categoryId: number) => Promise<void>;
  addAttributeToCategory: (input: CategoryAttributeAddInput) => Promise<void>;
  removeCategoryAttribute: (categoryId: number, id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  categoryAttributes: {},
  loading: false,
  error: null,
  attributesLoading: false,
  attributesError: null,

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

  fetchCategoryAttributes: async (categoryId) => {
    set({ attributesLoading: true, attributesError: null });
    try {
      const list = await categoryApi.listCategoryAttributes(categoryId);
      set((state) => ({
        categoryAttributes: { ...state.categoryAttributes, [categoryId]: list },
        attributesLoading: false,
      }));
    } catch (error) {
      set({ attributesError: getErrorMessage(error), attributesLoading: false });
    }
  },

  addAttributeToCategory: async (input) => {
    set({ attributesLoading: true, attributesError: null });
    try {
      const item = await categoryApi.addCategoryAttribute(input);
      set((state) => ({
        categoryAttributes: {
          ...state.categoryAttributes,
          [input.categoryId]: [...(state.categoryAttributes[input.categoryId] ?? []), item],
        },
        attributesLoading: false,
      }));
    } catch (error) {
      set({ attributesError: getErrorMessage(error), attributesLoading: false });
    }
  },

  removeCategoryAttribute: async (categoryId, id) => {
    set({ attributesLoading: true, attributesError: null });
    try {
      await categoryApi.removeCategoryAttribute(id);
      set((state) => ({
        categoryAttributes: {
          ...state.categoryAttributes,
          [categoryId]: (state.categoryAttributes[categoryId] ?? []).filter(
            (item) => item.id !== id
          ),
        },
        attributesLoading: false,
      }));
    } catch (error) {
      set({ attributesError: getErrorMessage(error), attributesLoading: false });
    }
  },
}));

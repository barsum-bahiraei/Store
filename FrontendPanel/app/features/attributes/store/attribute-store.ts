import { create } from "zustand";
import { attributeApi } from "../api/attribute-api";
import type { AttributeCreateInput } from "../models/input/attribute-create-input";
import type { AttributeListOutput } from "../models/output/attribute-list-output";
import type { AttributeUpdateInput } from "../models/input/attribute-update-input";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred.";
}

interface AttributeStore {
  attributes: AttributeListOutput[];
  loading: boolean;
  error: string | null;
  fetchAttributes: () => Promise<void>;
  createAttribute: (input: AttributeCreateInput) => Promise<void>;
  updateAttribute: (id: number, input: AttributeUpdateInput) => Promise<void>;
  deleteAttribute: (id: number) => Promise<void>;
}

export const useAttributeStore = create<AttributeStore>((set, get) => ({
  attributes: [],
  loading: false,
  error: null,

  fetchAttributes: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const attributes = await attributeApi.list();
      set({ attributes, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  createAttribute: async (input) => {
    set({ loading: true, error: null });
    try {
      const attribute = await attributeApi.create(input);
      set((state) => ({
        attributes: [...state.attributes, attribute],
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  updateAttribute: async (id, input) => {
    set({ loading: true, error: null });
    try {
      await attributeApi.update(id, input);
      set((state) => ({
        attributes: state.attributes.map((attribute) =>
          attribute.id === id ? { ...attribute, ...input } : attribute
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  deleteAttribute: async (id) => {
    set({ loading: true, error: null });
    try {
      await attributeApi.remove(id);
      set((state) => ({
        attributes: state.attributes.filter((attribute) => attribute.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
}));

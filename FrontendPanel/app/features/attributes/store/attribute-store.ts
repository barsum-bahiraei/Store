import { create } from "zustand";
import { attributeApi } from "../api/attribute-api";
import type { Attribute } from "../models/attribute";
import type { CreateAttributeInput } from "../models/create-attribute-input";
import type { UpdateAttributeInput } from "../models/update-attribute-input";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred.";
}

interface AttributeStore {
  attributes: Attribute[];
  loading: boolean;
  error: string | null;
  fetchAttributes: () => Promise<void>;
  createAttribute: (input: CreateAttributeInput) => Promise<void>;
  updateAttribute: (id: number, input: UpdateAttributeInput) => Promise<void>;
  deleteAttribute: (id: number) => Promise<void>;
}

export const useAttributeStore = create<AttributeStore>((set, get) => ({
  attributes: [],
  loading: false,
  error: null,

  fetchAttributes: async () => {
    set({ loading: true, error: null });
    try {
      const items = await attributeApi.list();
      const attributes = items.map((item, index) => ({ ...item, id: index + 1 }));
      set({ attributes, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  createAttribute: async (input) => {
    set({ loading: true, error: null });
    try {
      await attributeApi.create(input);
      set((state) => ({
        attributes: [...state.attributes, { ...input, id: state.attributes.length + 1 }],
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

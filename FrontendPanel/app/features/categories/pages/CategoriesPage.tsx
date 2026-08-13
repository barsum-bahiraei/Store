import { useEffect, useState } from "react";
import { useAttributeStore } from "~/features/attributes/store/attribute-store";
import { type CategoryListOutput } from "../models/output/category-list-output";
import { useCategoryStore } from "../store/category-store";

export default function CategoriesPage() {
  const {
    categories,
    categoryAttributes,
    loading,
    error,
    attributesLoading,
    attributesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategoryAttributes,
    addAttributeToCategory,
    removeCategoryAttribute,
  } = useCategoryStore();

  const { attributes, fetchAttributes } = useAttributeStore();

  const [title, setTitle] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);

  useEffect(() => {
    void fetchCategories();
    void fetchAttributes();
  }, [fetchCategories, fetchAttributes]);

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    await createCategory({ title: trimmedTitle });
    setTitle("");
  };

  const startEditing = (category: CategoryListOutput) => {
    setEditingId(category.id);
    setEditTitle(category.title);
  };

  const cancelEditing = () => setEditingId(null);

  const handleUpdate = async (id: number) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    await updateCategory(id, { title: trimmedTitle });
    setEditingId(null);
  };

  const toggleAttributes = (category: CategoryListOutput) => {
    if (expandedId === category.id) {
      setExpandedId(null);
      setSelectedAttributeId(null);
      return;
    }
    setExpandedId(category.id);
    setSelectedAttributeId(null);
    if (categoryAttributes[category.id] === undefined) {
      void fetchCategoryAttributes(category.id);
    }
  };

  const handleAddAttribute = async () => {
    if (expandedId === null || selectedAttributeId === null) return;
    await addAttributeToCategory({ categoryId: expandedId, attributeId: selectedAttributeId });
    setSelectedAttributeId(null);
  };

  const connectedAttributes = expandedId !== null ? categoryAttributes[expandedId] ?? [] : [];
  const availableAttributes = attributes.filter(
    (attribute) => !connectedAttributes.some((item) => item.attributeId === attribute.id)
  );

  const inputClasses =
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage product categories</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
          <button
            onClick={() => void fetchCategories()}
            className="rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">Add Category</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Category title"
            className={inputClasses}
          />
          <button
            onClick={() => void handleAdd()}
            disabled={loading || !title.trim()}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12">
            <span className="material-symbols-outlined animate-spin text-gray-400 dark:text-gray-500">
              progress_activity
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
              folder_open
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {categories.map((category) => (
              <li key={category.id} className="px-4 py-3 sm:px-6">
                {editingId === category.id ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Category title"
                      className={inputClasses}
                    />
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => void handleUpdate(category.id)}
                        disabled={loading || !editTitle.trim()}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="material-symbols-outlined shrink-0 text-gray-400">
                        folder
                      </span>
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {category.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <button
                        onClick={() => toggleAttributes(category)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          expandedId === category.id
                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        }`}
                        aria-label={`Attributes of ${category.title}`}
                        title="Attributes"
                      >
                        <span className="material-symbols-outlined text-[18px]">link</span>
                      </button>
                      <button
                        onClick={() => startEditing(category)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        aria-label={`Edit ${category.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => void deleteCategory(category.id)}
                        disabled={loading}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label={`Delete ${category.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {expandedId === category.id && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                    {attributesError ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-red-700 dark:text-red-400">{attributesError}</p>
                        <button
                          onClick={() => void fetchCategoryAttributes(category.id)}
                          className="rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          Retry
                        </button>
                      </div>
                    ) : attributesLoading && connectedAttributes.length === 0 ? (
                      <div className="flex items-center gap-2 py-2">
                        <span className="material-symbols-outlined animate-spin text-gray-400 dark:text-gray-500">
                          progress_activity
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Loading attributes…
                        </p>
                      </div>
                    ) : connectedAttributes.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No attributes connected
                      </p>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {connectedAttributes.map((item) => (
                          <li
                            key={item.id}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white pl-3 pr-1 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          >
                            {item.attributeTitle}
                            <button
                              onClick={() => void removeCategoryAttribute(category.id, item.id)}
                              disabled={attributesLoading}
                              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              aria-label={`Remove ${item.attributeTitle}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={selectedAttributeId ?? ""}
                        onChange={(e) =>
                          setSelectedAttributeId(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className={inputClasses}
                        disabled={attributesLoading}
                      >
                        <option value="">Select an attribute</option>
                        {availableAttributes.map((attribute) => (
                          <option key={attribute.id} value={attribute.id}>
                            {attribute.title}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void handleAddAttribute()}
                        disabled={attributesLoading || selectedAttributeId === null}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_link</span>
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

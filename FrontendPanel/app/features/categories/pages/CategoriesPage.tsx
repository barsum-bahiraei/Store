import { useEffect, useState } from "react";
import { useAttributeStore } from "~/features/attributes/store/attribute-store";
import type { CategoryListOutput } from "../models/output/category-list-output";
import { useCategoryStore } from "../store/category-store";
import {
  flattenCategories,
  getDescendantIds,
} from "../utils/category-tree";

const inputClasses =
  "block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

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
  const [editParentId, setEditParentId] = useState<number | null>(null);
  const [addingChildToId, setAddingChildToId] = useState<number | null>(null);
  const [childTitle, setChildTitle] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [attributesCategoryId, setAttributesCategoryId] = useState<number | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);

  useEffect(() => {
    void fetchCategories();
    void fetchAttributes();
  }, [fetchAttributes, fetchCategories]);

  const flatCategories = flattenCategories(categories);
  const connectedAttributes =
    attributesCategoryId === null ? [] : categoryAttributes[attributesCategoryId] ?? [];
  const availableAttributes = attributes.filter(
    (attribute) => !connectedAttributes.some((item) => item.attributeId === attribute.id)
  );

  const handleAddRoot = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    if (await createCategory({ title: trimmedTitle, parentId: null })) setTitle("");
  };

  const handleAddChild = async (parentId: number) => {
    const trimmedTitle = childTitle.trim();
    if (!trimmedTitle) return;
    if (await createCategory({ title: trimmedTitle, parentId })) {
      setChildTitle("");
      setAddingChildToId(null);
      setExpandedIds((current) => {
        const next = new Set(current);
        next.add(parentId);
        return next;
      });
    }
  };

  const startEditing = (category: CategoryListOutput) => {
    setEditingId(category.id);
    setEditTitle(category.title);
    setEditParentId(category.parentId);
  };

  const handleUpdate = async (category: CategoryListOutput) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    if (await updateCategory(category.id, { title: trimmedTitle, parentId: editParentId })) {
      setEditingId(null);
    }
  };

  const toggleBranch = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAttributes = (categoryId: number) => {
    if (attributesCategoryId === categoryId) {
      setAttributesCategoryId(null);
      setSelectedAttributeId(null);
      return;
    }
    setAttributesCategoryId(categoryId);
    setSelectedAttributeId(null);
    if (categoryAttributes[categoryId] === undefined) {
      void fetchCategoryAttributes(categoryId);
    }
  };

  const handleAddAttribute = async () => {
    if (attributesCategoryId === null || selectedAttributeId === null) return;
    await addAttributeToCategory({
      categoryId: attributesCategoryId,
      attributeId: selectedAttributeId,
    });
    setSelectedAttributeId(null);
  };

  const renderAttributePanel = (category: CategoryListOutput) => {
    if (attributesCategoryId !== category.id) return null;
    return (
      <div className="mx-3 mb-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950 sm:mx-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-primary-600 dark:text-primary-400">tune</span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Category attributes</h3>
        </div>
        {attributesError ? (
          <div className="flex items-center justify-between gap-3 text-sm text-red-700 dark:text-red-400">
            <span>{attributesError}</span>
            <button type="button" onClick={() => void fetchCategoryAttributes(category.id)} className="min-h-11 rounded-lg px-3 font-medium hover:bg-red-100 dark:hover:bg-red-950/40">Retry</button>
          </div>
        ) : attributesLoading && connectedAttributes.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-sm text-gray-500 dark:text-gray-400"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading attributes...</div>
        ) : connectedAttributes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No attributes connected.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {connectedAttributes.map((item) => (
              <li key={item.id} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pl-3 pr-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {item.attributeTitle ?? `Attribute ${item.attributeId}`}
                <button type="button" onClick={() => void removeCategoryAttribute(category.id, item.id)} disabled={attributesLoading} className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400" aria-label={`Remove ${item.attributeTitle ?? "attribute"}`}><span className="material-symbols-outlined text-[16px]">close</span></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select value={selectedAttributeId ?? ""} onChange={(event) => setSelectedAttributeId(event.target.value ? Number(event.target.value) : null)} className={inputClasses} disabled={attributesLoading}>
            <option value="">Select an attribute</option>
            {availableAttributes.map((attribute) => <option key={attribute.id} value={attribute.id}>{attribute.title}</option>)}
          </select>
          <button type="button" onClick={() => void handleAddAttribute()} disabled={attributesLoading || selectedAttributeId === null} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[19px]">add_link</span>Add attribute</button>
        </div>
      </div>
    );
  };

  const renderCategory = (category: CategoryListOutput, depth = 0) => {
    const children = category.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isEditing = editingId === category.id;
    const invalidParentIds = getDescendantIds(category);
    invalidParentIds.add(category.id);

    return (
      <li key={category.id} className={depth > 0 ? "ml-4 border-l border-gray-200 pl-3 dark:border-gray-700 sm:ml-7 sm:pl-4" : ""}>
        <div className="my-2 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {isEditing ? (
            <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.7fr)_auto] lg:items-end">
              <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Category title</span><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className={inputClasses} autoFocus /></label>
              <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Parent category</span><select value={editParentId ?? ""} onChange={(event) => setEditParentId(event.target.value ? Number(event.target.value) : null)} className={inputClasses}><option value="">No parent (root)</option>{flatCategories.filter(({ category: option }) => !invalidParentIds.has(option.id)).map(({ category: option, path }) => <option key={option.id} value={option.id}>{path}</option>)}</select></label>
              <div className="flex gap-2"><button type="button" onClick={() => void handleUpdate(category)} disabled={loading || !editTitle.trim()} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"><span className="material-symbols-outlined text-[19px]">check</span>Save</button><button type="button" onClick={() => setEditingId(null)} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button></div>
            </div>
          ) : (
            <div className="flex min-h-16 items-center gap-2 px-3 py-2 sm:px-4">
              <button type="button" onClick={() => hasChildren && toggleBranch(category.id)} disabled={!hasChildren} className="flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800" aria-expanded={hasChildren ? isExpanded : undefined} aria-label={isExpanded ? `Collapse ${category.title}` : `Expand ${category.title}`}><span className="material-symbols-outlined text-[20px]">{hasChildren && isExpanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}</span></button>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"><span className="material-symbols-outlined text-[21px]">{hasChildren ? "folder" : "folder_open"}</span></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{category.title}</p><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hasChildren ? `${children.length} direct subcategor${children.length === 1 ? "y" : "ies"}` : "Leaf category"}</p></div>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => { setAddingChildToId(category.id); setChildTitle(""); }} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30 dark:hover:text-primary-400" aria-label={`Add subcategory to ${category.title}`} title="Add subcategory"><span className="material-symbols-outlined text-[20px]">create_new_folder</span></button>
                <button type="button" onClick={() => toggleAttributes(category.id)} className={`flex size-11 items-center justify-center rounded-xl ${attributesCategoryId === category.id ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`} aria-label={`Manage attributes of ${category.title}`} title="Attributes"><span className="material-symbols-outlined text-[20px]">tune</span></button>
                <button type="button" onClick={() => startEditing(category)} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label={`Edit ${category.title}`}><span className="material-symbols-outlined text-[20px]">edit</span></button>
                <button type="button" onClick={() => void deleteCategory(category.id)} disabled={loading || hasChildren} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30 dark:hover:text-red-400" aria-label={`Delete ${category.title}`} title={hasChildren ? "Move or delete subcategories first" : "Delete category"}><span className="material-symbols-outlined text-[20px]">delete</span></button>
              </div>
            </div>
          )}

          {addingChildToId === category.id && (
            <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:p-4">
              <input value={childTitle} onChange={(event) => setChildTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void handleAddChild(category.id); }} className={inputClasses} placeholder={`New subcategory under ${category.title}`} autoFocus />
              <button type="button" onClick={() => void handleAddChild(category.id)} disabled={loading || !childTitle.trim()} className="min-h-11 shrink-0 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">Add child</button>
              <button type="button" onClick={() => setAddingChildToId(null)} className="min-h-11 shrink-0 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
            </div>
          )}
          {renderAttributePanel(category)}
        </div>
        {hasChildren && isExpanded && <ul>{children.map((child) => renderCategory(child, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Catalog structure</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">Category tree</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Organize categories into clear parent and child relationships.</p>
      </header>

      {error && <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert"><span className="flex items-start gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</span><button type="button" onClick={() => void fetchCategories()} className="min-h-11 shrink-0 rounded-lg px-3 font-semibold hover:bg-red-100 dark:hover:bg-red-950/40">Retry</button></div>}

      <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"><span className="material-symbols-outlined">create_new_folder</span></span><div><h2 className="font-semibold text-gray-900 dark:text-white">Create root category</h2><p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">You can add nested categories from any node afterward.</p></div></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void handleAddRoot(); }} className={inputClasses} placeholder="e.g. Electronics" /><button type="button" onClick={() => void handleAddRoot()} disabled={loading || !title.trim()} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[19px]">add</span>Add root</button></div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-gray-900 dark:text-white">Hierarchy</h2><p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Expand a category to view its subcategories. Change its parent from Edit.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"><span className="material-symbols-outlined text-[17px]">account_tree</span>{flatCategories.length} categories</span></div>

        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500 dark:text-gray-400"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading category tree...</div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">account_tree</span><h2 className="mt-3 font-semibold text-gray-900 dark:text-white">No categories yet</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a root category to start the tree.</p></div>
        ) : (
          <ul>{categories.map((category) => renderCategory(category))}</ul>
        )}
      </section>
    </div>
  );
}

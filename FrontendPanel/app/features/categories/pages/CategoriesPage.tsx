import { useEffect, useRef, useState } from "react";
import { useAttributeStore } from "~/features/attributes/store/attribute-store";
import type { CategoryListOutput } from "../models/output/category-list-output";
import { useCategoryStore } from "../store/category-store";
import {
  findCategory,
  flattenCategories,
  getDescendantIds,
} from "../utils/category-tree";

const inputClasses = "min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

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

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [rootTitle, setRootTitle] = useState("");
  const [showRootForm, setShowRootForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editParentId, setEditParentId] = useState<number | null>(null);
  const [childTitle, setChildTitle] = useState("");
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);
  const requestedAttributes = useRef(new Set<number>());

  useEffect(() => {
    void fetchCategories();
    void fetchAttributes();
  }, [fetchAttributes, fetchCategories]);

  const flatCategories = flattenCategories(categories);
  const selectedCategory = selectedId === null ? null : findCategory(categories, selectedId);
  const selectedPath = flatCategories.find(({ category }) => category.id === selectedId)?.path;
  const connectedAttributes = selectedId === null ? [] : categoryAttributes[selectedId] ?? [];
  const availableAttributes = attributes.filter(
    (attribute) => !connectedAttributes.some((item) => item.attributeId === attribute.id),
  );

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null || !findCategory(categories, selectedId)) {
      setSelectedId(categories[0].id);
    }
  }, [categories, selectedId]);

  useEffect(() => {
    if (
      selectedId !== null &&
      categoryAttributes[selectedId] === undefined &&
      !requestedAttributes.current.has(selectedId)
    ) {
      requestedAttributes.current.add(selectedId);
      void fetchCategoryAttributes(selectedId);
    }
  }, [categoryAttributes, fetchCategoryAttributes, selectedId]);

  const selectCategory = (id: number) => {
    setSelectedId(id);
    setEditing(false);
    setChildTitle("");
    setSelectedAttributeId(null);
  };

  const toggleBranch = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddRoot = async () => {
    const title = rootTitle.trim();
    if (!title) return;
    if (await createCategory({ title, parentId: null })) {
      setRootTitle("");
      setShowRootForm(false);
    }
  };

  const handleAddChild = async () => {
    if (!selectedCategory) return;
    const title = childTitle.trim();
    if (!title) return;
    if (await createCategory({ title, parentId: selectedCategory.id })) {
      setChildTitle("");
      setExpandedIds((current) => new Set(current).add(selectedCategory.id));
    }
  };

  const startEditing = () => {
    if (!selectedCategory) return;
    setEditTitle(selectedCategory.title);
    setEditParentId(selectedCategory.parentId);
    setEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !editTitle.trim()) return;
    if (await updateCategory(selectedCategory.id, {
      title: editTitle.trim(),
      parentId: editParentId,
    })) {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory || (selectedCategory.children?.length ?? 0) > 0) return;
    if (!window.confirm(`Delete the “${selectedCategory.title}” category?`)) return;
    if (await deleteCategory(selectedCategory.id)) setSelectedId(null);
  };

  const handleAddAttribute = async () => {
    if (selectedId === null || selectedAttributeId === null) return;
    await addAttributeToCategory({ categoryId: selectedId, attributeId: selectedAttributeId });
    setSelectedAttributeId(null);
  };

  const retryAttributes = () => {
    if (selectedId === null) return;
    requestedAttributes.current.add(selectedId);
    void fetchCategoryAttributes(selectedId);
  };

  const renderTree = (items: CategoryListOutput[], depth = 0) => (
    <ul className={depth > 0 ? "ml-5 border-l border-gray-200 pl-2 dark:border-gray-700" : "space-y-1"}>
      {items.map((category) => {
        const children = category.children ?? [];
        const hasChildren = children.length > 0;
        const expanded = expandedIds.has(category.id);
        const selected = selectedId === category.id;
        return (
          <li key={category.id}>
            <div className={`flex min-h-11 items-center rounded-lg transition-colors ${selected ? "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <button type="button" onClick={() => hasChildren && toggleBranch(category.id)} disabled={!hasChildren} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-400 disabled:opacity-25" aria-label={expanded ? `Collapse ${category.title}` : `Expand ${category.title}`}>
                <span className="material-symbols-outlined text-xl">{hasChildren ? (expanded ? "keyboard_arrow_down" : "keyboard_arrow_right") : "remove"}</span>
              </button>
              <button type="button" onClick={() => selectCategory(category.id)} className="flex min-w-0 flex-1 items-center gap-2 self-stretch pr-3 text-left">
                <span className="material-symbols-outlined text-xl">{hasChildren ? "folder" : "folder_open"}</span>
                <span className="truncate text-sm font-medium">{category.title}</span>
                {hasChildren && <span className="ml-auto text-xs opacity-60">{children.length}</span>}
              </button>
            </div>
            {hasChildren && expanded && renderTree(children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  const invalidParentIds = selectedCategory ? getDescendantIds(selectedCategory) : new Set<number>();
  if (selectedCategory) invalidParentIds.add(selectedCategory.id);
  const hasChildren = (selectedCategory?.children?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{flatCategories.length}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Build the catalog hierarchy and assign specifications.</p>
        </div>
        <button onClick={() => setShowRootForm((current) => !current)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700">
          <span className="material-symbols-outlined text-xl">{showRootForm ? "close" : "create_new_folder"}</span>
          {showRootForm ? "Close" : "New root category"}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span><button onClick={() => void fetchCategories()} className="font-semibold">Retry</button>
        </div>
      )}

      {showRootForm && (
        <form onSubmit={(event) => { event.preventDefault(); void handleAddRoot(); }} className="flex flex-col gap-2 rounded-xl border border-primary-200 bg-primary-50/50 p-4 sm:flex-row dark:border-primary-900 dark:bg-primary-950/20">
          <div className="min-w-0 flex-1"><label htmlFor="rootTitle" className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Root category name</label><input id="rootTitle" autoFocus value={rootTitle} onChange={(event) => setRootTitle(event.target.value)} placeholder="e.g. Electronics" className={inputClasses} /></div>
          <button disabled={loading || !rootTitle.trim()} className="min-h-11 self-end rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">Create category</button>
        </form>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800"><h2 className="text-sm font-semibold text-gray-900 dark:text-white">Category tree</h2><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Select a category to manage it</p></div>
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {loading && categories.length === 0 ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading...</div> : categories.length === 0 ? <div className="px-4 py-12 text-center text-sm text-gray-500">No categories yet</div> : renderTree(categories)}
          </div>
        </aside>

        <main className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {!selectedCategory ? (
            <div className="px-6 py-20 text-center"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">account_tree</span><h2 className="mt-3 font-medium text-gray-900 dark:text-white">Select a category</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a node from the tree to view its settings.</p></div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                <div className="min-w-0"><p className="truncate text-xs text-gray-500 dark:text-gray-400">{selectedPath}</p><h2 className="mt-1 truncate text-lg font-semibold text-gray-900 dark:text-white">{selectedCategory.title}</h2></div>
                <div className="flex gap-1"><button onClick={startEditing} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-lg">edit</span>Edit</button><button onClick={() => void handleDelete()} disabled={loading || hasChildren} title={hasChildren ? "Move or delete child categories first" : "Delete category"} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-red-950/30"><span className="material-symbols-outlined text-lg">delete</span>Delete</button></div>
              </div>

              {editing && (
                <form onSubmit={(event) => { event.preventDefault(); void handleUpdate(); }} className="grid gap-3 border-b border-gray-200 bg-primary-50/40 p-4 sm:grid-cols-2 dark:border-gray-800 dark:bg-primary-950/10">
                  <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Category name</span><input autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className={inputClasses} /></label>
                  <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Parent category</span><select value={editParentId ?? ""} onChange={(event) => setEditParentId(event.target.value ? Number(event.target.value) : null)} className={inputClasses}><option value="">No parent (root)</option>{flatCategories.filter(({ category }) => !invalidParentIds.has(category.id)).map(({ category, path }) => <option key={category.id} value={category.id}>{path}</option>)}</select></label>
                  <div className="flex gap-2 sm:col-span-2"><button disabled={loading || !editTitle.trim()} className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">Save changes</button><button type="button" onClick={() => setEditing(false)} className="min-h-11 rounded-lg px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button></div>
                </form>
              )}

              <div className="grid divide-y divide-gray-200 dark:divide-gray-800 xl:grid-cols-2 xl:divide-x xl:divide-y-0 dark:xl:divide-gray-800">
                <section className="p-5">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-xl text-primary-600">create_new_folder</span><h3 className="font-semibold text-gray-900 dark:text-white">Add subcategory</h3></div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a child directly under {selectedCategory.title}.</p>
                  <form onSubmit={(event) => { event.preventDefault(); void handleAddChild(); }} className="mt-4 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row"><input value={childTitle} onChange={(event) => setChildTitle(event.target.value)} placeholder="Subcategory name" className={inputClasses} /><button disabled={loading || !childTitle.trim()} className="min-h-11 shrink-0 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Add child</button></form>
                </section>

                <section className="p-5">
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-xl text-primary-600">tune</span><h3 className="font-semibold text-gray-900 dark:text-white">Attributes</h3></div><span className="text-xs text-gray-500">{connectedAttributes.length} assigned</span></div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Specifications available to products in this category.</p>

                  {attributesError ? (
                    <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><span>{attributesError}</span><button onClick={retryAttributes} className="font-semibold">Retry</button></div>
                  ) : attributesLoading && categoryAttributes[selectedCategory.id] === undefined ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading attributes...</div>
                  ) : connectedAttributes.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-700">No attributes assigned yet.</div>
                  ) : (
                    <ul className="mt-4 flex flex-wrap gap-2">{connectedAttributes.map((item) => <li key={item.id} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">{item.attributeTitle ?? `Attribute ${item.attributeId}`}<button onClick={() => void removeCategoryAttribute(selectedCategory.id, item.id)} disabled={attributesLoading} className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40" aria-label={`Remove ${item.attributeTitle ?? "attribute"}`}><span className="material-symbols-outlined text-base">close</span></button></li>)}</ul>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row"><select value={selectedAttributeId ?? ""} onChange={(event) => setSelectedAttributeId(event.target.value ? Number(event.target.value) : null)} disabled={attributesLoading || availableAttributes.length === 0} className={inputClasses}><option value="">{availableAttributes.length === 0 ? "All attributes assigned" : "Select an attribute"}</option>{availableAttributes.map((attribute) => <option key={attribute.id} value={attribute.id}>{attribute.title}</option>)}</select><button onClick={() => void handleAddAttribute()} disabled={attributesLoading || selectedAttributeId === null} className="min-h-11 shrink-0 rounded-lg border border-primary-600 px-4 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-50 dark:text-primary-300 dark:hover:bg-primary-950/30">Assign</button></div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

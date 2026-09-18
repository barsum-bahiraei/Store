import { useEffect, useState, type FormEvent } from "react";
import type { ProductVariant } from "../models/variant";
import { useVariantStore } from "../store/variant-store";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";
const hexPattern = /^#[0-9a-f]{6}$/i;

export default function VariantsPage() {
  const { variants, loading, error, fetchVariants, createVariant, updateVariant, deleteVariant } = useVariantStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");

  useEffect(() => {
    void fetchVariants();
  }, [fetchVariants]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setColorName("");
    setColorCode("#000000");
  };

  const startEditing = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setColorName(variant.colorName);
    setColorCode(variant.colorCode);
    setFormOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const input = { colorName: colorName.trim(), colorCode: colorCode.toUpperCase() };
    if (!input.colorName || !hexPattern.test(input.colorCode)) return;
    const saved = editingId === null
      ? await createVariant(input)
      : await updateVariant(editingId, input);
    if (saved) closeForm();
  };

  const remove = async (variant: ProductVariant) => {
    if (!window.confirm(`Delete “${variant.colorName}”? Colors assigned to products cannot be deleted.`)) return;
    await deleteVariant(variant.id);
  };

  const filteredVariants = variants.filter((variant) => {
    const query = search.trim().toLowerCase();
    return variant.colorName.toLowerCase().includes(query) || variant.colorCode.toLowerCase().includes(query);
  });
  const validColor = hexPattern.test(colorCode);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Catalog</p><div className="mt-1 flex items-center gap-3"><h1 className="text-2xl font-semibold text-gray-950 dark:text-white">Colors</h1><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{variants.length}</span></div><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create reusable colors that can be assigned to products.</p></div>
        <button type="button" onClick={() => formOpen ? closeForm() : setFormOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"><span className="material-symbols-outlined text-xl">{formOpen ? "close" : "palette"}</span>{formOpen ? "Close" : "New color"}</button>
      </header>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><span>{error}</span><button type="button" onClick={() => void fetchVariants()} className="font-semibold">Retry</button></div>}

      {formOpen && (
        <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-950 dark:text-white">{editingId === null ? "Create color" : "Edit color"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Color name</span><input autoFocus value={colorName} onChange={(event) => setColorName(event.target.value)} className={inputClasses} placeholder="e.g. Matte black" required /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">HEX code</span><span className="flex gap-2"><input type="color" value={validColor ? colorCode : "#000000"} onChange={(event) => setColorCode(event.target.value.toUpperCase())} className="size-11 shrink-0 cursor-pointer rounded-xl border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-950" aria-label="Choose color" /><input value={colorCode} onChange={(event) => setColorCode(event.target.value)} className={inputClasses} placeholder="#000000" pattern="#[0-9a-fA-F]{6}" required /></span>{!validColor && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">Enter a six-digit HEX code, such as #111111.</span>}</label>
            <button disabled={loading || !colorName.trim() || !validColor} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Saving..." : "Save color"}</button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"><div className="relative w-full sm:max-w-xs"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search colors" className={`${inputClasses} pl-10`} /></div><p className="text-xs text-gray-500 dark:text-gray-400">{filteredVariants.length} shown</p></div>
        {loading && variants.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading colors...</div>
        ) : filteredVariants.length === 0 ? (
          <div className="px-6 py-16 text-center"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">palette</span><h2 className="mt-3 font-medium text-gray-900 dark:text-white">{variants.length === 0 ? "No colors yet" : "No matching colors"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{variants.length === 0 ? "Create colors before assigning them to products." : "Try a different name or HEX code."}</p></div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">{filteredVariants.map((variant) => <li key={variant.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="size-11 shrink-0 rounded-full border-2 border-gray-200 shadow-sm dark:border-gray-600" style={{ backgroundColor: variant.colorCode }} aria-hidden="true" /><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-gray-950 dark:text-white">{variant.colorName}</h2><p className="mt-0.5 font-mono text-xs uppercase text-gray-500 dark:text-gray-400">{variant.colorCode}</p></div></div><div className="flex shrink-0"><button type="button" onClick={() => startEditing(variant)} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label={`Edit ${variant.colorName}`}><span className="material-symbols-outlined text-xl">edit</span></button><button type="button" onClick={() => void remove(variant)} disabled={loading} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`Delete ${variant.colorName}`}><span className="material-symbols-outlined text-xl">delete</span></button></div></li>)}</ul>
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAttributeStore } from "../store/attribute-store";
import type { AttributeListOutput } from "../models/output/attribute-list-output";
import {
  AttributeType,
  ATTRIBUTE_TYPE_OPTIONS,
  getAttributeTypeLabel,
} from "../models/enums/attribute-type";
import {
  AttributeUnit,
  ATTRIBUTE_UNIT_OPTIONS,
  getAttributeUnitLabel,
} from "../models/enums/attribute-unit";

const inputClasses = "min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export default function AttributesPage() {
  const {
    attributes,
    loading,
    error,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  } = useAttributeStore();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AttributeType>(AttributeType.Strint);
  const [unit, setUnit] = useState<AttributeUnit>(AttributeUnit.Geram);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<AttributeType>(AttributeType.Strint);
  const [editUnit, setEditUnit] = useState<AttributeUnit>(AttributeUnit.Geram);

  useEffect(() => {
    void fetchAttributes();
  }, [fetchAttributes]);

  const filteredAttributes = attributes.filter((attribute) =>
    attribute.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    if (await createAttribute({ title: trimmedTitle, type, unit })) {
      setTitle("");
      setShowCreate(false);
    }
  };

  const startEditing = (attribute: AttributeListOutput) => {
    setEditingId(attribute.id);
    setEditTitle(attribute.title);
    setEditType(attribute.type);
    setEditUnit(attribute.unit);
  };

  const handleUpdate = async (id: number) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    if (await updateAttribute(id, { title: trimmedTitle, type: editType, unit: editUnit })) {
      setEditingId(null);
    }
  };

  const handleDelete = async (attribute: AttributeListOutput) => {
    if (!window.confirm(`Delete the “${attribute.title}” attribute?`)) return;
    await deleteAttribute(attribute.id);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Attributes</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{attributes.length}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Define reusable product specifications and value types.</p>
        </div>
        <button onClick={() => setShowCreate((current) => !current)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700">
          <span className="material-symbols-outlined text-xl">{showCreate ? "close" : "add"}</span>
          {showCreate ? "Close" : "New attribute"}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xl">error</span>{error}</span>
          <button onClick={() => void fetchAttributes()} className="font-semibold">Retry</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={(event) => { event.preventDefault(); void handleAdd(); }} className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-900 dark:bg-primary-950/20">
          <div className="mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Create attribute</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Choose the data type and measurement unit products will use.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-end">
            <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Name</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Weight" className={inputClasses} /></label>
            <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Value type</span><select value={type} onChange={(event) => setType(Number(event.target.value))} className={inputClasses}>{ATTRIBUTE_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label><span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Unit</span><select value={unit} onChange={(event) => setUnit(Number(event.target.value))} className={inputClasses}>{ATTRIBUTE_UNIT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <button disabled={loading || !title.trim()} className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Create</button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attributes" className={`${inputClasses} pl-10`} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{filteredAttributes.length} shown</p>
        </div>

        <div className="hidden grid-cols-[minmax(0,1fr)_10rem_10rem_6rem] border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
          <span>Name</span><span>Value type</span><span>Unit</span><span className="text-right">Actions</span>
        </div>

        {loading && attributes.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading attributes...</div>
        ) : filteredAttributes.length === 0 ? (
          <div className="px-6 py-16 text-center"><span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">label_off</span><h2 className="mt-2 font-medium text-gray-900 dark:text-white">{attributes.length === 0 ? "No attributes yet" : "No matching attributes"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{attributes.length === 0 ? "Create your first reusable specification." : "Try a different search term."}</p></div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredAttributes.map((attribute) => (
              <li key={attribute.id}>
                {editingId === attribute.id ? (
                  <form onSubmit={(event) => { event.preventDefault(); void handleUpdate(attribute.id); }} className="grid gap-3 bg-primary-50/40 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_auto] sm:items-center dark:bg-primary-950/10">
                    <input autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className={inputClasses} />
                    <select value={editType} onChange={(event) => setEditType(Number(event.target.value))} className={inputClasses}>{ATTRIBUTE_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    <select value={editUnit} onChange={(event) => setEditUnit(Number(event.target.value))} className={inputClasses}>{ATTRIBUTE_UNIT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    <div className="flex justify-end gap-1"><button disabled={loading || !editTitle.trim()} className="flex size-10 items-center justify-center rounded-lg bg-primary-600 text-white disabled:opacity-50" aria-label="Save attribute"><span className="material-symbols-outlined text-xl">check</span></button><button type="button" onClick={() => setEditingId(null)} className="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cancel editing"><span className="material-symbols-outlined text-xl">close</span></button></div>
                  </form>
                ) : (
                  <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_6rem] sm:items-center sm:px-5">
                    <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"><span className="material-symbols-outlined text-xl">label</span></span><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900 dark:text-white">{attribute.title}</p><p className="mt-0.5 text-xs text-gray-400 sm:hidden">{getAttributeTypeLabel(attribute.type)} · {getAttributeUnitLabel(attribute.unit)}</p></div></div>
                    <span className="hidden text-sm text-gray-600 sm:block dark:text-gray-300">{getAttributeTypeLabel(attribute.type)}</span>
                    <span className="hidden text-sm text-gray-600 sm:block dark:text-gray-300">{getAttributeUnitLabel(attribute.unit)}</span>
                    <div className="flex justify-end"><button onClick={() => startEditing(attribute)} className="flex size-10 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label={`Edit ${attribute.title}`}><span className="material-symbols-outlined text-xl">edit</span></button><button onClick={() => void handleDelete(attribute)} disabled={loading} className="flex size-10 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`Delete ${attribute.title}`}><span className="material-symbols-outlined text-xl">delete</span></button></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

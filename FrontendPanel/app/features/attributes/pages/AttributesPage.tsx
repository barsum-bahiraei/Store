import { useEffect, useState } from "react";
import { useAttributeStore } from "../store/attribute-store";
import { type AttributeListOutput } from "../models/output/attribute-list-output";
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

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    await createAttribute({ title: trimmedTitle, type, unit });
    setTitle("");
  };

  const startEditing = (attribute: AttributeListOutput) => {
    setEditingId(attribute.id);
    setEditTitle(attribute.title);
    setEditType(attribute.type);
    setEditUnit(attribute.unit);
  };

  const cancelEditing = () => setEditingId(null);

  const handleUpdate = async (id: number) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    await updateAttribute(id, { title: trimmedTitle, type: editType, unit: editUnit });
    setEditingId(null);
  };

  const inputClasses =
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Attributes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage product attributes
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
          <button
            onClick={() => void fetchAttributes()}
            className="rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">Add Attribute</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Attribute title"
            className={inputClasses}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value))}
              className={inputClasses}
            >
              {ATTRIBUTE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value))}
              className={inputClasses}
            >
              {ATTRIBUTE_UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => void handleAdd()}
            disabled={loading || !title.trim()}
            className="flex items-center justify-center gap-2 self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {loading && attributes.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12">
            <span className="material-symbols-outlined animate-spin text-gray-400 dark:text-gray-500">
              progress_activity
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading attributes…</p>
          </div>
        ) : attributes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
              list_alt
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">No attributes yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {attributes.map((attribute) => (
              <li
                key={attribute.id}
                className="flex flex-col gap-3 px-4 py-3 sm:px-6"
              >
                {editingId === attribute.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Attribute title"
                      className={inputClasses}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={editType}
                        onChange={(e) => setEditType(Number(e.target.value))}
                        className={inputClasses}
                      >
                        {ATTRIBUTE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(Number(e.target.value))}
                        className={inputClasses}
                      >
                        {ATTRIBUTE_UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleUpdate(attribute.id)}
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
                        label
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {attribute.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {getAttributeTypeLabel(attribute.type)}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {getAttributeUnitLabel(attribute.unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <button
                        onClick={() => startEditing(attribute)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        aria-label={`Edit ${attribute.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => void deleteAttribute(attribute.id)}
                        disabled={loading}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label={`Delete ${attribute.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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

import { useState } from "react";

interface Attribute {
  id: number;
  name: string;
  slug: string;
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id: 1, name: "Color", slug: "color" },
    { id: 2, name: "Size", slug: "size" },
    { id: 3, name: "Material", slug: "material" },
  ]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const addAttribute = () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) return;

    const newAttribute: Attribute = {
      id: Date.now(),
      name: trimmedName,
      slug: trimmedSlug,
    };

    setAttributes((prev) => [...prev, newAttribute]);
    setName("");
    setSlug("");
  };

  const deleteAttribute = (id: number) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Attributes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage product attributes
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">Add Attribute</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Attribute name"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug (e.g., color)"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
          />
          <button
            onClick={addAttribute}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {attributes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
              list_alt
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">No attributes yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {attributes.map((attr) => (
              <li
                key={attr.id}
                className="flex items-center justify-between px-4 py-3 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">label</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {attr.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{attr.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteAttribute(attr.id)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label={`Delete ${attr.name}`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

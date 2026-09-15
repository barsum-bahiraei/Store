import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createClientId } from "~/shared/utils/create-client-id";
import { SellerStatus, type SellerImage, type SellerListOutput } from "../models/seller";
import { useSellerStore } from "../store/seller-store";
import { resolveSellerImageUrl } from "../utils/resolve-seller-image-url";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

const statuses = [
  { value: SellerStatus.Pending, label: "Pending" },
  { value: SellerStatus.Active, label: "Active" },
  { value: SellerStatus.Suspended, label: "Suspended" },
  { value: SellerStatus.Rejected, label: "Rejected" },
];

export default function SellersPage() {
  const { sellers, loading, submitting, error, fetchSellers, getSeller, createSeller, updateSeller, saveSellerImage, deleteSeller } =
    useSellerStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(SellerStatus.Active);
  const [existingImage, setExistingImage] = useState<SellerImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    };
  }, [selectedImage]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setStatus(SellerStatus.Active);
    setExistingImage(null);
    setSelectedImage(null);
  };

  const startEditing = async (seller: SellerListOutput) => {
    setFormOpen(true);
    setEditingId(seller.id);
    setExistingImage(null);
    setSelectedImage(null);
    setFormLoading(true);
    try {
      const details = await getSeller(seller.id);
      setName(details.name);
      setDescription(details.description ?? "");
      setStatus(details.status);
      setExistingImage(details.images.find((image) => image.isMain) ?? details.images[0] ?? null);
    } finally {
      setFormLoading(false);
    }
  };

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
    }
    event.target.value = "";
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    let sellerId = editingId;
    if (sellerId === null) {
      const created = await createSeller({ name: name.trim(), description: description.trim() });
      if (!created) return;
      sellerId = created.id;
    } else {
      const updated = await updateSeller(sellerId, {
        name: name.trim(),
        description: description.trim() || null,
        status,
      });
      if (!updated) return;
    }

    if (selectedImage) {
      const imageSaved = await saveSellerImage({
        file: selectedImage.file,
        name: `${sellerId}-${createClientId()}-${selectedImage.file.name.replace(/\.[^/.]+$/, "")}`,
        sellerId,
        imageId: existingImage?.id,
        fileType: selectedImage.file.type === "image/svg+xml" ? 3 : 0,
      });
      if (!imageSaved) {
        setEditingId(sellerId);
        return;
      }
    }

    closeForm();
    await fetchSellers();
  };

  const remove = async (seller: SellerListOutput) => {
    if (!window.confirm(`Delete “${seller.name}”? Products assigned to it must be removed first.`)) return;
    await deleteSeller(seller.id);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Catalog</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">Sellers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the sellers that own product listings.</p>
        </div>
        <button onClick={() => formOpen ? closeForm() : setFormOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
          <span className="material-symbols-outlined text-xl">{formOpen ? "close" : "add_business"}</span>
          {formOpen ? "Close" : "New seller"}
        </button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {formOpen && (
        <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-950 dark:text-white">{editingId === null ? "Create seller" : "Edit seller"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={inputClasses} required disabled={formLoading} /></label>
            {editingId !== null && <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</span><select value={status} onChange={(event) => setStatus(Number(event.target.value))} className={inputClasses}>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClasses} min-h-24 py-3`} /></label>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Seller image</span>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
                  {selectedImage || resolveSellerImageUrl(existingImage) ? <img src={selectedImage?.previewUrl ?? resolveSellerImageUrl(existingImage) ?? undefined} alt={`${name || "Seller"} preview`} className="size-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">storefront</span>}
                </div>
                <div>
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                    <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                    {existingImage || selectedImage ? "Replace image" : "Choose image"}
                    <input type="file" accept="image/*" onChange={selectImage} className="sr-only" disabled={formLoading} />
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">One image only. Choosing a new image replaces the current one.</p>
                  {selectedImage && <button type="button" onClick={() => setSelectedImage(null)} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400">Cancel selected image</button>}
                </div>
              </div>
            </div>
          </div>
          <button disabled={submitting || formLoading || !name.trim()} className="mt-4 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Saving..." : "Save seller"}</button>
        </form>
      )}

      {loading && sellers.length === 0 ? (
        <div className="flex justify-center py-16 text-sm text-gray-500">Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">storefront</span><p className="mt-3 text-sm text-gray-500">Create a seller before adding products.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sellers.map((seller) => (
            <article key={seller.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                 <div className="flex min-w-0 items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">{resolveSellerImageUrl(seller.image) ? <img src={resolveSellerImageUrl(seller.image) ?? undefined} alt="" className="size-full object-cover" /> : <span className="material-symbols-outlined">storefront</span>}</span><div className="min-w-0"><h2 className="truncate font-semibold text-gray-950 dark:text-white">{seller.name}</h2><p className="text-xs text-gray-500">{statuses.find((item) => item.value === seller.status)?.label}</p></div></div>
                <div className="flex"><button onClick={() => void startEditing(seller)} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label={`Edit ${seller.name}`}><span className="material-symbols-outlined text-xl">edit</span></button><button onClick={() => void remove(seller)} disabled={submitting} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Delete ${seller.name}`}><span className="material-symbols-outlined text-xl">delete</span></button></div>
              </div>
              <p className="mt-4 line-clamp-3 min-h-15 text-sm leading-5 text-gray-500 dark:text-gray-400">{seller.description || "No description"}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

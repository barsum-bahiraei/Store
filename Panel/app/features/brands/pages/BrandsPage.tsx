import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { createClientId } from "~/shared/utils/create-client-id";
import type { Brand } from "../models/brand";
import { useBrandStore } from "../store/brand-store";
import { resolveBrandImageUrl } from "../utils/resolve-brand-image-url";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export default function BrandsPage() {
  const { brands, loading, submitting, error, fetchBrands, createBrand, updateBrand, saveBrandImage, deleteBrand } =
    useBrandStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    void fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    };
  }, [selectedImage]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingBrand(null);
    setName("");
    setSelectedImage(null);
  };

  const startEditing = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSelectedImage(null);
    setFormOpen(true);
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
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let brandId = editingBrand?.id;
    if (brandId === undefined) {
      const created = await createBrand({ name: trimmedName });
      if (!created) return;
      brandId = created.id;
    } else if (!(await updateBrand(brandId, { name: trimmedName }))) {
      return;
    }

    if (selectedImage) {
      const saved = await saveBrandImage({
        file: selectedImage.file,
        name: `${brandId}-${createClientId()}-${selectedImage.file.name.replace(/\.[^/.]+$/, "")}`,
        brandId,
        imageId: editingBrand?.image?.id,
        fileType: selectedImage.file.type === "image/svg+xml" ? 3 : 0,
      });
      if (!saved) {
        setEditingBrand((current) => current ?? { id: brandId, name: trimmedName, image: null });
        return;
      }
    }

    closeForm();
    await fetchBrands();
  };

  const remove = async (brand: Brand) => {
    setConfirmData({
      title: "حذف برند",
      message: `آیا از حذف برند «${brand.name}» اطمینان دارید؟ برندهایی که به محصول اختصاص داده شده‌اند قابل حذف نیستند.`,
      onConfirm: async () => {
        setConfirmData(null);
        await deleteBrand(brand.id);
      },
    });
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const previewUrl = selectedImage?.previewUrl ?? resolveBrandImageUrl(editingBrand?.image ?? null);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">فهرست</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-950 dark:text-white">برندها</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{brands.length}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">مدیریت برندهای محصول و لوگوهای فروشگاه آن‌ها.</p>
        </div>
        <button type="button" onClick={() => formOpen ? closeForm() : setFormOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <span className="material-symbols-outlined text-xl">{formOpen ? "close" : "add"}</span>
          {formOpen ? "بستن" : "برند جدید"}
        </button>
      </header>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><span>{error}</span><button type="button" onClick={() => void fetchBrands()} className="font-semibold">تلاش مجدد</button></div>}

      {formOpen && (
        <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-950 dark:text-white">{editingBrand ? "ویرایش برند" : "ایجاد برند"}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام برند</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={inputClasses} placeholder="مثلاً سامسونگ" required /></label>
            <button disabled={submitting || !name.trim()} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "در حال ذخیره..." : "ذخیره برند"}</button>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">تصویر برند</span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
                {previewUrl ? <img src={previewUrl} alt={`پیش‌نمایش ${name || "برند"}`} className="size-full object-contain p-2" /> : <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">branding_watermark</span>}
              </div>
              <div>
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                  {previewUrl ? "جایگزینی تصویر" : "انتخاب تصویر"}
                  <input type="file" accept="image/*" onChange={selectImage} className="sr-only" disabled={submitting} />
                </label>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">اختیاری. از لوگوی مربعی یا افقی با پس‌زمینه شفاف استفاده کنید.</p>
                {selectedImage && <button type="button" onClick={() => setSelectedImage(null)} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400">لغو انتخاب تصویر</button>}
              </div>
            </div>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="relative w-full sm:max-w-xs"><span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی برندها" className={`${inputClasses} pr-10`} /></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{filteredBrands.length} نمایش داده شده</p>
        </div>
        {loading && brands.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>در حال بارگذاری برندها...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="px-6 py-16 text-center"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">branding_watermark</span><h2 className="mt-3 font-medium text-gray-900 dark:text-white">{brands.length === 0 ? "هنوز برندی وجود ندارد" : "برندی یافت نشد"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{brands.length === 0 ? "برندی ایجاد کنید تا فهرست محصولات خود را سازماندهی کنید." : "عبارت جستجوی دیگری امتحان کنید."}</p></div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredBrands.map((brand) => {
              const imageUrl = resolveBrandImageUrl(brand.image);
              return <li key={brand.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">{imageUrl ? <img src={imageUrl} alt={`لوگوی ${brand.name}`} className="size-full object-contain p-1.5" /> : <span className="material-symbols-outlined text-gray-400">branding_watermark</span>}</span><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-gray-950 dark:text-white">{brand.name}</h2><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{brand.image ? "تصویر آپلود شده" : "بدون تصویر"}</p></div></div><div className="flex shrink-0"><button type="button" onClick={() => startEditing(brand)} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label={`ویرایش ${brand.name}`}><span className="material-symbols-outlined text-xl">edit</span></button><button type="button" onClick={() => void remove(brand)} disabled={submitting} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`حذف ${brand.name}`}><span className="material-symbols-outlined text-xl">delete</span></button></div></li>;
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmData !== null}
        title={confirmData?.title ?? ""}
        message={confirmData?.message ?? ""}
        onConfirm={() => confirmData?.onConfirm()}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}

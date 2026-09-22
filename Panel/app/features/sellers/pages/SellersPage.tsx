import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { createClientId } from "~/shared/utils/create-client-id";
import { SellerLocationMap } from "../components/SellerLocationMap";
import { SellerStatus, type SellerImage, type SellerListOutput } from "../models/seller";
import { useSellerStore } from "../store/seller-store";
import { resolveSellerImageUrl } from "../utils/resolve-seller-image-url";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

const statuses = [
  { value: SellerStatus.Pending, label: "در انتظار" },
  { value: SellerStatus.Active, label: "فعال" },
  { value: SellerStatus.Suspended, label: "معلق" },
  { value: SellerStatus.Rejected, label: "رد شده" },
];

export default function SellersPage() {
  const { sellers, loading, submitting, error, fetchSellers, getSeller, createSeller, updateSeller, saveSellerImage, deleteSeller } =
    useSellerStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [status, setStatus] = useState(SellerStatus.Active);
  const [existingImage, setExistingImage] = useState<SellerImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const editRequestId = useRef(0);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const latitudeNumber = latitude === "" ? null : Number(latitude);
  const longitudeNumber = longitude === "" ? null : Number(longitude);
  const validLatitude = latitudeNumber !== null && Number.isFinite(latitudeNumber) && latitudeNumber >= -90 && latitudeNumber <= 90;
  const validLongitude = longitudeNumber !== null && Number.isFinite(longitudeNumber) && longitudeNumber >= -180 && longitudeNumber <= 180;

  useEffect(() => {
    void fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    };
  }, [selectedImage]);

  const closeForm = () => {
    editRequestId.current += 1;
    setFormOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setStatus(SellerStatus.Active);
    setExistingImage(null);
    setSelectedImage(null);
    setFormError(null);
  };

  const startEditing = async (seller: SellerListOutput) => {
    const requestId = ++editRequestId.current;
    setFormOpen(true);
    setEditingId(seller.id);
    setExistingImage(null);
    setSelectedImage(null);
    setAddress("");
    setLatitude("");
    setLongitude("");
    setFormError(null);
    setFormLoading(true);
    try {
      const details = await getSeller(seller.id);
      if (requestId !== editRequestId.current) return;
      setName(details.name);
      setDescription(details.description ?? "");
      setAddress(details.address ?? "");
      setLatitude(String(details.latitude));
      setLongitude(String(details.longitude));
      setStatus(details.status);
      setExistingImage(details.images.find((image) => image.isMain) ?? details.images[0] ?? null);
    } finally {
      if (requestId === editRequestId.current) setFormLoading(false);
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
    setFormError(null);
    if (!name.trim()) {
      setFormError("نام فروشنده را وارد کنید.");
      return;
    }
    if (!address.trim()) {
      setFormError("آدرس فروشنده الزامی است.");
      return;
    }
    if (!validLatitude || !validLongitude || latitudeNumber === null || longitudeNumber === null) {
      setFormError("مکان معتبری روی نقشه انتخاب کنید یا عرض و طول جغرافیایی معتبر وارد کنید.");
      return;
    }
    let sellerId = editingId;
    if (sellerId === null) {
      const created = await createSeller({
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      });
      if (!created) return;
      sellerId = created.id;
    } else {
      const updated = await updateSeller(sellerId, {
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        latitude: latitudeNumber,
        longitude: longitudeNumber,
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
    setConfirmData({
      title: "حذف فروشنده",
      message: `آیا از حذف «${seller.name}» اطمینان دارید؟ محصولات اختصاص یافته به آن باید ابتدا حذف شوند.`,
      onConfirm: async () => {
        setConfirmData(null);
        await deleteSeller(seller.id);
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">فهرست</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">فروشندگان</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">مدیریت فروشندگانی که مالک آگهی محصولات هستند.</p>
        </div>
        <button onClick={() => formOpen ? closeForm() : setFormOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
          <span className="material-symbols-outlined text-xl">{formOpen ? "close" : "add_business"}</span>
          {formOpen ? "بستن" : "فروشنده جدید"}
        </button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {formOpen && (
        <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-950 dark:text-white">{editingId === null ? "ایجاد فروشنده" : "ویرایش فروشنده"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={inputClasses} required disabled={formLoading} /></label>
            {editingId !== null && <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">وضعیت</span><select value={status} onChange={(event) => setStatus(Number(event.target.value))} className={inputClasses}>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClasses} min-h-24 py-3`} /></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">آدرس</span><textarea value={address} onChange={(event) => setAddress(event.target.value)} className={`${inputClasses} min-h-20 py-3`} required disabled={formLoading} /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">عرض جغرافیایی</span><input type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} className={inputClasses} required disabled={formLoading} /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">طول جغرافیایی</span><input type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} className={inputClasses} required disabled={formLoading} /></label>
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">مکان</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">روی نقشه کلیک کنید تا مختصات تنظیم شود</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                <SellerLocationMap
                  latitude={validLatitude ? latitudeNumber : null}
                  longitude={validLongitude ? longitudeNumber : null}
                  onChange={(nextLatitude, nextLongitude) => {
                    setLatitude(nextLatitude.toFixed(6));
                    setLongitude(nextLongitude.toFixed(6));
                    setFormError(null);
                  }}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تصویر فروشنده</span>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
                  {selectedImage || resolveSellerImageUrl(existingImage) ? <img src={selectedImage?.previewUrl ?? resolveSellerImageUrl(existingImage) ?? undefined} alt={`پیش‌نمایش ${name || "فروشنده"}`} className="size-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">storefront</span>}
                </div>
                <div>
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                    <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                    {existingImage || selectedImage ? "جایگزینی تصویر" : "انتخاب تصویر"}
                    <input type="file" accept="image/*" onChange={selectImage} className="sr-only" disabled={formLoading} />
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">فقط یک تصویر. انتخاب تصویر جایگزین تصویر فعلی می‌شود.</p>
                  {selectedImage && <button type="button" onClick={() => setSelectedImage(null)} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400">لغو انتخاب تصویر</button>}
                </div>
              </div>
            </div>
          </div>
          {formError && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <button disabled={submitting || formLoading || !name.trim() || !address.trim() || !validLatitude || !validLongitude} className="mt-4 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "در حال ذخیره..." : "ذخیره فروشنده"}</button>
        </form>
      )}

      {loading && sellers.length === 0 ? (
        <div className="flex justify-center py-16 text-sm text-gray-500">در حال بارگذاری فروشندگان...</div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900"><span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">storefront</span><p className="mt-3 text-sm text-gray-500">قبل از افزودن محصول، فروشنده ایجاد کنید.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sellers.map((seller) => (
            <article key={seller.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                 <div className="flex min-w-0 items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">{resolveSellerImageUrl(seller.image) ? <img src={resolveSellerImageUrl(seller.image) ?? undefined} alt="" className="size-full object-cover" /> : <span className="material-symbols-outlined">storefront</span>}</span><div className="min-w-0"><h2 className="truncate font-semibold text-gray-950 dark:text-white">{seller.name}</h2><p className="text-xs text-gray-500">{statuses.find((item) => item.value === seller.status)?.label}</p></div></div>
                 <div className="flex"><button onClick={() => void startEditing(seller)} disabled={formLoading} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800" aria-label={`ویرایش ${seller.name}`}><span className="material-symbols-outlined text-xl">edit</span></button><button onClick={() => void remove(seller)} disabled={submitting} className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`حذف ${seller.name}`}><span className="material-symbols-outlined text-xl">delete</span></button></div>
              </div>
              <p className="mt-4 line-clamp-3 min-h-15 text-sm leading-5 text-gray-500 dark:text-gray-400">{seller.description || "بدون توضیحات"}</p>
              <p className="mt-3 flex items-start gap-2 border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"><span className="material-symbols-outlined mt-0.5 text-base text-primary-500">location_on</span><span className="line-clamp-2">{seller.address || "بدون آدرس"}</span></p>
            </article>
          ))}
        </div>
      )}

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

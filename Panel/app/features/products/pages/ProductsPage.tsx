import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { categoryApi } from "~/features/categories/api/category-api";
import type { CategoryListOutput } from "~/features/categories/models/output/category-list-output";
import { sellerApi } from "~/features/sellers/api/seller-api";
import type { SellerListOutput } from "~/features/sellers/models/seller";
import { ProductWizard } from "../components/ProductWizard";
import type { ProductListOutput, ProductListParams } from "../models/product";
import { useProductStore } from "../store/product-store";
import { resolveProductImageUrl } from "../utils/resolve-product-image-url";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
}

export default function ProductsPage() {
  const { products, loading, submitting, error, fetchProducts, deleteProduct } = useProductStore();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListOutput | null>(null);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");
  const [filterSellerId, setFilterSellerId] = useState<number | "">("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterIsAvailable, setFilterIsAvailable] = useState<string>("");

  const [categories, setCategories] = useState<CategoryListOutput[]>([]);
  const [sellers, setSellers] = useState<SellerListOutput[]>([]);

  const buildParams = (): ProductListParams => {
    const params: ProductListParams = {};
    if (filterName.trim()) params.name = filterName.trim();
    if (filterCategoryId !== "") params.categoryId = filterCategoryId;
    if (filterSellerId !== "") params.sellerId = filterSellerId;
    if (filterMinPrice !== "") params.minPrice = Number(filterMinPrice);
    if (filterMaxPrice !== "") params.maxPrice = Number(filterMaxPrice);
    if (filterIsAvailable !== "") params.isAvailable = filterIsAvailable === "true";
    return params;
  };

  const applyFilters = () => {
    void fetchProducts(buildParams());
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterCategoryId("");
    setFilterSellerId("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterIsAvailable("");
    void fetchProducts();
  };

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (filterOpen) {
      Promise.all([categoryApi.list(), sellerApi.list()]).then(([cats, sells]) => {
        setCategories(cats);
        setSellers(sells);
      });
    }
  }, [filterOpen]);

  const hasActiveFilters = filterName || filterCategoryId !== "" || filterSellerId !== "" || filterMinPrice || filterMaxPrice || filterIsAvailable !== "";

  const completeWizard = () => {
    setWizardOpen(false);
    setEditingProduct(null);
    void fetchProducts(buildParams());
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">فهرست</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">محصولات</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ساخت و مدیریت فهرست محصولات فروشگاه.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${filterOpen || hasActiveFilters ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"}`}
          >
            <span className="material-symbols-outlined text-xl">filter_list</span>
            فیلتر
            {hasActiveFilters && <span className="size-2 rounded-full bg-primary-500"></span>}
          </button>
          <button onClick={() => setWizardOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950">
            <span className="material-symbols-outlined text-[20px]">add</span>محصول جدید
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام محصول</span>
              <input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="جستجوی نام..." className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">دسته‌بندی</span>
              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : "")} className={inputClasses}>
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">فروشنده</span>
              <select value={filterSellerId} onChange={(e) => setFilterSellerId(e.target.value ? Number(e.target.value) : "")} className={inputClasses}>
                <option value="">همه فروشندگان</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>{seller.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">قیمت از</span>
              <input type="number" min="0" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} placeholder="حداقل قیمت" className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">قیمت تا</span>
              <input type="number" min="0" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} placeholder="حداکثر قیمت" className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">موجودی</span>
              <select value={filterIsAvailable} onChange={(e) => setFilterIsAvailable(e.target.value)} className={inputClasses}>
                <option value="">همه</option>
                <option value="true">موجود</option>
                <option value="false">ناموجود</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={applyFilters} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
              اعمال فیلتر
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                پاک کردن
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <span className="flex items-start gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</span>
          <button onClick={() => void fetchProducts(buildParams())} className="shrink-0 font-semibold hover:underline">تلاش مجدد</button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_7rem_7rem_6rem_5rem_6rem] border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 gap-3">
          <span></span>
          <span>نام</span>
          <span>دسته‌بندی</span>
          <span>فروشنده</span>
          <span className="text-center">قیمت</span>
          <span className="text-center">موجود</span>
          <span className="text-center">عملیات</span>
        </div>

        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>در حال بارگذاری محصولات...
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">inventory_2</span>
            <h2 className="mt-2 font-medium text-gray-900 dark:text-white">{hasActiveFilters ? "هیچ محصولی مطابق فیلترها یافت نشد" : "فهرست محصولات خالی است"}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hasActiveFilters ? "فیلترها را تغییر دهید یا پاک کنید." : "اولین محصول را با جادوگر راهنما بسازید."}</p>
            {!hasActiveFilters && <button onClick={() => setWizardOpen(true)} className="mt-5 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">ایجاد محصول</button>}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {products.map((product) => (
              <li key={product.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_7rem_7rem_6rem_5rem_6rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-950 sm:px-5">
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                  {resolveProductImageUrl(product.image) ? (
                    <img src={resolveProductImageUrl(product.image) ?? undefined} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-xl text-gray-400 dark:text-gray-500">image</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  {product.shortDescription && <p className="mt-0.5 truncate text-xs text-gray-400">{product.shortDescription}</p>}
                </div>
                <span className="hidden truncate text-sm text-gray-600 sm:block dark:text-gray-300">{product.categoryTitle}</span>
                <span className="hidden truncate text-sm text-gray-600 sm:block dark:text-gray-300">{product.seller.name}</span>
                <div className="hidden text-center sm:block">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                </div>
                <div className="hidden text-center sm:block">
                  {product.isAvailable ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                      <span className="size-1.5 rounded-full bg-green-500"></span>بله
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                      <span className="size-1.5 rounded-full bg-red-500"></span>خیر
                    </span>
                  )}
                </div>
                <div className="flex justify-center gap-1">
                  <button onClick={() => { setEditingProduct(product); setWizardOpen(true); }} disabled={submitting} className="flex size-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-primary-400" aria-label={`ویرایش ${product.name}`}><span className="material-symbols-outlined text-xl">edit</span></button>
                  <button onClick={() => {
                    setConfirmData({
                      title: "حذف محصول",
                      message: `آیا از حذف محصول «${product.name}» اطمینان دارید؟`,
                      onConfirm: async () => {
                        setConfirmData(null);
                        await deleteProduct(product.id);
                      },
                    });
                  }} disabled={submitting} className="flex size-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400" aria-label={`حذف ${product.name}`}><span className="material-symbols-outlined text-xl">delete</span></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {wizardOpen && <ProductWizard product={editingProduct ?? undefined} onClose={closeWizard} onComplete={completeWizard} />}

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

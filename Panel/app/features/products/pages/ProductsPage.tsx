import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { Pagination } from "~/components/common/Pagination";
import { brandApi } from "~/features/brands/api/brand-api";
import type { Brand } from "~/features/brands/models/brand";
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
  const { products, totalCount, page, pageSize, lastParams, loading, submitting, error, fetchProducts, deleteProduct, updatePricesByPercentage } =
    useProductStore();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListOutput | null>(null);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void } | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [pricePercentage, setPricePercentage] = useState("");
  const [priceIsIncrease, setPriceIsIncrease] = useState(true);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);
  const [priceUpdateMessage, setPriceUpdateMessage] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");
  const [filterProductBrandId, setFilterProductBrandId] = useState<number | "">("");
  const [filterSellerId, setFilterSellerId] = useState<number | "">("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterIsAvailable, setFilterIsAvailable] = useState<string>("");

  const [categories, setCategories] = useState<CategoryListOutput[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sellers, setSellers] = useState<SellerListOutput[]>([]);

  const buildParams = (): ProductListParams => {
    const params: ProductListParams = {};
    if (filterName.trim()) params.name = filterName.trim();
    if (filterCategoryId !== "") params.categoryId = filterCategoryId;
    if (filterProductBrandId !== "") params.productBrandId = filterProductBrandId;
    if (filterSellerId !== "") params.sellerId = filterSellerId;
    if (filterMinPrice !== "") params.minPrice = Number(filterMinPrice);
    if (filterMaxPrice !== "") params.maxPrice = Number(filterMaxPrice);
    if (filterIsAvailable !== "") params.isAvailable = filterIsAvailable === "true";
    return params;
  };

  const applyFilters = () => {
    void fetchProducts({ ...buildParams(), page: 1, pageSize });
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterCategoryId("");
    setFilterProductBrandId("");
    setFilterSellerId("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterIsAvailable("");
    void fetchProducts({ page: 1, pageSize });
  };

  const openPriceModal = () => {
    setPricePercentage("");
    setPriceIsIncrease(true);
    setPriceValidationError(null);
    setPriceUpdateMessage(null);
    setPriceModalOpen(true);
  };

  const runPriceUpdate = async (percentage: number, isIncrease: boolean) => {
    const filters = { ...lastParams };
    delete filters.page;
    delete filters.pageSize;

    try {
      const result = await updatePricesByPercentage({ ...filters, percentage, isIncrease, expectedProductCount: totalCount });
      setPriceUpdateMessage(
        `قیمت ${new Intl.NumberFormat("fa-IR").format(result.variantCount)} تنوع از ${new Intl.NumberFormat("fa-IR").format(result.productCount)} محصول با موفقیت به‌روزرسانی شد.`
      );
    } catch {
      // Store exposes the request error in the page error alert.
    }
  };

  const requestPriceUpdateConfirmation = () => {
    const percentage = Number(pricePercentage);
    if (!Number.isFinite(percentage) || percentage < 1 || percentage > 100) {
      setPriceValidationError("درصد باید عددی بین ۱ تا ۱۰۰ باشد.");
      return;
    }
    if (totalCount === 0) {
      setPriceValidationError("محصولی برای تغییر قیمت وجود ندارد.");
      return;
    }

    const operation = priceIsIncrease ? "افزایش" : "کاهش";
    setPriceModalOpen(false);
    setConfirmData({
      title: `${operation} گروهی قیمت‌ها`,
      message: `قیمت تمام تنوع‌های ${new Intl.NumberFormat("fa-IR").format(totalCount)} محصولی که اکنون در نتیجه فیلترها قرار دارند، ${new Intl.NumberFormat("fa-IR").format(percentage)} درصد ${operation} پیدا می‌کند. آیا مطمئن هستید؟`,
      confirmLabel: `بله، ${operation} بده`,
      danger: !priceIsIncrease,
      onConfirm: () => {
        setConfirmData(null);
        void runPriceUpdate(percentage, priceIsIncrease);
      },
    });
  };

  const changePage = (nextPage: number) => {
    void fetchProducts({ ...buildParams(), page: nextPage, pageSize });
  };

  const changePageSize = (nextPageSize: number) => {
    void fetchProducts({ ...buildParams(), page: 1, pageSize: nextPageSize });
  };

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (filterOpen) {
      Promise.all([categoryApi.list(), brandApi.list(), sellerApi.list()]).then(([cats, brandItems, sells]) => {
        setCategories(cats);
        setBrands(brandItems);
        setSellers(sells);
      });
    }
  }, [filterOpen]);

  const hasActiveFilters = filterName || filterCategoryId !== "" || filterProductBrandId !== "" || filterSellerId !== "" || filterMinPrice || filterMaxPrice || filterIsAvailable !== "";

  const pricePercentageValue = Number(pricePercentage);
  const canApplyPrice =
    pricePercentage.trim() !== "" &&
    Number.isFinite(pricePercentageValue) &&
    pricePercentageValue >= 1 &&
    pricePercentageValue <= 100;

  const completeWizard = () => {
    setWizardOpen(false);
    setEditingProduct(null);
    void fetchProducts({ ...buildParams(), page, pageSize });
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
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`order-3 col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors sm:order-1 sm:col-span-1 ${filterOpen || hasActiveFilters ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"}`}
          >
            <span className="material-symbols-outlined text-xl">filter_list</span>
            فیلتر
            {hasActiveFilters && <span className="size-2 rounded-full bg-primary-500"></span>}
          </button>
          <button
            type="button"
            onClick={openPriceModal}
            disabled={loading || submitting || totalCount === 0}
            className="order-1 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary-300 bg-white px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-700 dark:bg-gray-950 dark:text-primary-300 dark:hover:bg-primary-950/30 sm:order-2"
          >
            <span className="material-symbols-outlined text-xl">price_change</span>
            تغییر گروهی قیمت
          </button>
          <button onClick={() => setWizardOpen(true)} className="order-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 sm:order-3">
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
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">برند</span>
              <select value={filterProductBrandId} onChange={(e) => setFilterProductBrandId(e.target.value ? Number(e.target.value) : "")} className={inputClasses}>
                <option value="">همه برندها</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
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
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
          <button onClick={() => void fetchProducts({ ...buildParams(), page })} className="shrink-0 font-semibold hover:underline">تلاش مجدد</button>
        </div>
      )}

      {priceUpdateMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300" role="status">
          <span className="flex items-start gap-2"><span className="material-symbols-outlined text-[20px]">check_circle</span>{priceUpdateMessage}</span>
          <button type="button" onClick={() => setPriceUpdateMessage(null)} className="shrink-0" aria-label="بستن پیام"><span className="material-symbols-outlined text-lg">close</span></button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_7rem_7rem_6rem_5rem_6rem] border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 gap-3">
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
              <li key={product.id} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-950 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_7rem_7rem_6rem_5rem_6rem] lg:items-center lg:gap-3 lg:px-5 lg:py-3">
                <div className="lg:hidden">
                  <div className="flex items-start gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                      {resolveProductImageUrl(product.image) ? <img src={resolveProductImageUrl(product.image) ?? undefined} alt="" className="size-full object-cover" /> : <span className="material-symbols-outlined text-2xl text-gray-400">image</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="break-words text-sm font-bold text-gray-900 dark:text-white">{product.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${product.isAvailable ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"}`}>{product.isAvailable ? "موجود" : "ناموجود"}</span>
                      </div>
                      {product.shortDescription && <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{product.shortDescription}</p>}
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50">
                    <div><dt className="text-gray-400">دسته‌بندی</dt><dd className="mt-1 font-semibold text-gray-700 dark:text-gray-200">{product.categoryTitle}</dd></div>
                    <div><dt className="text-gray-400">فروشنده</dt><dd className="mt-1 font-semibold text-gray-700 dark:text-gray-200">{product.seller.name}</dd></div>
                    <div className="col-span-2"><dt className="text-gray-400">قیمت</dt><dd className="mt-1 text-base font-black text-primary-600 dark:text-primary-400">{formatPrice(product.price)} تومان</dd></div>
                  </dl>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => { setEditingProduct(product); setWizardOpen(true); }} disabled={submitting} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary-200 text-sm font-semibold text-primary-700 disabled:opacity-50 dark:border-primary-800 dark:text-primary-300"><span className="material-symbols-outlined text-lg">edit</span>ویرایش</button>
                    <button onClick={() => setConfirmData({ title: "حذف محصول", message: `آیا از حذف محصول «${product.name}» اطمینان دارید؟`, onConfirm: async () => { setConfirmData(null); await deleteProduct(product.id); } })} disabled={submitting} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 disabled:opacity-50 dark:border-red-900 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span>حذف</button>
                  </div>
                </div>
                <div className="hidden size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 lg:flex">
                  {resolveProductImageUrl(product.image) ? (
                    <img src={resolveProductImageUrl(product.image) ?? undefined} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-xl text-gray-400 dark:text-gray-500">image</span>
                  )}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  {product.shortDescription && <p className="mt-0.5 truncate text-xs text-gray-400">{product.shortDescription}</p>}
                </div>
                <span className="hidden truncate text-sm text-gray-600 lg:block dark:text-gray-300">{product.categoryTitle}</span>
                <span className="hidden truncate text-sm text-gray-600 lg:block dark:text-gray-300">{product.seller.name}</span>
                <div className="hidden text-center lg:block">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                </div>
                <div className="hidden text-center lg:block">
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
                <div className="hidden justify-center gap-1 lg:flex">
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

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={loading}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
        />
      </section>

      {priceModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="price-update-title" onMouseDown={() => setPriceModalOpen(false)}>
          <form onSubmit={(event) => { event.preventDefault(); requestPriceUpdateConfirmation(); }} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="price-update-title" className="text-lg font-semibold text-gray-900 dark:text-white">تغییر گروهی قیمت</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">این عملیات روی تمام {new Intl.NumberFormat("fa-IR").format(totalCount)} محصول نتیجه فعلی انجام می‌شود.</p>
                </div>
                <button type="button" onClick={() => setPriceModalOpen(false)} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="بستن">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="space-y-5 px-6 py-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">نوع تغییر</legend>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                  <button type="button" onClick={() => setPriceIsIncrease(true)} className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${priceIsIncrease ? "bg-white text-green-700 shadow-sm dark:bg-gray-950 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>افزایش قیمت</button>
                  <button type="button" onClick={() => setPriceIsIncrease(false)} className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${!priceIsIncrease ? "bg-white text-red-700 shadow-sm dark:bg-gray-950 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>کاهش قیمت</button>
                </div>
              </fieldset>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">درصد تغییر</span>
                <div className="relative">
                  <input autoFocus type="number" min="1" max="100" step="0.01" inputMode="decimal" value={pricePercentage} onChange={(event) => { const value = event.target.value; setPricePercentage(value !== "" && Number(value) > 100 ? "100" : value); setPriceValidationError(null); }} placeholder="مثلاً ۱۰" className={`${inputClasses} pl-12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} aria-describedby={priceValidationError ? "price-percentage-error" : undefined} />
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-gray-400">٪</span>
                </div>
                {priceValidationError && <span id="price-percentage-error" role="alert" className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">{priceValidationError}</span>}
              </label>
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">قیمت تمام تنوع‌های محصولات منطبق تغییر می‌کند؛ نه فقط محصولات صفحه فعلی.</p>
            </div>
            <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <button type="submit" disabled={submitting || !canApplyPrice} className="min-h-11 flex-1 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">اعمال</button>
              <button type="button" onClick={() => setPriceModalOpen(false)} className="min-h-11 flex-1 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">لغو</button>
            </div>
          </form>
        </div>
      )}

      {wizardOpen && <ProductWizard product={editingProduct ?? undefined} onClose={closeWizard} onComplete={completeWizard} />}

      <ConfirmDialog
        open={confirmData !== null}
        title={confirmData?.title ?? ""}
        message={confirmData?.message ?? ""}
        confirmLabel={confirmData?.confirmLabel}
        danger={confirmData?.danger}
        onConfirm={() => confirmData?.onConfirm()}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}

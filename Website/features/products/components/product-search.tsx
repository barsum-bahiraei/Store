"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { Category } from "@/features/categories/types/category";
import { ProductCard } from "./product-card";
import { useInfiniteProductSearch, useProductBrands } from "../hooks/use-products";
import type { ProductSearchFilters, ProductSearchItem, ProductSort } from "../types/product";

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "جدیدترین" },
  { value: "priceAsc", label: "ارزان‌ترین" },
  { value: "priceDesc", label: "گران‌ترین" },
];

function sortHref(filters: ProductSearchFilters, sort: ProductSort) {
  const params = new URLSearchParams();
  if (filters.name) params.set("q", filters.name);
  if (filters.categoryId) params.set("category", String(filters.categoryId));
  if (filters.productBrandId) params.set("productBrandId", String(filters.productBrandId));
  if (filters.isAvailable !== undefined) params.set("available", String(filters.isAvailable));
  if (filters.hasDiscount) params.set("discount", "true");
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (sort !== "priceAsc") params.set("sort", sort);
  return params.size ? `/shop?${params.toString()}` : "/shop";
}

function descendants(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...descendants(category.children)]);
}

export function ProductSearch({ filters, sort, showFilters = true }: { filters: ProductSearchFilters; sort: ProductSort; showFilters?: boolean }) {
  const { data, isPending, isError, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteProductSearch(filters);
  const { data: brands = [], isPending: areBrandsPending, isError: isBrandsError } = useProductBrands();
  const { data: categoryTree = [] } = useCategories();
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(filters.categoryId ? String(filters.categoryId) : "");
  const selectedCategoryLabel = descendants(categoryTree).find((category) => String(category.id) === selectedCategoryId)?.name ?? (selectedCategoryId ? `دسته‌بندی ${selectedCategoryId}` : "همه دسته‌بندی‌ها");

  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const loadedPath = navigation?.name ? new URL(navigation.name).pathname : "";
    if (navigation?.type === "reload" && loadedPath === window.location.pathname && window.location.search) {
      window.location.replace("/shop");
    }
  }, []);

  const products = useMemo(() => {
    const uniqueProducts = new Map<number, ProductSearchItem>();
    for (const page of data?.pages ?? []) {
      for (const product of page.items) {
        if (!uniqueProducts.has(product.id)) uniqueProducts.set(product.id, product);
      }
    }
    return [...uniqueProducts.values()];
  }, [data]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetching || isError) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false });
    }, { rootMargin: "400px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isError, products.length]);

  useEffect(() => {
    function closeCategoryFilter(event: PointerEvent) {
      if (!categoryDropdownRef.current?.contains(event.target as Node)) {
        setOpenCategoryId(null);
        setIsCategoryDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeCategoryFilter);
    return () => document.removeEventListener("pointerdown", closeCategoryFilter);
  }, []);

  return (
    <div className={`mx-auto grid w-full max-w-[1700px] items-start gap-5 rounded-3xl border border-primary/20 bg-surface p-3 shadow-xl shadow-primary-shadow sm:p-5 lg:gap-6 lg:p-6 ${showFilters ? "pb-20 lg:grid-cols-[20rem_minmax(0,1fr)] lg:pb-6" : ""}`}>
      {showFilters && <>
        <button type="button" onClick={() => setIsFiltersOpen(true)} className="fixed inset-x-4 bottom-4 z-40 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-xl shadow-primary-shadow outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
          <span className="material-symbols-rounded" aria-hidden="true">tune</span>
          نمایش فیلترها
        </button>
        {isFiltersOpen && <button type="button" aria-label="بستن فیلترها" onClick={() => setIsFiltersOpen(false)} className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden" />}
      <aside className={`self-start rounded-2xl border border-primary/25 bg-surface p-5 shadow-2xl shadow-primary-shadow lg:sticky lg:top-40 lg:block lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:shadow-none ${isFiltersOpen ? "fixed inset-x-3 bottom-3 top-20 z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto" : "hidden"}`}>
        <div className="mb-5 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="material-symbols-rounded text-primary" aria-hidden="true">tune</span><h2 className="font-black">فیلترها</h2></div><button type="button" aria-label="بستن فیلترها" onClick={() => setIsFiltersOpen(false)} className="grid size-10 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:hidden"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div>
        <form key={JSON.stringify(filters)} action="/shop" method="get" onPointerDownCapture={(event) => { if (!categoryDropdownRef.current?.contains(event.target as Node)) { setIsCategoryDropdownOpen(false); setOpenCategoryId(null); } }} className="space-y-5">
          {sort !== "priceAsc" && <input type="hidden" name="sort" value={sort} />}
          <div><label htmlFor="filter-name" className="text-sm font-bold">نام محصول</label><input id="filter-name" name="q" type="search" defaultValue={filters.name} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
          <fieldset>
            <legend className="text-sm font-bold">دسته‌بندی</legend>
            <input type="hidden" name="category" value={selectedCategoryId} readOnly />
            <div ref={categoryDropdownRef} className="relative mt-2">
            <button type="button" aria-expanded={isCategoryDropdownOpen} onClick={() => setIsCategoryDropdownOpen((isOpen) => !isOpen)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 text-right text-sm font-bold outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/15">
              <span className={selectedCategoryId ? "text-foreground" : "text-muted-foreground"}>{selectedCategoryLabel}</span>
              <span className={`material-symbols-rounded text-lg transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
            </button>
            {isCategoryDropdownOpen && <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-primary-shadow">
              <button type="button" onClick={() => { setSelectedCategoryId(""); setOpenCategoryId(null); setIsCategoryDropdownOpen(false); }} className={`flex min-h-11 w-full items-center px-3 text-right text-sm font-bold outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selectedCategoryId === "" ? "bg-primary/10 text-primary" : ""}`}>همه دسته‌بندی‌ها</button>
              <div className="max-h-72 divide-y divide-border/70 overflow-y-auto">
                {categoryTree.map((category) => {
                  const isOpen = openCategoryId === category.id;
                  const hasChildren = category.children.length > 0;
                  return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        <button type="button" onClick={() => { setSelectedCategoryId(String(category.id)); setOpenCategoryId(null); setIsCategoryDropdownOpen(false); }} className={`min-h-11 min-w-0 flex-1 px-3 text-right text-sm font-black outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selectedCategoryId === String(category.id) ? "bg-primary/10 text-primary" : ""}`}>
                          {category.name}
                        </button>
                        {hasChildren && <button type="button" aria-label={`زیرمجموعه‌های ${category.name}`} aria-expanded={isOpen} onClick={() => setOpenCategoryId(isOpen ? null : category.id)} className="grid size-11 shrink-0 place-items-center rounded-lg outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><span className={`material-symbols-rounded text-lg transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span></button>}
                      </div>
                      <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="min-h-0">
                          {descendants(category.children).map((child) => <button key={child.id} type="button" onClick={() => { setSelectedCategoryId(String(child.id)); setOpenCategoryId(null); setIsCategoryDropdownOpen(false); }} className={`block min-h-10 w-full px-5 text-right text-sm outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selectedCategoryId === String(child.id) ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"}`}>{child.name}</button>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>}
            </div>
          </fieldset>
          <div>
            <label htmlFor="filter-brand" className="text-sm font-bold">برند</label>
            <select id="filter-brand" name="productBrandId" defaultValue={filters.productBrandId ?? ""} disabled={areBrandsPending || isBrandsError} aria-describedby={isBrandsError ? "brand-filter-error" : undefined} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60">
              <option value="">{areBrandsPending ? "در حال بارگذاری برندها…" : isBrandsError ? "برندها در دسترس نیستند" : "همه برندها"}</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            {isBrandsError && <p id="brand-filter-error" role="alert" className="mt-2 text-xs text-error">بارگذاری فهرست برندها انجام نشد.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="min-price" className="text-sm font-bold">حداقل قیمت</label><input id="min-price" name="minPrice" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={filters.minPrice} className="mt-2 h-11 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /></div><div><label htmlFor="max-price" className="text-sm font-bold">حداکثر قیمت</label><input id="max-price" name="maxPrice" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={filters.maxPrice} className="mt-2 h-11 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /></div></div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-h-11 items-center gap-1.5 whitespace-nowrap text-xs font-bold"><input name="available" value="true" type="checkbox" defaultChecked={filters.isAvailable === true} className="size-5 shrink-0 accent-primary" />محصولات موجود</label>
            <label className="flex min-h-11 items-center gap-1.5 whitespace-nowrap text-xs font-bold"><input name="discount" value="true" type="checkbox" defaultChecked={filters.hasDiscount} className="size-5 shrink-0 accent-primary" />محصولات تخفیف‌دار</label>
          </div>
          <div className="grid gap-2"><button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring">اعمال فیلترها</button><Link href="/shop" className="grid min-h-11 place-items-center rounded-lg text-sm font-bold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">پاک کردن فیلترها</Link></div>
        </form>
      </aside></>}
      <section aria-labelledby="search-results-title" aria-busy={isFetching} className="min-w-0 self-start">
        <h2 id="search-results-title" className="sr-only">محصولات</h2>
        <nav aria-label="مرتب‌سازی محصولات" className="mb-4 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border pb-3">
          <span className="shrink-0 text-sm font-bold text-muted-foreground">مرتب‌سازی:</span>
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={sortHref(filters, option.value)}
              aria-current={sort === option.value ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border px-4 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${sort === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:bg-muted"}`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
        <div role="region" aria-label="فهرست محصولات">
          {isFetching && !isPending && <span role="status" className="sr-only">در حال به‌روزرسانی محصولات…</span>}
          {isPending ? <div role="status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1700px]:grid-cols-5">      <span className="sr-only">در حال بارگذاری محصولات</span>{Array.from({ length: 10 }, (_, index) => <span key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>
          : isError && !data ? <div role="alert" className="rounded-xl border border-border bg-surface p-6"><p className="text-error">بارگذاری نتایج جست‌وجو انجام نشد.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-3 min-h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground disabled:opacity-60">{isFetching ? "در حال بارگذاری…" : "تلاش دوباره"}</button></div>
            : products.length === 0 ? <div className="rounded-2xl border border-accent/65 bg-accent/20 p-8 text-center shadow-lg shadow-primary-shadow backdrop-blur-xl"><span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">search_off</span><h3 className="mt-3 text-lg font-black">محصولی پیدا نشد</h3><p className="mt-1 text-sm text-muted-foreground">فیلترها را حذف کنید یا نام دیگری جست‌وجو کنید.</p></div>
              : <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1700px]:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  {isFetchingNextPage && <div role="status" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"><span className="material-symbols-rounded animate-spin motion-reduce:animate-none" aria-hidden="true">progress_activity</span>در حال بارگذاری محصولات بیشتر…</div>}
                  {isError && data && <div role="alert" className="mt-6 rounded-xl border border-border bg-surface p-4 text-center"><p className="text-error">بارگذاری محصولات بعدی انجام نشد.</p><button type="button" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage} className="mt-3 min-h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground disabled:opacity-60">تلاش دوباره</button></div>}
                  {hasNextPage && !isError && <div ref={loadMoreRef} className="h-1" aria-hidden="true" />}
                  {!hasNextPage && <p role="status" className="mt-8 text-center text-sm text-muted-foreground">همه محصولات نمایش داده شد.</p>}
                </>}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { Category } from "@/features/categories/types/category";
import { ProductCard } from "./product-card";
import { useProductBrands, useProductSearch } from "../hooks/use-products";
import type { ProductSearchInput } from "../types/product";

const pageSize = 12;

function flattenCategories(categories: Category[], depth = 0): Array<{ id: number; name: string }> {
  return categories.flatMap((category) => [
    { id: category.id, name: `${"- ".repeat(depth)}${category.name}` },
    ...flattenCategories(category.children, depth + 1),
  ]);
}

function pageHref(filters: ProductSearchInput, page: number) {
  const params = new URLSearchParams();
  if (filters.name) params.set("q", filters.name);
  if (filters.categoryId) params.set("category", String(filters.categoryId));
  if (filters.productBrandId) params.set("productBrandId", String(filters.productBrandId));
  if (filters.isAvailable === true) params.set("available", "true");
  if (filters.isAvailable === false) params.set("available", "false");
  if (filters.hasDiscount) params.set("discount", "true");
  if (filters.minPrice && filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice > 0) params.set("maxPrice", String(filters.maxPrice));
  const sort = sortValue(filters);
  if (sort !== "default") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function sortValue(filters: ProductSearchInput) {
  if (filters.isPriceDec) return "priceDesc";
  if (!filters.isPriceDec && (filters.minPrice !== undefined || filters.maxPrice !== undefined)) return "priceAsc";
  if (filters.isIdDec) return "newest";
  return "default";
}

export function ProductSearch({ filters }: { filters: ProductSearchInput }) {
  const { data, isPending, isError, isFetching, refetch } = useProductSearch(filters);
  const { data: brands = [], isPending: areBrandsPending, isError: isBrandsError } = useProductBrands();
  const { data: categoryTree = [] } = useCategories();
  const categories = flattenCategories(categoryTree);
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-36">
        <div className="mb-5 flex items-center gap-2"><span className="material-symbols-rounded text-primary" aria-hidden="true">tune</span><h2 className="font-black">فیلترها</h2></div>
        <form key={JSON.stringify(filters)} action="/search" method="get" className="space-y-5">
          <div><label htmlFor="filter-name" className="text-sm font-bold">نام محصول</label><input id="filter-name" name="q" type="search" defaultValue={filters.name} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
          <div><label htmlFor="filter-category" className="text-sm font-bold">دسته‌بندی</label><select id="filter-category" name="category" defaultValue={filters.categoryId ?? ""} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">همه دسته‌بندی‌ها</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div>
            <label htmlFor="filter-brand" className="text-sm font-bold">برند</label>
            <select id="filter-brand" name="productBrandId" defaultValue={filters.productBrandId ?? ""} disabled={areBrandsPending || isBrandsError} aria-describedby={isBrandsError ? "brand-filter-error" : undefined} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60">
              <option value="">{areBrandsPending ? "در حال بارگذاری برندها…" : isBrandsError ? "برندها در دسترس نیستند" : "همه برندها"}</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            {isBrandsError && <p id="brand-filter-error" role="alert" className="mt-2 text-xs text-error">بارگذاری فهرست برندها انجام نشد.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="min-price" className="text-sm font-bold">حداقل قیمت</label><input id="min-price" name="minPrice" type="number" min="0" step="0.01" defaultValue={filters.minPrice} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div><div><label htmlFor="max-price" className="text-sm font-bold">حداکثر قیمت</label><input id="max-price" name="maxPrice" type="number" min="0" step="0.01" defaultValue={filters.maxPrice} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div></div>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold"><input name="discount" value="true" type="checkbox" defaultChecked={filters.hasDiscount} className="size-5 accent-primary" />فقط محصولات تخفیف‌دار</label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold"><input name="available" value="true" type="checkbox" defaultChecked={filters.isAvailable === true} className="size-5 accent-primary" />فقط محصولات موجود</label>
          <div><label htmlFor="sort-order" className="text-sm font-bold">مرتب‌سازی</label><select id="sort-order" name="sort" defaultValue={sortValue(filters)} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="default">پیش‌فرض</option><option value="newest">جدیدترین</option><option value="priceAsc">ارزان‌ترین</option><option value="priceDesc">گران‌ترین</option></select></div>
          <div className="grid gap-2"><button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring">اعمال فیلترها</button><Link href="/search" className="grid min-h-11 place-items-center rounded-lg text-sm font-bold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">پاک کردن فیلترها</Link></div>
        </form>
      </aside>
      <section aria-labelledby="search-results-title" aria-busy={isFetching} className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="search-results-title" className="text-xl font-black">محصولات</h2>{data && <p className="mt-1 text-sm text-muted-foreground">{data.totalCount} محصول پیدا شد</p>}</div>{isFetching && !isPending && <span role="status" className="text-sm text-muted-foreground">در حال به‌روزرسانی…</span>}</div>
        {isPending ? <div role="status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">      <span className="sr-only">در حال بارگذاری محصولات</span>{Array.from({ length: 6 }, (_, index) => <span key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>
          : isError ? <div role="alert" className="rounded-xl border border-border bg-surface p-6"><p className="text-error">بارگذاری نتایج جست‌وجو انجام نشد.</p><button type="button" onClick={() => refetch()} className="mt-3 min-h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground">تلاش دوباره</button></div>
            : !data || data.items.length === 0 ? <div className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">search_off</span><h3 className="mt-3 text-lg font-black">محصولی پیدا نشد</h3><p className="mt-1 text-sm text-muted-foreground">فیلترها را حذف کنید یا نام دیگری جست‌وجو کنید.</p></div>
              : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div><nav aria-label="صفحات نتایج جست‌وجو" className="mt-8 flex items-center justify-center gap-3"><Link href={pageHref(filters, Math.max(1, filters.page - 1))} aria-disabled={filters.page === 1} className={`grid min-h-11 place-items-center rounded-lg border border-border px-4 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring ${filters.page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}>قبلی</Link><span className="text-sm text-muted-foreground">صفحه {filters.page} از {totalPages}</span><Link href={pageHref(filters, Math.min(totalPages, filters.page + 1))} aria-disabled={filters.page >= totalPages} className={`grid min-h-11 place-items-center rounded-lg border border-border px-4 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring ${filters.page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}>بعدی</Link></nav></>}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { ProductSearch } from "@/features/products/components/product-search";
import type { ProductSearchFilters, ProductSort } from "@/features/products/types/product";

export const metadata: Metadata = {
  title: "محصولات",
  description: "مشاهده و جست‌وجوی محصولات لوازم کمپ و کوه‌نوردی زریوان.",
};

function positiveNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const isDealsPage = params.discount === "true";
  const categoryId = positiveNumber(params.category);
  const productBrandId = positiveNumber(params.productBrandId);
  const minPrice = positiveNumber(params.minPrice);
  const maxPrice = positiveNumber(params.maxPrice);
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const requestedSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: ProductSort = requestedSort === "newest" || requestedSort === "priceAsc" || requestedSort === "priceDesc"
    ? requestedSort
    : params.idDec === "true" ? "newest" : params.priceDec === "true" ? "priceDesc" : "priceAsc";
  const filters: ProductSearchFilters = {
    pageSize: 12,
    hasDiscount: params.discount === "true",
    ...(params.available === "true" ? { isAvailable: true } : {}),
    ...(params.available === "false" ? { isAvailable: false } : {}),
    ...(q?.trim() ? { name: q.trim().slice(0, 100) } : {}),
    ...(categoryId && Number.isSafeInteger(categoryId) ? { categoryId } : {}),
    ...(productBrandId && Number.isSafeInteger(productBrandId) ? { productBrandId } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(sort === "priceDesc" ? { isPriceDec: true } : {}),
    ...(sort === "newest" ? { isIdDec: true } : {}),
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="relative isolate w-full flex-1 px-0 py-4 sm:py-6 lg:px-[50px]">
        <h1 className="sr-only">محصولات زریوان</h1>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-45" />
        <ProductSearch key={JSON.stringify({ filters, sort })} filters={filters} sort={sort} showFilters={!isDealsPage} />
      </main>
      <StoreFooter />
    </div>
  );
}

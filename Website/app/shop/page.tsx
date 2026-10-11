import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { ProductSearch } from "@/features/products/components/product-search";
import type { ProductSearchFilters, ProductSort } from "@/features/products/types/product";

export const metadata: Metadata = {
  title: "محصولات",
  description: "مشاهده و جست‌وجوی محصولات لوازم کمپ و کوه‌نوردی زریوان.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (!/^[1-9]\d*$/.test(raw)) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

function cleanText(value: string | undefined, maxLength: number) {
  const cleaned = value?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
  return cleaned || undefined;
}

function originalSearchParams(params: Record<string, string | string[] | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) result.append(key, item);
    } else if (value !== undefined) {
      result.append(key, value);
    }
  }
  return result;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const categoryId = positiveNumber(params.category);
  const productBrandId = positiveNumber(params.productBrandId);
  const minPrice = positiveNumber(params.minPrice);
  const maxPrice = positiveNumber(params.maxPrice);
  const q = cleanText(firstValue(params.q), 100);
  const requestedSort = firstValue(params.sort);
  const sort: ProductSort = requestedSort === "newest" || requestedSort === "priceAsc" || requestedSort === "priceDesc"
    ? requestedSort
    : params.idDec === "true" ? "newest" : params.priceDec === "true" ? "priceDesc" : "priceAsc";

  const canonicalParams = new URLSearchParams();
  if (q) canonicalParams.set("q", q);
  if (categoryId) canonicalParams.set("category", String(categoryId));
  if (productBrandId) canonicalParams.set("productBrandId", String(productBrandId));
  if (params.available === "true" || params.available === "false") canonicalParams.set("available", params.available);
  if (params.discount === "true") canonicalParams.set("discount", "true");
  if (minPrice !== undefined) canonicalParams.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) canonicalParams.set("maxPrice", String(maxPrice));
  if (sort !== "priceAsc") canonicalParams.set("sort", sort);

  if (originalSearchParams(params).toString() !== canonicalParams.toString()) {
    redirect(canonicalParams.size ? `/shop?${canonicalParams.toString()}` : "/shop");
  }

  const filters: ProductSearchFilters = {
    pageSize: 12,
    hasDiscount: params.discount === "true",
    ...(params.available === "true" ? { isAvailable: true } : {}),
    ...(params.available === "false" ? { isAvailable: false } : {}),
    ...(q ? { name: q } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(productBrandId ? { productBrandId } : {}),
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
        <ProductSearch key={JSON.stringify({ filters, sort })} filters={filters} sort={sort} />
      </main>
      <StoreFooter />
    </div>
  );
}

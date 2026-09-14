import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { ProductSearch } from "@/features/products/components/product-search";
import type { ProductSearchInput } from "@/features/products/types/product";

export const metadata: Metadata = {
  title: "جست‌وجوی محصولات | فروشگاه",
  description: "جست‌وجو و فیلتر محصولات فروشگاه بر اساس دسته‌بندی، قیمت و تخفیف.",
};

function positiveNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(positiveNumber(params.page) ?? 1));
  const categoryId = positiveNumber(params.category);
  const minPrice = positiveNumber(params.minPrice);
  const maxPrice = positiveNumber(params.maxPrice);
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const filters: ProductSearchInput = {
    page,
    pageSize: 12,
    hasDiscount: params.discount === "true",
    ...(q?.trim() ? { name: q.trim().slice(0, 100) } : {}),
    ...(categoryId && Number.isSafeInteger(categoryId) ? { categoryId } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
  };

  return <div className="min-h-dvh bg-background text-foreground"><StoreHeader /><main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-12"><div className="mb-8"><p className="text-xs font-black tracking-[0.15em] text-primary">فهرست محصولات</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">محصول مورد علاقه خود را پیدا کنید</h1></div><ProductSearch filters={filters} /></main></div>;
}

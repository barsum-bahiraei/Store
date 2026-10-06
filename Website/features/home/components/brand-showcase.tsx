"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useProductBrands } from "@/features/products/hooks/use-products";
import { getProductImageUrl } from "@/features/products/utils/product";

export function BrandShowcase() {
  const { data: brands = [], isPending, isError } = useProductBrands();
  const brandsScrollerRef = useRef<HTMLDivElement>(null);

  function scrollBrands(amount: number) {
    brandsScrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (isError || (!isPending && brands.length === 0)) return null;

  return (
    <section aria-labelledby="brand-showcase-title" className="bg-background px-4 pb-10 pt-2 text-foreground sm:px-8 sm:pb-14 lg:px-12">
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="brand-showcase-title" className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">برندهای منتخب</h2>
        </div>
        {isPending ? (
          <div role="status" className="flex gap-3 overflow-hidden">
            <span className="sr-only">در حال بارگذاری برندها</span>
            {Array.from({ length: 6 }, (_, index) => <span key={index} className="h-28 min-w-36 flex-1 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />)}
          </div>
        ) : (
          <div className="relative px-0 sm:px-14">
            <button type="button" onClick={() => scrollBrands(320)} aria-label="برندهای قبلی" className="absolute right-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span></button>
            <button type="button" onClick={() => scrollBrands(-320)} aria-label="برندهای بعدی" className="absolute left-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></button>
            <div ref={brandsScrollerRef} className="flex gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brands.map((brand) => {
                const imageUrl = getProductImageUrl(brand.image?.url);
                return (
                  <Link key={brand.id} href={`/shop?productBrandId=${brand.id}`} className="group flex min-h-28 min-w-36 flex-1 items-center justify-center rounded-2xl border border-primary/20 bg-surface p-4 shadow-sm shadow-primary-shadow outline-none transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring">
                    {imageUrl ? <Image src={imageUrl} alt={`لوگوی ${brand.name}`} width={150} height={64} unoptimized className="h-12 w-full object-contain grayscale transition-[filter,transform] duration-300 group-hover:scale-105 group-hover:grayscale-0" /> : <span className="text-center text-sm font-black text-primary">{brand.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

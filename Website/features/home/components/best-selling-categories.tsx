"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBestSellingCategories, useCategories } from "@/features/categories/hooks/use-categories";
import type { Category } from "@/features/categories/types/category";

const categoryImages: Record<number, string> = {
  1: "/images/home/tent-category-promo.png",
  2: "/images/home/tent-category-promo.png",
  5: "/images/home/categories/6-sleeping-bag.png",
  6: "/images/home/categories/6-sleeping-bag.png",
  14: "/images/home/camp-furniture-category-promo.png",
  15: "/images/home/categories/16-backpack.png",
  16: "/images/home/categories/16-backpack.png",
  20: "/images/home/categories/20-hydration.png",
  23: "/images/home/categories/28-cookware.png",
  28: "/images/home/categories/28-cookware.png",
  35: "/images/home/categories/41-climbing-tools.png",
  40: "/images/home/categories/41-climbing-tools.png",
  41: "/images/home/categories/41-climbing-tools.png",
  43: "/images/home/categories/43-rope.png",
  44: "/images/home/categories/44-carabiner.png",
  51: "/images/home/categories/52-clothing.png",
  52: "/images/home/categories/52-clothing.png",
  53: "/images/home/categories/52-clothing.png",
  60: "/images/home/categories/60-footwear.png",
  65: "/images/home/categories/65-clothing-accessories.png",
  71: "/images/home/categories/71-accessories.png",
  72: "/images/home/categories/71-accessories.png",
  78: "/images/home/categories/81-camping-knife.png",
  81: "/images/home/categories/81-camping-knife.png",
};

const fallbackImage = "/images/header-forest-mountains.png";

function collectCategoryImages(categories: Category[], inheritedImage = fallbackImage): Record<number, string> {
  return categories.reduce<Record<number, string>>((images, category) => {
    const image = categoryImages[category.id] ?? inheritedImage;
    images[category.id] = image;
    Object.assign(images, collectCategoryImages(category.children, image));
    return images;
  }, {});
}

function CategoryImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="absolute inset-0 grid place-content-center gap-2 p-3 text-center text-primary"><span className="material-symbols-rounded text-3xl" aria-hidden="true">category</span><span className="text-sm font-bold">{name}</span></span>
  ) : (
    <Image src={src} alt={`دسته‌بندی ${name}`} fill sizes="(max-width: 639px) 9rem, 12rem" onError={() => setFailed(true)} className="object-cover transition-transform duration-300 group-hover:scale-105" />
  );
}

export function BestSellingCategories() {
  const { data: categories = [], isPending, isError } = useBestSellingCategories();
  const { data: categoryTree } = useCategories();
  const resolvedImages = useMemo(() => collectCategoryImages(categoryTree ?? []), [categoryTree]);
  const categoriesScrollerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const scroller = categoriesScrollerRef.current;
    if (!scroller || isPending) return;

    const updateOverflow = () => {
      setHasOverflow(scroller.scrollWidth > scroller.clientWidth + 1);
    };

    updateOverflow();
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(scroller);

    return () => resizeObserver.disconnect();
  }, [categories.length, isPending]);

  function scrollCategories(amount: number) {
    categoriesScrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (isError || (!isPending && categories.length === 0)) return null;

  return (
    <section aria-labelledby="best-selling-categories-title" className="bg-background px-4 pb-10 pt-2 text-foreground sm:px-8 sm:pb-14 lg:px-12">
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="best-selling-categories-title" className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">دسته‌بندی‌های محبوب</h2>
        </div>
        {isPending ? (
          <div role="status" className="flex gap-3 overflow-hidden">
            <span className="sr-only">در حال بارگذاری دسته‌بندی‌های محبوب</span>
            {Array.from({ length: 6 }, (_, index) => <span key={index} className="h-28 min-w-36 flex-1 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />)}
          </div>
        ) : (
          <div className="relative">
            {hasOverflow ? <button type="button" onClick={() => scrollCategories(320)} aria-label="دسته‌بندی‌های محبوب قبلی" className="absolute right-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span></button> : null}
            {hasOverflow ? <button type="button" onClick={() => scrollCategories(-320)} aria-label="دسته‌بندی‌های محبوب بعدی" className="absolute left-0 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></button> : null}
            <div ref={categoriesScrollerRef} className="flex gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => {
                const categoryName = category.name?.trim() || "دسته‌بندی";
                const image = categoryImages[category.id] ?? resolvedImages[category.id] ?? fallbackImage;
                return (
                  <Link key={category.id} href={`/shop?category=${category.id}`} aria-label={`مشاهده محصولات ${categoryName}`} className="group relative min-h-28 min-w-36 flex-1 overflow-hidden rounded-2xl border border-primary/20 bg-surface shadow-sm shadow-primary-shadow outline-none transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring">
                    <CategoryImage key={image} src={image} name={categoryName} />
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

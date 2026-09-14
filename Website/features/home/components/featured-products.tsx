"use client";

import Link from "next/link";
import { useRef } from "react";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { ProductCard } from "@/features/products/components/product-card";
import { useProductSearch } from "@/features/products/hooks/use-products";

export function FeaturedProducts() {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const { data, isPending, isError, isFetching, refetch } = useProductSearch({ page: 1, pageSize: 10, hasDiscount: false });

  return (
    <section aria-labelledby="featured-products-title" className="bg-background px-4 py-10 text-foreground sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div><p className="text-xs font-black tracking-[0.15em] text-primary">گشت‌وگذار در فروشگاه</p><h2 id="featured-products-title" className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">جدیدترین محصولات</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">محصولات واقعی عرضه‌شده توسط فروشندگان.</p></div>
          <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => swiperRef.current?.slidePrev()} aria-label="محصولات قبلی" className="hidden size-11 place-items-center rounded-full border border-border outline-none hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span></button><button type="button" onClick={() => swiperRef.current?.slideNext()} aria-label="محصولات بعدی" className="hidden size-11 place-items-center rounded-full border border-border outline-none hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:grid"><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></button><Link href="/search" className="hidden min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-black text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:flex">مشاهده همه<span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></Link></div>
        </div>
        {isPending ? <div role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><span className="sr-only">در حال بارگذاری محصولات</span>{Array.from({ length: 5 }, (_, index) => <span key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>
          : isError ? <div role="alert" className="rounded-xl border border-border bg-surface p-6"><p className="text-error">بارگذاری محصولات انجام نشد.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-3 min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">{isFetching ? "در حال بارگذاری…" : "تلاش دوباره"}</button></div>
            : data.items.length === 0 ? <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">هنوز محصولی برای نمایش وجود ندارد.</div>
              : <div className="overflow-hidden"><Swiper dir="rtl" modules={[A11y, Keyboard]} onSwiper={(swiper) => { swiperRef.current = swiper; }} keyboard={{ enabled: true }} spaceBetween={16} slidesPerView={1.2} breakpoints={{ 540: { slidesPerView: 2.2 }, 768: { slidesPerView: 3.2 }, 1100: { slidesPerView: 5 } }} a11y={{ prevSlideMessage: "محصولات قبلی", nextSlideMessage: "محصولات بعدی" }}>{data.items.map((product) => <SwiperSlide key={product.id} className="h-auto"> <ProductCard product={product} /></SwiperSlide>)}</Swiper></div>}
      </div>
    </section>
  );
}

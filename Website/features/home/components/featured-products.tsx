"use client";

import Image from "next/image";
import { useRef } from "react";
import { useCart, useCartItemActions } from "@/features/cart/hooks/use-cart";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { featuredProducts, type FeaturedProduct } from "../data/home-content";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function ProductCard({ product }: { product: FeaturedProduct }) {
  const { data: items, guestItems, isAuthenticated } = useCart();
  const { change, isPending, error } = useCartItemActions(product.id);
  const quantity = isAuthenticated ? items?.find((item) => item.product.id === product.id)?.productCount ?? 0
    : guestItems.find((item) => item.productId === product.id)?.count ?? 0;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="group h-full border-r border-border pr-3 text-foreground sm:pr-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-transparent transition-[box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary-shadow group-hover:ring-border group-focus-within:ring-2 group-focus-within:ring-ring">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 539px) 58vw, (max-width: 1099px) 30vw, 19vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        {discount && <span className="absolute left-2.5 top-2.5 rounded-lg bg-accent px-2 py-1 text-xs font-black text-accent-foreground">-{discount}%</span>}
        <button
          type="button"
          disabled={isPending}
          aria-busy={isPending}
          onClick={() => change("increase")}
          className="absolute inset-x-2.5 bottom-2.5 flex min-h-11 translate-y-2 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-black text-primary-foreground opacity-0 shadow-md outline-none transition-[opacity,transform,background-color] duration-200 hover:bg-primary-hover focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70 max-sm:translate-y-0 max-sm:opacity-100"
        >
          <span className="material-symbols-rounded text-lg" aria-hidden="true">add_shopping_cart</span>
          <span aria-live="polite">{isPending ? "Adding…" : quantity > 0 ? `Add one more (${quantity})` : "Add to cart"}</span>
        </button>
      </div>
      <div className="px-1 pb-2 pt-3">
        {error && <p role="alert" className="mb-2 text-xs text-error">{error.message}</p>}
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-black text-primary">{priceFormatter.format(product.price)}</span>
          {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{priceFormatter.format(product.originalPrice)}</span>}
        </div>
      </div>
    </article>
  );
}

export function FeaturedProducts() {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <section aria-labelledby="featured-products-title" className="overflow-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Chosen for you</p>
            <h2 id="featured-products-title" className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Trending right now</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Popular picks, all in one place.</p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button type="button" onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous products" className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></button>
            <button type="button" onClick={() => swiperRef.current?.slideNext()} aria-label="Next products" className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span></button>
          </div>
        </div>

        <Swiper
          modules={[A11y, Keyboard]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          keyboard={{ enabled: true }}
          spaceBetween={12}
          slidesPerView={1.45}
          breakpoints={{
            540: { slidesPerView: 2.3, spaceBetween: 14 },
            768: { slidesPerView: 3.4, spaceBetween: 16 },
            1100: { slidesPerView: 5, spaceBetween: 18 },
          }}
          a11y={{ prevSlideMessage: "Previous products", nextSlideMessage: "Next products" }}
          className="!overflow-hidden"
        >
          {featuredProducts.map((product) => <SwiperSlide key={product.id} className="h-auto"><ProductCard product={product} /></SwiperSlide>)}
        </Swiper>
      </div>
    </section>
  );
}

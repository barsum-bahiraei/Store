"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { A11y, FreeMode, Keyboard, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { useCart, useCartItemActions } from "@/features/cart/hooks/use-cart";
import { useProductDetail } from "../hooks/use-products";
import { getProductImageUrl, getSalePrice, formatToman } from "../utils/product";
import { ProductComments } from "./product-comments";

const units = ["g", "kg", "m"];

export function ProductDetailContent({ productId }: { productId: number }) {
  const { data: product, isPending, isError, isFetching, refetch } = useProductDetail(productId);
  const { data: cartItems, guestItems, isAuthenticated } = useCart();
  const { change, isPending: isAdding, error: cartError } = useCartItemActions(productId, product?.name);
  const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);

  if (!Number.isSafeInteger(productId) || productId < 1) return <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center"><h1 className="text-2xl font-black">محصول نامعتبر</h1><Link href="/search" className="mt-4 inline-flex min-h-11 items-center text-primary">مرور محصولات</Link></div>;
  if (isPending) return <div role="status" className="grid gap-8 lg:grid-cols-2"><span className="sr-only">در حال بارگذاری محصول</span><span className="aspect-square animate-pulse rounded-xl bg-muted motion-reduce:animate-none" /><div className="space-y-4">{[32, 20, 20, 40].map((height, index) => <span key={index} style={{ height }} className="block animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div></div>;
  if (isError || !product) return <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-error" aria-hidden="true">error</span><h1 className="mt-3 text-2xl font-black">محصول در دسترس نیست</h1><p className="mt-2 text-muted-foreground">بارگذاری این محصول انجام نشد.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60">{isFetching ? "در حال بارگذاری…" : "تلاش دوباره"}</button></div>;

  const images = product.images.map((image) => ({ ...image, resolvedUrl: getProductImageUrl(image.url) })).filter((image) => image.resolvedUrl).sort((left, right) => Number(right.isMain) - Number(left.isMain));
  const quantity = isAuthenticated ? cartItems?.find((item) => item.product.id === product.id)?.productCount ?? 0 : guestItems.find((item) => item.productId === product.id)?.count ?? 0;
  const salePrice = getSalePrice(product.price, product.discount);
  const averageRating = product.comments.reduce((total, comment) => total + (comment.rating ?? 0), 0) / (product.comments.filter((comment) => comment.rating).length || 1);

  return (
    <>
      <nav aria-label="مسیر دسته‌بندی" className="mb-6 overflow-x-auto">
        <ol className="flex min-w-max items-center gap-1 text-sm text-muted-foreground">
          {product.categories.map((category, index) => (
            <li key={category.id} className="flex items-center gap-1">
              {index > 0 && <span className="material-symbols-rounded text-base" aria-hidden="true">chevron_left</span>}
              <Link
                href={`/search?category=${category.id}`}
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-label="تصاویر محصول">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <Swiper
              modules={[A11y, Keyboard, Thumbs]}
              onSwiper={setMainSwiper}
              spaceBetween={10}
              keyboard={{ enabled: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : undefined }}
              a11y={{ prevSlideMessage: "تصویر قبلی", nextSlideMessage: "تصویر بعدی" }}
              className="[&_.swiper-slide]:transition-opacity [&_.swiper-slide]:duration-300"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {image.resolvedUrl ? (
                      <Image
                        src={image.resolvedUrl}
                        alt={image.name || product.name}
                        fill
                        priority={index === 0}
                        unoptimized
                        sizes="(max-width: 1023px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-muted-foreground">
                        <span className="material-symbols-rounded text-6xl" aria-hidden="true">image_not_supported</span>
                        <span className="sr-only">تصویری از محصول موجود نیست</span>
                      </span>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {images.length > 1 && (
            <Swiper
              modules={[FreeMode, Keyboard]}
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={{ enabled: true, sticky: true }}
              keyboard={{ enabled: true }}
              watchSlidesProgress
              className="mt-3 [&_.swiper-slide]:!h-20 [&_.swiper-slide]:!w-20 [&_.swiper-slide]:!opacity-60 [&_.swiper-slide-thumb-active]:!opacity-100 [&_.swiper-slide-thumb-active_button]:border-primary"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                  <button
                    type="button"
                    onClick={() => mainSwiper?.slideTo(index)}
                    aria-label={`مشاهده تصویر ${index + 1}`}
                    className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted outline-none transition-colors duration-200 hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image src={image.resolvedUrl!} alt="" fill unoptimized sizes="15vw" className="object-cover" />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        <section aria-labelledby="product-title" className="self-center">
          <h1 id="product-title" className="text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-bold"><span className="material-symbols-rounded text-warning" aria-hidden="true">star</span>{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{product.comments.length} نظر</span>
            <span className="text-sm text-muted-foreground">فروشنده: {product.seller.name}</span>
          </div>
          {product.shortDescription && <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-muted-foreground">{product.shortDescription}</p>}
          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-primary">{formatToman(salePrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatToman(product.price)}</span>
                <span className="rounded-lg bg-accent px-2 py-1 text-xs font-black text-accent-foreground">تخفیف {formatToman(product.discount)}</span>
              </>
            )}
          </div>
          <div className="mt-7 flex items-center gap-3">
            <button type="button" onClick={() => change("decrease")} disabled={isAdding || quantity === 0} aria-label="کاهش تعداد" className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-40">
              <span className="material-symbols-rounded" aria-hidden="true">remove</span>
            </button>
            <span className="min-w-[3rem] text-center text-lg font-black tabular-nums" aria-live="polite">{quantity}</span>
            <button type="button" onClick={() => change("increase")} disabled={isAdding} aria-label="افزودن به سبد" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              <span className="material-symbols-rounded" aria-hidden="true">add_shopping_cart</span>
              {isAdding ? "در حال افزودن…" : quantity > 0 ? "افزودن به سبد" : "افزودن به سبد"}
            </button>
          </div>
          {cartError && <p role="alert" className="mt-2 text-sm text-error">{cartError.message}</p>}
        </section>
      </div>

      {product.attributes.length > 0 && (
        <section aria-labelledby="specifications-title" className="mt-10 border-t border-border pt-8">
          <h2 id="specifications-title" className="text-2xl font-black">مشخصات فنی</h2>
          <dl className="mt-5 grid overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-2">
            {product.attributes.map((attribute) => (
              <div key={attribute.id} className="flex justify-between gap-4 border-b border-border p-4 last:border-b-0 sm:odd:border-r">
                <dt className="text-sm text-muted-foreground">{attribute.attributeTitle ?? "ویژگی"}</dt>
                <dd className="text-right text-sm font-bold">{attribute.value}{units[attribute.attributeUnit] ? ` ${units[attribute.attributeUnit]}` : ""}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {product.longDescription && (
        <section aria-labelledby="description-title" className="mt-10 border-t border-border pt-8">
          <h2 id="description-title" className="text-2xl font-black">توضیحات محصول</h2>
          <div className="mt-5 max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.longDescription }} />
        </section>
      )}

      <ProductComments productId={product.id} comments={product.comments} />
    </>
  );
}

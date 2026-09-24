"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { A11y, FreeMode, Keyboard, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { useCart, useCartItemActions } from "@/features/cart/hooks/use-cart";
import { useUserProfile } from "@/features/auth/hooks/use-account";
import { isUserRole } from "@/features/auth/types/account";
import { useProductDetail } from "../hooks/use-products";
import { buildVariantGroups, createDefaultVariantSelection, formatProductAttributeValue, formatToman, formatVariantLabel, getProductAttributeUnitLabel, getProductImageUrl, getSalePrice, getVariantOptionStatus, matchVariantBySelection } from "../utils/product";
import { ProductCard } from "./product-card";
import { ProductComments } from "./product-comments";

export function ProductDetailContent({ productId }: { productId: number }) {
  const { data: product, isPending, isError, isFetching, refetch } = useProductDetail(productId);
  const { data: cartItems, guestItems, isAuthenticated } = useCart();
  const { data: userProfile } = useUserProfile();
  const canPurchase = isUserRole(userProfile);
  const blockedByRole = isAuthenticated && !canPurchase;
  const [userSelection, setUserSelection] = useState<Record<string, string> | null>(null);
  const optionGroups = useMemo(() => (product ? buildVariantGroups(product.variants) : []), [product]);
  const defaultSelection = useMemo(
    () => (product ? createDefaultVariantSelection(product.variants, optionGroups) : {}),
    [product, optionGroups],
  );
  const selection = userSelection ?? defaultSelection;

  function selectVariantOption(size: string, option: string) {
    setUserSelection((current) => ({ ...(current ?? defaultSelection), [size]: option }));
  }

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    if (product.variants.length === 1) return product.variants[0];
    if (optionGroups.length === 0) return undefined;
    if (optionGroups.some((group) => selection[group.size] == null)) return undefined;
    return matchVariantBySelection(product.variants, selection);
  }, [product, optionGroups, selection]);

  const effectiveVariantId = selectedVariant?.id ?? null;
  const serverItem = isAuthenticated && effectiveVariantId != null
    ? cartItems?.find((item) => item.product.id === productId && item.productVariantId === effectiveVariantId)
    : undefined;
  const { change, productCount: serverQuantity, isPending: isAdding, error: cartError } = useCartItemActions({
    productId,
    productVariantId: effectiveVariantId ?? undefined,
    productName: product?.name,
    variantName: selectedVariant ? formatVariantLabel(selectedVariant.values) : undefined,
    cartItemId: serverItem?.id,
    productCount: serverItem?.productCount,
  });
  const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);

  if (!Number.isSafeInteger(productId) || productId < 1) return <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center"><h1 className="text-2xl font-black">محصول نامعتبر</h1><Link href="/search" className="mt-4 inline-flex min-h-11 items-center text-primary">مرور محصولات</Link></div>;
  if (isPending) return <div role="status" className="grid gap-8 lg:grid-cols-2"><span className="sr-only">در حال بارگذاری محصول</span><span className="aspect-square animate-pulse rounded-xl bg-muted motion-reduce:animate-none" /><div className="space-y-4">{[32, 20, 20, 40].map((height, index) => <span key={index} style={{ height }} className="block animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div></div>;
  if (isError || !product) return <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-error" aria-hidden="true">error</span><h1 className="mt-3 text-2xl font-black">محصول در دسترس نیست</h1><p className="mt-2 text-muted-foreground">بارگذاری این محصول انجام نشد.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60">{isFetching ? "در حال بارگذاری…" : "تلاش دوباره"}</button></div>;

  const images = product.images.map((image) => ({ ...image, resolvedUrl: getProductImageUrl(image.url) })).filter((image) => image.resolvedUrl).sort((left, right) => Number(right.isMain) - Number(left.isMain));
  const brandImageUrl = getProductImageUrl(product.brand?.image?.url);
  const quantity = isAuthenticated
    ? serverQuantity
    : effectiveVariantId != null
      ? guestItems.find((item) => item.productId === product.id && item.productVariantId === effectiveVariantId)?.count ?? 0
      : 0;
  const basePrice = selectedVariant?.price ?? product.price;
  const salePrice = getSalePrice(basePrice, product.discount);
  const stock = selectedVariant?.stock ?? 0;
  const addToCartDisabled = isAdding || selectedVariant == null || stock <= 0 || quantity >= stock;
  const needsSelection = optionGroups.length > 0 && selectedVariant == null;
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
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black ${product.isAvailable ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              <span className="material-symbols-rounded text-sm" aria-hidden="true">{product.isAvailable ? "check_circle" : "cancel"}</span>
              {product.isAvailable ? "موجود" : "ناموجود"}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold"><span className="material-symbols-rounded text-warning" aria-hidden="true">star</span>{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{product.comments.length} نظر</span>
            <span className="text-sm text-muted-foreground">فروشنده: {product.seller.name}</span>
          </div>
          {product.brand && (
            <div className="mt-5 flex w-fit items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                {brandImageUrl ? (
                  <Image src={brandImageUrl} alt={`لوگوی ${product.brand.name}`} fill unoptimized sizes="3rem" className="object-contain p-1" />
                ) : (
                  <span className="material-symbols-rounded text-2xl text-muted-foreground" aria-hidden="true">branding_watermark</span>
                )}
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">برند</span>
                <span className="font-black">{product.brand.name}</span>
              </div>
            </div>
          )}
          {product.shortDescription && <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-muted-foreground">{product.shortDescription}</p>}
          {optionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              {optionGroups.map((group, groupIndex) => {
                const groupId = `variant-group-${groupIndex}`;
                return (
                  <div key={group.size} aria-labelledby={groupId}>
                    <h2 id={groupId} className="text-sm font-black">انتخاب {group.size}</h2>
                    <div role="radiogroup" aria-labelledby={groupId} className="mt-3 flex flex-wrap gap-3">
                      {group.options.map((option) => {
                        const optionValue = option.name || option.code;
                        const status = getVariantOptionStatus(product.variants, selection, group.size, optionValue);
                        const isSelected = selection[group.size] === optionValue;
                        return (
                          <button
                            key={optionValue}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={status.disabled}
                            onClick={() => selectVariantOption(group.size, optionValue)}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70 ${isSelected ? "border-primary bg-primary/10 text-primary" : status.disabled ? "border-border bg-muted text-muted-foreground" : "border-border bg-surface hover:bg-muted"}`}
                          >
                            <span>{optionValue}</span>
                            {status.outOfStock && <span className="text-xs font-black text-error">ناموجود</span>}
                            {isSelected && <span className="material-symbols-rounded text-lg" aria-hidden="true">check</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {needsSelection && <p role="alert" className="text-sm text-warning">لطفاً سایز محصول را انتخاب کنید</p>}
            </div>
          )}
          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-primary">{formatToman(salePrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatToman(basePrice)}</span>
                <span className="rounded-lg bg-accent px-2 py-1 text-xs font-black text-accent-foreground">تخفیف {formatToman(product.discount)}</span>
              </>
            )}
          </div>
          {product.isAvailable ? (
            <>
              {blockedByRole ? (
                <div className="mt-7 flex items-center gap-3 rounded-xl border border-border bg-muted p-4">
                  <span className="material-symbols-rounded text-2xl text-muted-foreground" aria-hidden="true">block</span>
                  <span className="text-sm font-bold text-muted-foreground">امکان خرید برای نقش شما فعال نیست.</span>
                </div>
              ) : (
                <div className="mt-7 flex items-center gap-3">
                  <button type="button" onClick={() => change("decrease")} disabled={isAdding || quantity === 0} aria-label="کاهش تعداد" className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-40">
                    <span className="material-symbols-rounded" aria-hidden="true">remove</span>
                  </button><span className="min-w-12 text-center text-lg font-black tabular-nums" aria-live="polite">{quantity.toLocaleString("fa-IR")}</span>
                  <button type="button" onClick={() => change("increase")} disabled={addToCartDisabled} aria-label="افزودن تنوع انتخاب‌شده به سبد" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                    <span className="material-symbols-rounded" aria-hidden="true">add_shopping_cart</span>
                    {isAdding ? "در حال افزودن…" : "افزودن به سبد"}
                  </button>
                </div>
              )}
              {product.variants.length === 0 && <p role="alert" className="mt-2 text-sm text-error">برای این محصول تنوع قابل سفارشی ثبت نشده است.</p>}
              {selectedVariant != null && stock > 0 && quantity >= stock && <p role="status" className="mt-2 text-sm text-warning">حداکثر موجودی این تنوع به سبد اضافه شده است.</p>}
              {cartError && <p role="alert" className="mt-2 text-sm text-error">{cartError.message}</p>}
            </>
          ) : (
            <div className="mt-7 flex items-center gap-3 rounded-xl border border-border bg-muted p-4">
              <span className="material-symbols-rounded text-2xl text-muted-foreground" aria-hidden="true">inventory_2</span>
              <span className="text-sm font-bold text-muted-foreground">این محصول در حال حاضر موجود نیست.</span>
            </div>
          )}
        </section>
      </div>

      {product.attributes.length > 0 && (
        <section aria-labelledby="specifications-title" className="mt-10 border-t border-border pt-8">
          <h2 id="specifications-title" className="text-2xl font-black">مشخصات فنی</h2>
          <dl className="mt-5 grid overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-2">
            {product.attributes.map((attribute) => (
              <div key={attribute.id} className="flex justify-between gap-4 border-b border-border p-4 last:border-b-0 sm:odd:border-r">
                <dt className="text-sm text-muted-foreground">{attribute.attributeTitle ?? "ویژگی"}</dt>
                <dd className="min-w-0 whitespace-pre-wrap break-words text-right text-sm font-bold">
                  {formatProductAttributeValue(attribute.value, attribute.attributeType)}
                  {getProductAttributeUnitLabel(attribute.attributeUnit) && ` ${getProductAttributeUnitLabel(attribute.attributeUnit)}`}
                </dd>
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

      {product.similarProducts.length > 0 && (
        <section aria-labelledby="similar-products-title" className="mt-10 border-t border-border pt-8">
          <h2 id="similar-products-title" className="text-2xl font-black">محصولات مشابه</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {product.similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <ProductComments productId={product.id} comments={product.comments} />
    </>
  );
}

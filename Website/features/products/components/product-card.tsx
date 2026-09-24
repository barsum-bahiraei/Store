"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkButton } from "@/features/bookmarks/components/bookmark-button";
import { useAuthToken, useUserProfile } from "@/features/auth/hooks/use-account";
import { isUserRole } from "@/features/auth/types/account";
import { useCartItemActions } from "@/features/cart/hooks/use-cart";
import type { ProductSearchItem } from "../types/product";
import { getProductImageUrl, getSalePrice, formatToman, formatVariantLabel } from "../utils/product";

export function ProductCard({ product }: { product: ProductSearchItem }) {
  const router = useRouter();
  const token = useAuthToken();
  const { data: userProfile } = useUserProfile();
  const canQuickAdd = !token || isUserRole(userProfile);
  const purchasableVariants = product.variants.filter((variant) => variant.stock > 0);
  const quickBuyVariant = product.isAvailable && purchasableVariants.length === 1 ? purchasableVariants[0] : undefined;
  const { change, isPending, error } = useCartItemActions({
    productId: product.id,
    productVariantId: quickBuyVariant?.id,
    productName: product.name,
    variantName: quickBuyVariant ? formatVariantLabel(quickBuyVariant.values) : undefined,
  });
  const imageUrl = getProductImageUrl(product.image?.url);
  const salePrice = getSalePrice(product.price, product.discount);

  function handleQuickBuy() {
    if (!product.isAvailable || isPending) return;
    if (quickBuyVariant && canQuickAdd) {
      change("increase");
      return;
    }
    router.push(`/products/${product.id}`);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-foreground transition-shadow hover:shadow-lg hover:shadow-primary-shadow focus-within:ring-2 focus-within:ring-ring">
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-muted outline-none">
        {imageUrl ? <Image src={imageUrl} alt={product.image?.name || product.name} fill unoptimized sizes="(max-width: 639px) 80vw, (max-width: 1023px) 40vw, 22vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="grid h-full place-items-center text-muted-foreground"><span className="material-symbols-rounded text-5xl" aria-hidden="true">image_not_supported</span><span className="sr-only">تصویری موجود نیست</span></span>}
        {product.discount > 0 && <span className="absolute right-3 top-3 rounded-lg bg-accent px-2 py-1 text-xs font-black text-accent-foreground">تخفیف {formatToman(product.discount)}</span>}
        {!product.isAvailable && <span className="absolute left-3 top-3 rounded-lg bg-error/10 px-2 py-1 text-xs font-black text-error">ناموجود</span>}
        <BookmarkButton productId={product.id} productName={product.name} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.categoryTitle}</p>
        <Link href={`/products/${product.id}`} className="mt-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><h3 className="line-clamp-2 text-base font-black leading-6 hover:text-primary">{product.name}</h3></Link>
        {product.shortDescription && <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{product.shortDescription}</p>}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
             <div><span className="font-black text-primary">{formatToman(salePrice)}</span>{product.discount > 0 && <span className="ml-2 text-xs text-muted-foreground line-through">{formatToman(product.price)}</span>}</div>
             <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"><span className="material-symbols-rounded text-base text-warning" aria-hidden="true">star</span>{product.averageRating.toFixed(1)}</span>
           </div>
          <button
            type="button"
            onClick={handleQuickBuy}
            disabled={!product.isAvailable || isPending}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-surface text-sm font-black text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:opacity-60"
          >
            <span className={`material-symbols-rounded text-xl ${isPending ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true">{isPending ? "progress_activity" : "shopping_cart"}</span>
            {isPending ? "در حال افزودن…" : "خرید سریع"}
          </button>
          {error && <p role="alert" className="mt-2 text-xs text-error">{error.message}</p>}
        </div>
      </div>
    </article>
  );
}

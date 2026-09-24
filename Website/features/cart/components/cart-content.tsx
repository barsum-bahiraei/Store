"use client";

import Link from "next/link";
import { useUserProfile } from "@/features/auth/hooks/use-account";
import { isUserRole } from "@/features/auth/types/account";
import { formatToman, formatVariantLabel, getSalePrice } from "@/features/products/utils/product";
import { useCart } from "../hooks/use-cart";
import { CartItemControls } from "./cart-item-controls";

type GuestCartRow = {
  id: number;
  productCount: number;
  productVariantId: number;
  variantName?: string;
  product: { id: number; name: string };
};

export function CartContent() {
  const { data: serverItems = [], guestItems, isAuthenticated, isPending, isError, isFetching, refetch } = useCart();
  const { data: userProfile } = useUserProfile();
  const canPurchase = isUserRole(userProfile);
  const items: Array<GuestCartRow | (typeof serverItems)[number]> = isAuthenticated
    ? serverItems
    : guestItems.map((item) => ({
      id: -item.productVariantId,
      productCount: item.count,
      productVariantId: item.productVariantId,
      variantName: item.variantName,
      product: { id: item.productId, name: item.name ?? `محصول شماره ${item.productId}` },
    }));
  const linkClass = "inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (isAuthenticated && isPending) {
    return <div role="status" className="space-y-4"><span className="sr-only">در حال بارگذاری سبد خرید</span>{[0, 1, 2].map((id) => <div key={id} className="h-36 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>;
  }

  if (isAuthenticated && isError) {
    return <div role="alert" className="space-y-4 rounded-xl border border-border bg-surface p-6"><p className="text-error">بارگذاری سبد خرید انجام نشد. لطفاً دوباره تلاش کنید.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className={`${linkClass} disabled:opacity-50`}>{isFetching ? "در حال بارگذاری…" : "تلاش دوباره"}</button></div>;
  }

  if (items.length === 0) {
    return <div className="space-y-4 rounded-xl border border-border bg-surface p-6"><h2 className="text-xl font-bold">سبد خرید خالی است</h2><p className="text-muted-foreground">محصولات ما را مرور کنید و مورد علاقه‌های خود را اضافه کنید.</p></div>;
  }

  return (
    <section aria-label="سبد خرید" className="space-y-4">
      {!isAuthenticated && <div className="space-y-3 rounded-xl border border-border bg-surface p-4"><p className="text-sm leading-6 text-muted-foreground">سبد خرید شما در این مرورگر ذخیره شده است. وقتی آماده بودید، وارد شوید تا محصولات و تعدادها به حساب شما منتقل شوند.</p><Link href="/login" className={linkClass}>ورود و همگام‌سازی سبد</Link></div>}
      <p className="text-sm text-muted-foreground" aria-live="polite">{items.reduce((total, item) => total + item.productCount, 0)} کالا در سبد خرید شما</p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4 sm:px-6">
        {items.map((item) => {
          const variant = "variant" in item ? item.variant : undefined;
          const variantLabel = variant ? formatVariantLabel(variant.values) : "variantName" in item ? item.variantName : undefined;
          const discount = "price" in item.product ? item.product.discount : 0;
          const rawPrice = variant?.price ?? ("price" in item.product ? item.product.price : undefined);
          const unitPrice = rawPrice != null ? getSalePrice(rawPrice, discount) : undefined;
          const stock = variant?.stock;
          return (
            <li key={item.id} className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold">{item.product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">محصول شماره {item.product.id}{variantLabel ? `، ${variantLabel}` : ""}</p>
                {stock != null && (
                  <p className={`mt-1 text-xs font-bold ${stock === 0 ? "text-error" : "text-muted-foreground"}`}>
                    {stock === 0 ? "ناموجود" : `موجودی: ${stock.toLocaleString("fa-IR")}`}
                  </p>
                )}
                {unitPrice != null && (
                  <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="font-black text-primary">{formatToman(unitPrice)}</span>
                    {discount > 0 && rawPrice != null && <span className="text-xs text-muted-foreground line-through">{formatToman(rawPrice)}</span>}
                    <span className="text-muted-foreground">× {item.productCount.toLocaleString("fa-IR")} = <span className="font-black text-foreground">{formatToman(unitPrice * item.productCount)}</span></span>
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <CartItemControls
                  productId={item.product.id}
                  productName={item.product.name}
                  productCount={item.productCount}
                  productVariantId={item.productVariantId}
                  cartItemId={variant ? item.id : undefined}
                  variant={variant}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {isAuthenticated && canPurchase && <div className="flex justify-end"><Link href="/checkout" className={`${linkClass} gap-2`}><span className="material-symbols-rounded text-xl" aria-hidden="true">shopping_cart_checkout</span>تکمیل خرید</Link></div>}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "../hooks/use-cart";
import { CartItemControls } from "./cart-item-controls";

export function CartContent() {
  const { data: serverItems = [], guestItems, isAuthenticated, isPending, isError, isFetching, refetch } = useCart();
  const items = isAuthenticated ? serverItems : guestItems.map((item) => ({
    id: item.productId,
    productCount: item.count,
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
    return <div className="space-y-4 rounded-xl border border-border bg-surface p-6"><h2 className="text-xl font-bold">سبد خرید خالی است</h2><p className="text-muted-foreground">محصولات ما را مرور کنید و مورد علاقه‌های خود را اضافه کنید.</p><Link href="/search" className={linkClass}>ادامه خرید</Link></div>;
  }

  return (
    <section aria-label="سبد خرید" className="space-y-4">
      {!isAuthenticated && <div className="space-y-3 rounded-xl border border-border bg-surface p-4"><p className="text-sm leading-6 text-muted-foreground">سبد خرید شما در این مرورگر ذخیره شده است. وقتی آماده بودید، وارد شوید تا محصولات و تعدادها به حساب شما منتقل شوند.</p><Link href="/login" className={linkClass}>ورود و همگام‌سازی سبد</Link></div>}
      <p className="text-sm text-muted-foreground" aria-live="polite">{items.reduce((total, item) => total + item.productCount, 0)} کالا در سبد خرید شما</p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4 sm:px-6">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
            <div className="min-w-0"><h2 className="break-words text-lg font-bold">{item.product.name}</h2><p className="mt-1 text-sm text-muted-foreground">محصول شماره {item.product.id}</p></div>
            <div className="shrink-0"><CartItemControls item={item} /></div>
          </li>
        ))}
      </ul>
      <Link href="/search" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring">ادامه خرید</Link>
    </section>
  );
}

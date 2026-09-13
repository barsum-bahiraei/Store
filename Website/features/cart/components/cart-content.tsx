"use client";

import Link from "next/link";
import { useCart } from "../hooks/use-cart";
import { CartItemControls } from "./cart-item-controls";

export function CartContent() {
  const { data: items = [], isAuthenticated, isPending, isError, isFetching, refetch } = useCart();
  const linkClass = "inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (!isAuthenticated) {
    return <div className="space-y-4 rounded-xl border border-border bg-surface p-6"><p className="text-muted-foreground">Sign in to view and manage your shopping cart.</p><Link href="/login" className={linkClass}>Sign in</Link></div>;
  }

  if (isPending) {
    return <div role="status" className="space-y-4"><span className="sr-only">Loading your cart</span>{[0, 1, 2].map((id) => <div key={id} className="h-36 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>;
  }

  if (isError) {
    return <div role="alert" className="space-y-4 rounded-xl border border-border bg-surface p-6"><p className="text-error">Unable to load your cart. Please try again.</p><button type="button" onClick={() => refetch()} disabled={isFetching} className={`${linkClass} disabled:opacity-50`}>{isFetching ? "Loading…" : "Retry"}</button></div>;
  }

  if (items.length === 0) {
    return <div className="space-y-4 rounded-xl border border-border bg-surface p-6"><h2 className="text-xl font-bold">Your cart is empty</h2><p className="text-muted-foreground">Explore our products and add your favorites.</p><Link href="/" className={linkClass}>Continue shopping</Link></div>;
  }

  return (
    <section aria-label="Cart items" className="space-y-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">{items.reduce((total, item) => total + item.productCount, 0)} items in your cart</p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4 sm:px-6">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
            <div className="min-w-0"><h2 className="break-words text-lg font-bold">{item.product.name}</h2><p className="mt-1 text-sm text-muted-foreground">Product #{item.product.id}</p></div>
            <div className="shrink-0"><CartItemControls item={item} /></div>
          </li>
        ))}
      </ul>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring">Continue shopping</Link>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { getProductImageUrl, getSalePrice, formatToman } from "@/features/products/utils/product";
import { useBookmarks } from "../hooks/use-bookmarks";
import { useGuestBookmarkStore } from "../stores/guest-bookmark-store";
import type { BookmarkItem } from "../types/bookmark";

function BookmarkSkeleton() {
  return (
    <div className="grid gap-4" aria-label="در حال بارگذاری علاقه‌مندی‌ها">
      {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-muted" />)}
    </div>
  );
}

function GuestBookmarks() {
  const items = useGuestBookmarkStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">favorite_border</span>
        <p className="mt-4 font-black">لیست علاقه‌مندی‌ها خالی است</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">محصولات مورد علاقه خود را با زدن علامت قلب ذخیره کنید.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item.productId}>
          <Link href={`/products/${item.productId}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
            <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted">
              <span className="material-symbols-rounded text-2xl text-muted-foreground" aria-hidden="true">favorite</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{item.name || `محصول شماره ${item.productId}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">محصول مهمان</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AuthBookmarks() {
  const { data: bookmarks = [], isLoading, isError, error, refetch, isFetching } = useBookmarks();

  if (isLoading) return <BookmarkSkeleton />;

  if (isError) {
    return (
      <div role="alert" className="rounded-xl border border-border bg-surface p-6 text-center">
        <span className="material-symbols-rounded text-4xl text-error" aria-hidden="true">favorite</span>
        <p className="mt-3 font-black">علاقه‌مندی‌ها بارگذاری نشد</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          {isFetching ? "در حال تلاش…" : "تلاش دوباره"}
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">favorite_border</span>
        <p className="mt-4 font-black">لیست علاقه‌مندی‌ها خالی است</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">محصولات مورد علاقه خود را با زدن علامت قلب ذخیره کنید.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkListItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </ul>
  );
}

function BookmarkListItem({ bookmark }: { bookmark: BookmarkItem }) {
  const { product } = bookmark;
  const imageUrl = getProductImageUrl(product.image?.url);
  const salePrice = getSalePrice(product.price, product.discount);

  return (
    <li>
      <Link href={`/products/${product.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.image?.name || product.name} fill unoptimized sizes="4rem" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-muted-foreground">
              <span className="material-symbols-rounded text-2xl" aria-hidden="true">image_not_supported</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-black">{product.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{product.categoryTitle}</p>
          <p className="mt-1 font-black text-primary">{formatToman(salePrice)}</p>
        </div>
      </Link>
    </li>
  );
}

export function BookmarkList() {
  const token = useAuthToken();
  return token ? <AuthBookmarks /> : <GuestBookmarks />;
}

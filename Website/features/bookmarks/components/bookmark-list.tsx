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
    <div className="grid gap-5" aria-label="در حال بارگذاری علاقه‌مندی‌ها">
      {[0, 1, 2].map((item) => <div key={item} className="flex h-32 animate-pulse overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-primary-shadow"><div className="w-28 shrink-0 bg-secondary/20" /><div className="m-5 flex-1 rounded-xl bg-muted" /></div>)}
    </div>
  );
}

function EmptyBookmarks() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface text-center shadow-xl shadow-primary-shadow">
      <div className="bg-secondary px-6 py-8 text-secondary-foreground">
        <span className="material-symbols-rounded text-5xl" aria-hidden="true">favorite_border</span>
      </div>
      <div className="px-6 py-10">
        <p className="font-black">لیست علاقه‌مندی‌ها خالی است</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">محصولات مورد علاقه خود را با زدن علامت قلب ذخیره کنید.</p>
      </div>
    </div>
  );
}

function GuestBookmarks() {
  const items = useGuestBookmarkStore((state) => state.items);

  if (items.length === 0) return <EmptyBookmarks />;

  return (
    <ul className="grid gap-5">
      {items.map((item) => (
        <li key={item.productId}>
          <Link href={`/products/${item.productId}`} className="group flex min-h-32 overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-primary-shadow outline-none transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring">
            <div className="grid w-24 shrink-0 place-items-center bg-secondary text-secondary-foreground sm:w-28">
              <span className="material-symbols-rounded text-4xl" aria-hidden="true">favorite</span>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="truncate font-black">{item.name || `محصول شماره ${item.productId}`}</p>
                <p className="mt-2 text-xs font-bold text-muted-foreground">محصول مهمان</p>
              </div>
              <span className="material-symbols-rounded shrink-0 text-2xl text-primary transition-transform group-hover:-translate-x-1" aria-hidden="true">arrow_back</span>
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
      <div role="alert" className="rounded-3xl border border-border bg-surface p-8 text-center shadow-xl shadow-primary-shadow">
        <span className="material-symbols-rounded text-4xl text-error" aria-hidden="true">favorite</span>
        <p className="mt-3 font-black">علاقه‌مندی‌ها بارگذاری نشد</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {isFetching ? "در حال تلاش…" : "تلاش دوباره"}
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) return <EmptyBookmarks />;

  return (
    <ul className="grid gap-5">
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
      <Link href={`/products/${product.id}`} className="group flex min-h-32 overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-primary-shadow outline-none transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative w-28 shrink-0 overflow-hidden bg-muted sm:w-32">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.image?.name || product.name} fill unoptimized sizes="(max-width: 640px) 7rem, 8rem" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
          ) : (
            <span className="grid h-full place-items-center text-muted-foreground">
              <span className="material-symbols-rounded text-3xl" aria-hidden="true">image_not_supported</span>
            </span>
          )}
          <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-md" aria-hidden="true"><span className="material-symbols-rounded text-lg">favorite</span></span>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="truncate font-black">{product.name}</p>
            <p className="mt-1.5 truncate text-xs font-bold text-muted-foreground">{product.categoryTitle}</p>
            <p className="mt-3 font-black text-primary">{formatToman(salePrice)}</p>
          </div>
          <span className="material-symbols-rounded shrink-0 text-2xl text-primary transition-transform group-hover:-translate-x-1" aria-hidden="true">arrow_back</span>
        </div>
      </Link>
    </li>
  );
}

export function BookmarkList() {
  const token = useAuthToken();
  return token ? <AuthBookmarks /> : <GuestBookmarks />;
}

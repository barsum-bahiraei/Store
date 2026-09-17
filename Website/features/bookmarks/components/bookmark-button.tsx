"use client";

import { useBookmarkToggle } from "../hooks/use-bookmarks";

export function BookmarkButton({ productId, productName }: { productId: number; productName?: string }) {
  const { isBookmarked, toggle, isPending } = useBookmarkToggle(productId, productName);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); toggle(); }}
      disabled={isPending}
      aria-label={isBookmarked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-border bg-surface/90 shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-error/10 hover:text-error focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-50"
    >
      <span className={`material-symbols-rounded text-xl ${isBookmarked ? "text-error" : ""}`} aria-hidden="true">{isBookmarked ? "favorite" : "favorite_border"}</span>
    </button>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserProfile } from "@/features/auth/hooks/use-account";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useCategories } from "../hooks/use-categories";
import type { Category } from "../types/category";

type CategoryTreeProps = {
  categories: Category[];
  depth?: number;
  onNavigate?: () => void;
};

function CategoryTree({ categories, depth = 0, onNavigate }: CategoryTreeProps) {
  return (
    <ul className={depth === 0 ? "grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3" : "mr-5 border-r border-border pr-3"}>
      {categories.map((category) => (
        <li key={category.id} className={depth === 0 ? "min-w-0" : undefined}>
          <Link
            href={`/categories/${category.id}`}
            onClick={onNavigate}
            className={`flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring ${depth === 0 ? "font-black" : "text-muted-foreground"}`}
          >
            {depth === 0 && <span className="material-symbols-rounded text-lg text-primary" aria-hidden="true">label</span>}
            <span className="truncate">{category.name}</span>
          </Link>
          {category.children.length > 0 && <CategoryTree categories={category.children} depth={depth + 1} onNavigate={onNavigate} />}
        </li>
      ))}
    </ul>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="در حال بارگذاری دسته‌بندی‌ها">
      {[0, 1, 2, 3, 4, 5].map((item) => <span key={item} className="h-10 animate-pulse rounded-lg bg-muted" />)}
    </div>
  );
}

export function StoreHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useUserProfile();
  const { totalCount: cartCount, isAuthenticated, isError: isCartError } = useCart();
  const { data: categories = [], isError, isLoading, refetch } = useCategories();

  const categoryContent = isLoading ? (
    <CategorySkeleton />
  ) : isError ? (
    <button type="button" onClick={() => refetch()} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-error outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
      <span className="material-symbols-rounded text-lg" aria-hidden="true">refresh</span>
      تلاش دوباره
    </button>
  ) : categories.length === 0 ? (
    <p className="px-2 py-4 text-sm text-muted-foreground">هنوز دسته‌بندی‌ای وجود ندارد.</p>
  ) : (
    <CategoryTree categories={categories} onNavigate={() => setIsMenuOpen(false)} />
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 text-foreground backdrop-blur-lg">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-5 sm:gap-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="خانه فروشگاه" className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="material-symbols-rounded text-2xl" aria-hidden="true">storefront</span>
          </span>
          <span className="text-lg font-black tracking-[-0.04em]">فروشگاه<span className="text-accent">.</span></span>
        </Link>

        <form action="/search" role="search" className="relative mx-auto hidden w-full max-w-2xl sm:block">
          <label htmlFor="store-search" className="sr-only">جست‌وجوی محصولات</label>
          <span className="material-symbols-rounded pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground" aria-hidden="true">search</span>
          <input id="store-search" name="q" type="search" placeholder="جست‌وجوی محصول و دسته‌بندی" className="h-11 w-full rounded-lg border border-transparent bg-muted py-2.5 pl-4 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/15" />
        </form>

        <nav aria-label="عملیات حساب کاربری" className="mr-auto flex items-center gap-1 sm:mr-0">
          <Link href={user ? "/account" : "/login"} aria-label={user ? `حساب ${user.firstName}` : "ورود"} className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="material-symbols-rounded" aria-hidden="true">person</span>
            <span className="hidden max-w-20 truncate text-xs font-bold lg:block">{user?.firstName ?? "ورود"}</span>
          </Link>
          <Link href={isAuthenticated ? "/account?tab=cart" : "/login"} aria-label="سبد خرید" className="relative grid size-11 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="material-symbols-rounded" aria-hidden="true">shopping_bag</span>
            {cartCount !== undefined && !isCartError && <span aria-live="polite" className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">{cartCount}</span>}
          </Link>
          <button type="button" aria-label="باز و بسته کردن منو" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen((open) => !open)} className="grid size-11 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:hidden">
            <span className="material-symbols-rounded" aria-hidden="true">{isMenuOpen ? "close" : "menu"}</span>
          </button>
        </nav>
      </div>

      <nav aria-label="منوی اصلی" className="hidden border-t border-border md:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-8 lg:px-12">
          <div className="group relative flex h-full items-center border-l border-border pl-4">
            <button type="button" aria-haspopup="true" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-black outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
              <span className="material-symbols-rounded text-xl" aria-hidden="true">widgets</span>
              همه دسته‌بندی‌ها
              <span className="material-symbols-rounded text-lg transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true">expand_more</span>
            </button>
            <div className="invisible absolute right-0 top-full w-[min(52rem,calc(100vw-4rem))] translate-y-1 opacity-0 transition-[opacity,transform,visibility] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="border border-border bg-surface p-5 shadow-xl shadow-primary-shadow">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <p className="text-sm font-black">مرور دسته‌بندی‌ها</p>
                  <Link href="/search" className="text-xs font-black text-primary hover:text-primary-hover">مشاهده همه محصولات</Link>
                </div>
                {categoryContent}
              </div>
            </div>
          </div>
          <Link href="/" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">خانه</Link>
          <Link href="/search" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">محصولات</Link>
          <Link href="/about" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">درباره ما</Link>
          <Link href="/contact" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">تماس با ما</Link>
        </div>
      </nav>

      {isMenuOpen && (
        <nav id="mobile-navigation" aria-label="منوی موبایل" className="max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-border bg-surface p-5 md:hidden">
          <form action="/search" role="search" className="relative mb-4 sm:hidden">
            <label htmlFor="mobile-store-search" className="sr-only">جست‌وجوی محصولات</label>
            <span className="material-symbols-rounded pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground" aria-hidden="true">search</span>
            <input id="mobile-store-search" name="q" type="search" placeholder="جست‌وجوی محصولات" className="h-11 w-full rounded-lg border border-transparent bg-muted py-2.5 pl-4 pr-11 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/15" />
          </form>
          <div className="grid gap-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-muted hover:text-primary">خانه</Link>
            <Link href="/search" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-muted hover:text-primary">محصولات</Link>
            <div className="my-2 border-y border-border py-4">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="font-black">دسته‌بندی‌ها</span>
                <Link href="/search" onClick={() => setIsMenuOpen(false)} className="text-xs font-black text-primary">مشاهده همه</Link>
              </div>
              {categoryContent}
            </div>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-muted hover:text-primary">درباره ما</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-muted hover:text-primary">تماس با ما</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

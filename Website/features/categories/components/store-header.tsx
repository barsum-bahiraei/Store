"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useUserProfile } from "@/features/auth/hooks/use-account";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useCategories } from "../hooks/use-categories";
import type { Category } from "../types/category";

type CategoryTreeProps = {
  categories: Category[];
  onNavigate?: () => void;
};

function DesktopCategoryItems({ categories, onNavigate }: CategoryTreeProps) {
  return (
    <ul className="grid gap-1">
      {categories.map((category) => (
        <li key={category.id} className="relative min-w-0 [&:focus-within>div]:pointer-events-auto [&:focus-within>div]:visible [&:focus-within>div]:opacity-100 [&:hover>div]:pointer-events-auto [&:hover>div]:visible [&:hover>div]:opacity-100">
          <Link
            href={`/shop?category=${category.id}`}
            onClick={onNavigate}
            className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-sm font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="truncate">{category.name}</span>
            {category.children.length > 0 && <span className="material-symbols-rounded shrink-0 text-base text-muted-foreground" aria-hidden="true">chevron_left</span>}
          </Link>
          {category.children.length > 0 && (
            <div className="pointer-events-none invisible absolute right-full top-0 z-20 min-w-56 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-xl shadow-primary-shadow transition-[opacity,visibility] duration-150">
              <DesktopCategoryItems categories={category.children} onNavigate={onNavigate} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function DesktopCategoryTree({ categories, onNavigate }: CategoryTreeProps) {
  return <DesktopCategoryItems categories={categories} onNavigate={onNavigate} />;
}

function MobileCategoryTree({ categories, onNavigate }: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  function renderCategories(items: Category[], level = 0): ReactNode {
    return (
      <ul className={level === 0 ? "grid gap-1" : "mr-3 grid gap-1 border-r-2 border-primary/20 pr-3"}>
        {items.map((category) => {
          const isExpanded = expandedIds.has(category.id);
          const hasChildren = category.children.length > 0;

          return (
            <li key={category.id} className="border-b border-border/70 last:border-b-0">
              <div className="flex items-center">
                <Link href={`/shop?category=${category.id}`} onClick={onNavigate} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-sm font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="truncate">{category.name}</span>
                </Link>
                {hasChildren && <button type="button" aria-label={`زیرمجموعه‌های ${category.name}`} aria-expanded={isExpanded} onClick={() => toggleCategory(category.id)} className="grid size-11 shrink-0 place-items-center rounded-lg outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className={`material-symbols-rounded text-lg text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span></button>}
              </div>

              {hasChildren && (
                <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] pb-2 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0 overflow-hidden">{renderCategories(category.children, level + 1)}</div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return renderCategories(categories);
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
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const { data: user } = useUserProfile();
  const { totalCount: cartCount, isAuthenticated, isError: isCartError } = useCart();
  const { data: categories = [], isError, isLoading, refetch } = useCategories();

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsMobileCategoriesOpen(false);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
    setIsMobileCategoriesOpen(false);
  };

  const openDesktopMenu = () => {
    if (window.innerWidth >= 768) setIsMenuOpen(true);
  };

  const closeDesktopMenu = () => {
    if (window.innerWidth >= 768) closeMenu();
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      const isInsideCategoryMenu = target instanceof Element && Boolean(target.closest('[aria-controls="store-navigation"], #store-navigation'));
      if (!isInsideCategoryMenu) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (!isMenuOpen || typeof window === "undefined" || window.innerWidth >= 768) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

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
    <>
      <div className="hidden md:block">
        <DesktopCategoryTree categories={categories} onNavigate={closeMenu} />
      </div>
      <div className="md:hidden">
        <MobileCategoryTree categories={categories} onNavigate={closeMenu} />
      </div>
    </>
  );

  return (
    <header data-store-header onMouseLeave={closeDesktopMenu} className="sticky top-0 z-50 border-b border-border bg-surface/95 text-foreground md:backdrop-blur-lg">
      <div className="relative mx-auto flex h-20 w-full items-center gap-0 px-0 sm:h-24 md:gap-4 md:px-5 lg:px-6 xl:px-8">
        <div className="contents md:flex md:min-w-0 md:shrink-0 md:items-center md:gap-2 md:[direction:rtl]">
          <button type="button" aria-label="باز و بسته کردن منوی دسته‌بندی‌ها" aria-expanded={isMenuOpen} aria-controls="store-navigation" onClick={toggleMenu} className="absolute right-0 grid size-11 shrink-0 place-items-center rounded-lg outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring md:hidden">
            <span className="material-symbols-rounded text-2xl" aria-hidden="true">{isMenuOpen ? "close" : "menu"}</span>
          </button>
          <Link href="/" aria-label="خانه فروشگاه" className="absolute left-1/2 flex min-h-11 min-w-0 -translate-x-1/2 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring [direction:rtl] md:static md:translate-x-0">
            <Image src="/images/zaryvan-logo.png" alt="" width={64} height={64} className="size-14 rounded-full object-contain sm:size-16" />
          </Link>
        </div>

        <form action="/shop" role="search" className="relative mx-auto hidden w-full max-w-2xl md:block">
          <label htmlFor="store-search" className="sr-only">جست‌وجوی محصولات</label>
          <span className="material-symbols-rounded pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground" aria-hidden="true">search</span>
          <input id="store-search" name="q" type="search" placeholder="جست‌وجوی محصول" className="h-11 w-full rounded-lg border border-transparent bg-muted py-2.5 pl-4 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/15" />
        </form>

        <nav aria-label="عملیات حساب کاربری" className="absolute left-0 flex shrink-0 items-center gap-0 [direction:rtl] md:static md:gap-1">
          <Link href={user ? "/account" : "/login"} aria-label={user ? (user.firstName ? `حساب ${user.firstName}` : "حساب من") : "ورود"} className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="material-symbols-rounded" aria-hidden="true">person</span>
            {!user && <span className="hidden max-w-20 truncate text-xs font-bold lg:block">ورود</span>}
          </Link>
          <Link href={isAuthenticated ? "/account?tab=cart" : "/login"} aria-label="سبد خرید" className="relative grid size-11 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="material-symbols-rounded" aria-hidden="true">shopping_bag</span>
            {cartCount !== undefined && !isCartError && <span aria-live="polite" className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">{cartCount}</span>}
          </Link>
        </nav>
      </div>

      <nav aria-label="منوی اصلی" className="border-t border-border bg-surface text-foreground">
        <div className="mx-auto flex min-h-12 w-full items-center px-0 sm:px-5 lg:px-6 xl:px-8">
          <form action="/shop" role="search" className="relative w-full md:hidden">
            <label htmlFor="mobile-store-search" className="sr-only">جست‌وجوی محصولات</label>
            <span className="material-symbols-rounded pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground" aria-hidden="true">search</span>
            <input id="mobile-store-search" name="q" type="search" placeholder="جست‌وجوی محصول" className="h-11 w-full rounded-lg border border-transparent bg-muted py-2.5 pl-4 pr-11 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/15" />
          </form>
          <div className="hidden items-center gap-1 md:flex">
          <button type="button" onClick={toggleMenu} onMouseEnter={openDesktopMenu} onFocus={openDesktopMenu} aria-expanded={isMenuOpen} aria-controls="store-navigation" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
            دسته‌بندی کالاها
            <span className={`material-symbols-rounded text-lg transition-transform ${isMenuOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
          </button>
          <Link href="/shop" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">همه محصولات</Link>
          <Link href="/shop?discount=true" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">شگفت‌انگیزها</Link>
          <Link href="/about" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">درباره ما</Link>
          <Link href="/contact" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">تماس با ما</Link>
          <Link href="/contact?subject= همکاری با ما" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">همکاری با ما</Link>
          <Link href="/blog-1/" className="flex min-h-10 items-center rounded-lg px-4 text-sm font-bold outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">مجله زریوان</Link>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <nav id="store-navigation" aria-label="منوی دسته‌بندی‌ها" onMouseEnter={openDesktopMenu} className="fixed inset-0 z-[60] h-dvh w-screen max-w-none overflow-y-auto border-border bg-surface p-5 shadow-lg shadow-primary-shadow md:absolute md:inset-auto md:right-5 md:top-full md:z-[60] md:h-auto md:w-72 md:overflow-visible md:rounded-b-2xl md:border md:p-3 lg:right-6 xl:right-8">
          <div className="mx-auto grid w-full max-w-7xl gap-5 [direction:rtl] md:max-w-none">
            <div className="flex items-center justify-between border-b border-border pb-4 md:hidden">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="material-symbols-rounded text-xl text-primary" aria-hidden="true">
                  home
                </span>
                <span>خانه</span>
              </Link>
              <button type="button" onClick={closeMenu} aria-label="بستن منو" className="grid size-11 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                <span className="material-symbols-rounded text-2xl" aria-hidden="true">close</span>
              </button>
            </div>
            <div className="hidden md:block">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <p className="text-sm font-black">دسته‌بندی کالاها</p>
                <Link href="/shop" onClick={closeMenu} className="text-[11px] font-black text-primary hover:text-primary-hover">مشاهده همه</Link>
              </div>
              {categoryContent}
            </div>
            <div className="grid gap-2 md:hidden">
              <button type="button" onClick={() => setIsMobileCategoriesOpen((open) => !open)} aria-expanded={isMobileCategoriesOpen} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 text-right font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">category</span>
                <span className="flex-1">دسته‌بندی کالاها</span>
                <span className={`material-symbols-rounded text-lg text-muted-foreground transition-transform duration-300 ${isMobileCategoriesOpen ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
              </button>
              {isMobileCategoriesOpen && categoryContent}
              <div className="grid gap-2">
                <Link href="/shop" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">storefront</span>
                  <span className="flex-1">همه محصولات</span>
                </Link>
                <Link href="/shop?discount=true" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">local_offer</span>
                  <span className="flex-1">شگفت‌انگیزها</span>
                </Link>
                <Link href="/about" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">info</span>
                  <span className="flex-1">درباره ما</span>
                </Link>
                <Link href="/contact" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">support_agent</span>
                  <span className="flex-1">تماس با ما</span>
                </Link>
                <Link href="/contact?subject= همکاری با ما" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">handshake</span>
                  <span className="flex-1">همکاری با ما</span>
                </Link>
                <Link href="/blog-1/" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 font-bold transition-colors hover:bg-muted hover:text-primary">
                  <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">article</span>
                  <span className="flex-1">مجله زریوان</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

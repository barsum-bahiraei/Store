"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useProductBrands } from "@/features/products/hooks/use-products";

export function HeaderBrandsMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data: brands = [], isPending, isError, isFetching, refetch } = useProductBrands();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function navigate() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className="relative" onMouseLeave={() => { if (!mobile) setOpen(false); }}>
      <button ref={buttonRef} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls={menuId} className={mobile ? "flex min-h-12 w-full items-center gap-2 rounded-lg border border-border px-3 text-right font-black outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" : "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"}>
        {mobile && <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">sell</span>}
        <span className={mobile ? "flex-1" : undefined}>برندها</span>
        <span className={`material-symbols-rounded text-lg transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span>
      </button>
      {open && <nav id={menuId} aria-label="انتخاب برند" className={mobile ? "mt-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-2 text-foreground" : "absolute right-0 top-full z-10 max-h-80 w-64 overflow-y-auto rounded-b-xl border border-border bg-surface p-2 text-foreground shadow-xl shadow-primary-shadow"}>
        <Link href="/shop" onClick={navigate} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold outline-none hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">همه برندها</Link>
        {isPending ? <p role="status" className="px-3 py-4 text-sm text-muted-foreground">در حال بارگذاری برندها…</p>
          : isError ? <div role="alert" className="px-3 py-2"><p className="text-sm text-error">بارگذاری برندها انجام نشد.</p><button type="button" disabled={isFetching} onClick={() => refetch()} className="mt-2 min-h-11 rounded-lg px-3 text-sm font-bold text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">{isFetching ? "در حال تلاش…" : "تلاش دوباره"}</button></div>
            : brands.length === 0 ? <p className="px-3 py-4 text-sm text-muted-foreground">هنوز برندی ثبت نشده است.</p>
              : brands.map((brand) => <Link key={brand.id} href={`/shop?productBrandId=${brand.id}`} onClick={navigate} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold outline-none hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">{brand.name}</Link>)}
      </nav>}
    </div>
  );
}

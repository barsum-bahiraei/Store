"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProductSuggestions } from "@/features/products/hooks/use-product-suggestions";

export function HeaderProductSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = mobile ? "mobile-store-search" : "store-search";
  const { term, ready, data, isFetching, isError, refetch } = useProductSuggestions(value, open);
  const showSuggestions = open && term.length >= 2;
  const items = ready ? data?.items ?? [] : [];
  const searchHref = `/shop?q=${encodeURIComponent(term)}`;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <form ref={containerRef} action="/shop" role="search" onSubmit={() => setOpen(false)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} className={mobile ? "relative w-full md:hidden" : "relative mx-auto hidden w-full max-w-2xl md:block"}>
      <label htmlFor={id} className="sr-only">جست‌وجوی محصولات</label>
      <input ref={inputRef} id={id} name="q" type="search" maxLength={100} autoComplete="off" placeholder="جست‌وجوی محصول" value={value} onChange={(event) => { setValue(event.target.value); setActiveIndex(-1); setOpen(true); }} onFocus={() => setOpen(true)} role="combobox" aria-autocomplete="list" aria-expanded={showSuggestions} aria-controls={showSuggestions ? `${id}-suggestions` : undefined} aria-activedescendant={showSuggestions && activeIndex >= 0 && items[activeIndex] ? `${id}-option-${activeIndex}` : undefined} onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActiveIndex(-1); }
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && term.length >= 2) {
          event.preventDefault();
          setOpen(true);
          if (items.length > 0) setActiveIndex((current) => event.key === "ArrowDown" ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1));
        }
        if (event.key === "Enter" && showSuggestions && items[activeIndex]) {
          event.preventDefault();
          setOpen(false);
          router.push(`/products/${items[activeIndex].id}`);
        }
      }} className={`h-11 w-full border bg-white/90 py-2.5 pl-11 pr-11 text-sm text-foreground outline-none backdrop-blur-md placeholder:text-muted-foreground focus:border-white focus:bg-white focus:ring-2 focus:ring-white/35 [&::-webkit-search-cancel-button]:appearance-none ${mobile ? "rounded-lg border-white/35 shadow-sm" : "rounded-xl border-white/45 shadow-md shadow-black/10"}`} />
      <button type="submit" aria-label="جست‌وجوی محصول" className="absolute right-0 top-0 z-10 grid size-11 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded text-xl" aria-hidden="true">search</span></button>
      {value && <button type="button" aria-label="پاک کردن جستجو" onClick={() => { setValue(""); setActiveIndex(-1); setOpen(true); inputRef.current?.focus(); }} className="absolute left-0 top-0 z-10 grid size-11 place-items-center rounded-lg text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded text-xl" aria-hidden="true">close</span></button>}
      {showSuggestions && <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(26rem,60dvh)] overflow-y-auto rounded-2xl border border-border bg-surface text-foreground shadow-xl shadow-primary-shadow">
        <ul id={`${id}-suggestions`} role="listbox" aria-label="پیشنهادهای جستجو" className="divide-y divide-border">
          {items.map((product, index) => <li key={product.id} role="presentation"><Link id={`${id}-option-${index}`} href={`/products/${product.id}`} role="option" aria-selected={activeIndex === index} tabIndex={-1} onMouseEnter={() => setActiveIndex(index)} onClick={() => setOpen(false)} className={`flex min-h-14 items-center gap-3 px-3 py-3 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4 ${activeIndex === index ? "bg-muted" : ""}`}><span className="material-symbols-rounded shrink-0 text-xl text-muted-foreground" aria-hidden="true">search</span><span className="min-w-0 flex-1 break-words font-bold">{product.name}</span>{product.categoryTitle && <span className="max-w-24 shrink-0 text-xs leading-5 text-primary sm:max-w-36">در {product.categoryTitle}</span>}</Link></li>)}
        </ul>
        {!ready || isFetching ? <p role="status" className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground"><span className="material-symbols-rounded animate-spin text-xl motion-reduce:animate-none" aria-hidden="true">progress_activity</span>در حال جستجو…</p>
          : isError ? <div role="alert" className="px-4 py-3 text-sm"><p className="text-error">پیشنهادها بارگذاری نشدند.</p><button type="button" onClick={() => refetch()} className="mt-2 min-h-11 rounded-lg px-3 font-bold text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">تلاش دوباره</button></div>
            : items.length === 0 ? <p role="status" className="px-4 py-4 text-sm text-muted-foreground">محصولی با این عبارت پیدا نشد.</p> : null}
        <Link href={searchHref} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm font-bold text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><span>مشاهده همه نتایج «{term}»</span><span className="material-symbols-rounded text-xl" aria-hidden="true">arrow_back</span></Link>
      </div>}
    </form>
  );
}

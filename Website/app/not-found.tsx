import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد | فروشگاه",
  description: "صفحه‌ای که به دنبال آن بودید پیدا نشد.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-20 h-80 bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-1/2 -z-10 h-px w-full bg-border"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="خانه فروشگاه"
          className="group inline-flex min-h-12 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform duration-200 group-hover:-rotate-3">
            <span className="material-symbols-rounded text-2xl" aria-hidden="true">
              storefront
            </span>
          </span>
          <span className="text-lg font-black tracking-[-0.04em]">فروشگاه.</span>
        </Link>

        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold tracking-widest text-muted-foreground">
          خطای ۴۰۴
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8 lg:px-12">
        <div
          aria-hidden="true"
          className="relative flex items-center justify-center text-[clamp(8rem,30vw,19rem)] font-black leading-[0.72] tracking-[-0.11em] text-secondary"
        >
          <span>4</span>
          <span className="not-found-float relative mx-[0.02em] grid size-[0.72em] shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_1.5rem_4rem_var(--color-primary-shadow)]">
            <span className="material-symbols-rounded text-[0.35em] font-normal" aria-hidden="true">
              search_off
            </span>
            <span className="absolute -bottom-[0.07em] left-1/2 h-[0.08em] w-[0.52em] -translate-x-1/2 rounded-full bg-secondary/15 blur-sm" />
          </span>
          <span>4</span>
        </div>

        <div className="relative z-10 mt-12 max-w-2xl sm:mt-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-primary">
            این صفحه در دسترس نیست
          </p>
          <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
            این صفحه را پیدا نکردیم.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            ممکن است پیوند قدیمی باشد یا صفحه جابه‌جا شده باشد. به فروشگاه
            برگردید و به جست‌وجو ادامه دهید.
          </p>

          <Link
            href="/"
            className="group mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow outline-none transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary-shadow active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            بازگشت به فروشگاه
            <span
              className="material-symbols-rounded text-xl transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              arrow_back
            </span>
          </Link>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 pb-6 text-xs text-muted-foreground sm:px-8 lg:px-12">
        <span className="h-px flex-1 bg-border" />
        <span>چیزی گم نشده، فقط این صفحه پیدا نشد.</span>
        <span className="h-px flex-1 bg-border" />
      </footer>
    </div>
  );
}

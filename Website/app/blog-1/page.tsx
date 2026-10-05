import type { Metadata } from "next";
import Link from "next/link";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { StoreHeader } from "@/features/categories/components/store-header";

export const metadata: Metadata = {
  title: "مجله",
  description: "مقالات و راهنماهای لوازم کمپ، کوهنوردی و طبیعت‌گردی در مجله زریوان.",
};

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

const articles: Article[] = [];
const pageSize = 6;

function positivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function BlogPage({ searchParams }: PageProps<"/blog-1">) {
  const params = await searchParams;
  const requestedPage = positivePage(params.page);
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visibleArticles = articles.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="relative isolate flex-1 overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-45" />
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.18em] text-primary">مجله زریوان</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">راهنمایی برای انتخاب بهتر و ماجراجویی بیشتر</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">مقالات آموزشی، راهنماهای خرید و تجربه‌های دنیای کمپ و کوه‌نوردی.</p>
          </div>

          {visibleArticles.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <article key={article.slug} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <p className="text-xs font-bold text-primary">{article.publishedAt}</p>
                  <h2 className="mt-3 text-lg font-black leading-8">{article.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
                  <Link href={`/blog-1/${article.slug}`} className="mt-5 inline-flex min-h-10 items-center text-sm font-black text-primary hover:text-primary-hover">مطالعه مقاله</Link>
                </article>
              ))}
            </div>
          ) : (
            <section className="mx-auto mt-12 max-w-2xl rounded-3xl border border-primary/35 bg-secondary/90 p-8 text-center text-secondary-foreground shadow-2xl shadow-primary-shadow backdrop-blur-xl sm:p-12">
              <span className="material-symbols-rounded text-6xl text-accent" aria-hidden="true">auto_stories</span>
              <h2 className="mt-5 text-2xl font-black">مجله زریوان به‌زودی شروع به کار می‌کند</h2>
              <p className="mt-3 text-sm leading-8 text-secondary-foreground/80">به‌زودی مقاله‌های آموزشی و راهنماهای کاربردی دنیای کمپ و کوه‌نوردی را اینجا منتشر می‌کنیم.</p>
              <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">مشاهده محصولات</Link>
            </section>
          )}

          {totalPages > 1 && (
            <nav aria-label="صفحه‌های مجله" className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                <Link key={item} href={`/blog-1/?page=${item}`} aria-current={item === page ? "page" : undefined} className={`grid size-10 place-items-center rounded-lg text-sm font-black ${item === page ? "bg-primary text-primary-foreground" : "border border-border bg-surface hover:bg-muted"}`}>{item}</Link>
              ))}
            </nav>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

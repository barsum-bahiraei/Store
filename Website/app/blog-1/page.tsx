import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { StoreHeader } from "@/features/categories/components/store-header";
import { articles, type Article } from "@/features/blog/data/articles";

export const metadata: Metadata = {
  title: "مجله زریوان",
  description: "مقالات و راهنماهای کوهنوردی، صخره‌نوردی و طبیعت‌گردی در مجله زریوان.",
};

function getArticleHref(article: Article) {
  return `/blog-1/${article.slug}`;
}

function ArticleCard({ article }: { article: Article }) {
  const href = getArticleHref(article);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-primary/15 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary-shadow">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={article.image}
          alt={article.title}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/45 via-transparent to-transparent" />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.categories.map((category) => (
            <span key={category} className="rounded-full bg-accent/45 px-3 py-1 text-[11px] font-black text-primary">{category}</span>
          ))}
        </div>
        <h2 className="mt-4 text-lg font-black leading-8 text-foreground transition-colors group-hover:text-primary">{article.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <span className="material-symbols-rounded text-base text-primary" aria-hidden="true">calendar_month</span>
            {article.publishedAt}
          </span>
          <Link href={href} className="inline-flex min-h-10 items-center gap-1 text-sm font-black text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            مطالعه مقاله
            <span className="material-symbols-rounded text-lg" aria-hidden="true">arrow_back</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [featuredArticle, ...remainingArticles] = articles;
  const featuredHref = getArticleHref(featuredArticle);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="relative isolate flex-1 overflow-hidden px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-55" />
        <div className="mx-auto w-full max-w-[1480px]">
          <header className="mx-auto max-w-3xl text-center">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary-shadow">
              <span className="material-symbols-rounded text-3xl" aria-hidden="true">auto_stories</span>
            </span>
            <p className="mt-5 text-sm font-black tracking-[0.14em] text-primary">مجله زریوان</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">راهنمای کوهنوردی و طبیعت‌گردی</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">آموزش‌ها و راهنماهای کاربردی برای انتخاب تجهیزات، آمادگی بهتر و تجربه‌ای امن‌تر در طبیعت.</p>
          </header>

          <section className="mt-10 overflow-hidden rounded-[2rem] border border-primary/20 bg-surface shadow-xl shadow-primary-shadow sm:mt-14">
            <div className="grid lg:grid-cols-[1.25fr_1fr]">
              <Link href={featuredHref} className="group relative min-h-72 overflow-hidden bg-muted sm:min-h-[25rem]">
                <Image src={featuredArticle.image} alt={featuredArticle.title} fill priority unoptimized sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/55 via-transparent to-transparent lg:bg-gradient-to-l" />
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <div className="flex flex-wrap gap-2">
                  {featuredArticle.categories.map((category) => (
                    <span key={category} className="rounded-full bg-accent/50 px-3 py-1.5 text-xs font-black text-primary">{category}</span>
                  ))}
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span className="material-symbols-rounded text-lg text-primary" aria-hidden="true">calendar_month</span>
                  {featuredArticle.publishedAt}
                </p>
                <h2 className="mt-3 text-2xl font-black leading-10 sm:text-3xl">{featuredArticle.title}</h2>
                <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">{featuredArticle.excerpt}</p>
                <Link href={featuredHref} className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  مطالعه مقاله
                  <span className="material-symbols-rounded" aria-hidden="true">arrow_back</span>
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="articles-heading">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-primary">دانستنی‌های زریوان</p>
                <h2 id="articles-heading" className="mt-2 text-2xl font-black sm:text-3xl">آخرین مقاله‌ها</h2>
              </div>
              <span className="hidden text-sm font-bold text-muted-foreground sm:block">{remainingArticles.length.toLocaleString("fa-IR")} مقاله</span>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {remainingArticles.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
          </section>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

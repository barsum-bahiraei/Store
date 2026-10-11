import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { articles, getArticleBySlug } from "@/features/blog/data/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) return { title: "مقاله پیدا نشد" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = articles.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="relative isolate flex-1 overflow-hidden px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_70%)] opacity-50" />
        <article className="mx-auto w-full max-w-5xl">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-primary">خانه</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog-1" className="transition-colors hover:text-primary">مجله زریوان</Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{article.title}</span>
          </nav>

          <header className="mt-6 text-center sm:mt-9">
            <div className="flex flex-wrap justify-center gap-2">
              {article.categories.map((category) => (
                <span key={category} className="rounded-full bg-accent/50 px-3 py-1.5 text-xs font-black text-primary">{category}</span>
              ))}
            </div>
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">{article.title}</h1>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <span className="material-symbols-rounded text-lg text-primary" aria-hidden="true">calendar_month</span>
              {article.publishedAt}
            </p>
          </header>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-primary/20 bg-muted shadow-xl shadow-primary-shadow sm:mt-10">
            <Image src={article.image} alt={article.title} fill priority unoptimized sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/35 via-transparent to-transparent" />
          </div>

          <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
            <p className="rounded-2xl border border-primary/20 bg-accent/25 p-5 text-base font-bold leading-9 sm:p-7 sm:text-lg">{article.excerpt}</p>

            <div className="mt-10 space-y-10">
              {article.sections.map((section) => (
                <section key={section.title} className="scroll-mt-28">
                  <h2 className="flex items-start gap-3 text-xl font-black leading-9 sm:text-2xl">
                    <span className="material-symbols-rounded mt-1 text-primary" aria-hidden="true">landscape</span>
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {section.bullets ? (
                    <ul className="mt-5 space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm leading-7 sm:p-6 sm:text-base">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <span className="material-symbols-rounded mt-0.5 shrink-0 text-lg text-primary" aria-hidden="true">check_circle</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <aside className="mt-12 rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-rounded text-3xl text-accent" aria-hidden="true">health_and_safety</span>
                <div>
                  <h2 className="font-black">ایمنی همیشه اولویت دارد</h2>
                  <p className="mt-2 text-sm leading-7 text-secondary-foreground/80">این مطلب برای آشنایی عمومی است. مهارت‌های فنی و کار با تجهیزات ایمنی را زیر نظر مربی واجد صلاحیت و متناسب با شرایط واقعی برنامه تمرین کنید.</p>
                </div>
              </div>
            </aside>
          </div>
        </article>

        <section className="mx-auto mt-16 w-full max-w-5xl border-t border-border pt-10" aria-labelledby="related-articles-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="related-articles-title" className="text-2xl font-black">مقاله‌های پیشنهادی</h2>
            <Link href="/blog-1" className="text-sm font-black text-primary hover:text-primary-hover">همه مقاله‌ها</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/blog-1/${relatedArticle.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image src={relatedArticle.image} alt="" fill unoptimized sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-black leading-7 transition-colors group-hover:text-primary">{relatedArticle.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">مطالعه مقاله <span className="material-symbols-rounded text-base" aria-hidden="true">arrow_back</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}

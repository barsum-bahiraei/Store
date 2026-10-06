import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { StoreHeader } from "@/features/categories/components/store-header";

export const metadata: Metadata = {
  title: "مجله زریوان",
  description: "مقالات و راهنماهای کوهنوردی، صخره‌نوردی و طبیعت‌گردی در مجله زریوان.",
};

type Article = {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  image: string;
  href: string;
  categories: string[];
};

const articles: Article[] = [
  {
    id: 7662,
    title: "چادر مناسب کوهنوردی",
    excerpt: "افرادی که برای شب‌مانی یا پیمایش‌های طولانی برنامه دارند، به چادری مناسب برای استراحت و محافظت در برابر گرما و سرما نیاز دارند. در این مطلب با تفاوت چادرهای کمپینگ و ارتفاع آشنا می‌شوید.",
    publishedAt: "۱۸ فروردین ۱۴۰۱",
    image: "https://zaryvan.com/wp-content/uploads/2022/04/best-backpacking-tent-under-100-dollars.jpg",
    href: "https://zaryvan.com/%da%86%d8%a7%d8%af%d8%b1-%d9%85%d9%86%d8%a7%d8%b3%d8%a8-%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
  {
    id: 7640,
    title: "طناب در کوهنوردی بسیار مهم است",
    excerpt: "در عملیات نجات، کوهنوردی و سنگ‌نوردی سلامت افراد به طناب وابسته است. این راهنما اهمیت طناب، کاربردهای آن و نکات مهم انتخاب و استفاده را مرور می‌کند.",
    publishedAt: "۱۷ فروردین ۱۴۰۱",
    image: "https://zaryvan.com/wp-content/uploads/2022/04/انواع-طناب-کوه_نوردی-2.png",
    href: "https://zaryvan.com/%d8%b7%d9%86%d8%a7%d8%a8-%d8%af%d8%b1-%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c-%d8%a8%d8%b3%db%8c%d8%a7%d8%b1-%d9%85%d9%87%d9%85-%d8%a7%d8%b3%d8%aa/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
  {
    id: 7608,
    title: "کفش مناسب کوهنوردی",
    excerpt: "پا قلب دوم کوهنورد است و کفش یکی از مهم‌ترین بخش‌های تجهیزات او به شمار می‌رود. این مقاله انتخاب کفش برای کوهنوردی، یخ‌نوردی، جنگل‌پیمایی و برنامه‌های سبک را بررسی می‌کند.",
    publishedAt: "۱۱ فروردین ۱۴۰۱",
    image: "https://zaryvan.com/wp-content/uploads/2022/03/26.jpg",
    href: "https://zaryvan.com/%da%a9%d9%81%d8%b4-%d9%85%d9%86%d8%a7%d8%b3%d8%a8-%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c/",
    categories: ["دانستنی‌ها", "سلامت و زیبایی"],
  },
  {
    id: 5924,
    title: "فاکتورهای آمادگی جسمانی",
    excerpt: "قدرت، استقامت و توان بدنی پایه یک برنامه ایمن در طبیعت هستند. در این مطلب شکل‌های مختلف قدرت و مؤلفه‌های اصلی آمادگی جسمانی معرفی می‌شوند.",
    publishedAt: "۱۸ دی ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2022/01/فاکتور-های-آمادگی-جسمانی.jpg",
    href: "https://zaryvan.com/%d9%81%d8%a7%da%a9%d8%aa%d9%88%d8%b1%d9%87%d8%a7%db%8c-%d8%a2%d9%85%d8%a7%d8%af%da%af%db%8c-%d8%ac%d8%b3%d9%85%d8%a7%d9%86%db%8c/",
    categories: ["دانستنی‌ها", "سلامت و زیبایی"],
  },
  {
    id: 3886,
    title: "صفات کوله پشتی کوهنوردی",
    excerpt: "کوله‌پشتی مناسب یکی از ضروری‌ترین وسایل طبیعت‌گردی است. این راهنما ویژگی‌هایی را توضیح می‌دهد که هنگام انتخاب کوله برای سفر و کوهنوردی باید در نظر بگیرید.",
    publishedAt: "۱۶ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/10/صفات-کوله-پشتی-کوهنوردی.jpg",
    href: "https://zaryvan.com/%d8%b5%d9%81%d8%a7%d8%aa-%da%a9%d9%88%d9%84%d9%87-%d9%be%d8%b4%d8%aa%db%8c-%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
  {
    id: 3882,
    title: "شب مانی در طبیعت",
    excerpt: "شب‌مانی در چادر و گذراندن یک روز کامل در هوای آزاد تجربه‌ای به‌یادماندنی است. با چند نکته ساده می‌توانید این سفر را ایمن‌تر و لذت‌بخش‌تر برنامه‌ریزی کنید.",
    publishedAt: "۱۶ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/10/شب-مانی-در-طبیعت.jpg",
    href: "https://zaryvan.com/%d8%b4%d8%a8-%d9%85%d8%a7%d9%86%db%8c-%d8%af%d8%b1-%d8%b7%d8%a8%db%8c%d8%b9%d8%aa/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
  {
    id: 3833,
    title: "تفاوت کوهنوردی، کوهپیمایی و پیمایش",
    excerpt: "کوهپیمایی، کوهنوردی و پیمایش هرکدام تعریف و سطح آمادگی متفاوتی دارند. این مطلب مرز میان این فعالیت‌ها و مهارت‌های مورد نیاز هرکدام را روشن می‌کند.",
    publishedAt: "۱۲ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/10/کوهنوردی-و-کوهپیمایی.jpg",
    href: "https://zaryvan.com/%d8%aa%d9%81%d8%a7%d9%88%d8%aa-%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c%d8%8c-%da%a9%d9%88%d9%87%d9%be%db%8c%d9%85%d8%a7%db%8c%db%8c-%d9%88-%d9%be%db%8c%d9%85%d8%a7%db%8c%d8%b4/",
    categories: ["دانستنی‌ها", "سلامت و زیبایی", "کوهنوردی"],
  },
  {
    id: 3827,
    title: "آموزش مقدماتی صخره نوردی",
    excerpt: "با مفاهیم پایه صخره‌نوردی، روش‌های فرود با طناب و ابزارهای مورد استفاده آشنا شوید. این مقاله اصطلاحات و شیوه‌های رایج برای شروع مسیر را توضیح می‌دهد.",
    publishedAt: "۱۲ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/10/آموزش-مقدماتی-صخره-نوردی.jpg",
    href: "https://zaryvan.com/%d8%a2%d9%85%d9%88%d8%b2%d8%b4-%d9%85%d9%82%d8%af%d9%85%d8%a7%d8%aa%db%8c-%d8%b5%d8%ae%d8%b1%d9%87-%d9%86%d9%88%d8%b1%d8%af%db%8c/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
  {
    id: 3325,
    title: "صخره نوردی",
    excerpt: "در صخره‌نوردی ورزشکار با عبور از موانع به سمت بالای صخره یا قله حرکت می‌کند. نوع مسیر و شیب، تجهیزات مورد نیاز مانند طناب، کارابین و ابزارهای حمایتی را تعیین می‌کند.",
    publishedAt: "۳ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/09/صخره-نوردی.jpg",
    href: "https://zaryvan.com/%d8%b5%d8%ae%d8%b1%d9%87-%d9%86%d9%88%d8%b1%d8%af%db%8c/",
    categories: ["دانستنی‌ها", "سلامت و زیبایی", "کوهنوردی"],
  },
  {
    id: 3321,
    title: "کوهنوردی چیست؟",
    excerpt: "کوهنوردی به حرکت پیاده در ارتفاعات طبیعی گفته می‌شود و می‌تواند از کوه‌پیمایی تا صعود قله و صخره‌نوردی را دربر بگیرد. در این مقاله با تعریف و تاریخچه آن آشنا می‌شوید.",
    publishedAt: "۳ مهر ۱۴۰۰",
    image: "https://zaryvan.com/wp-content/uploads/2021/09/کوهنوردی-چیست؟.jpg",
    href: "https://zaryvan.com/%da%a9%d9%88%d9%87%d9%86%d9%88%d8%b1%d8%af%db%8c-%da%86%db%8c%d8%b3%d8%aa%d8%9f/",
    categories: ["دانستنی‌ها", "کوهنوردی"],
  },
];

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-primary/15 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary-shadow">
      <Link href={article.href} target="_blank" rel="noreferrer" className="relative block aspect-[16/10] overflow-hidden bg-muted">
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
          <Link href={article.href} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-black text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
              <Link href={featuredArticle.href} target="_blank" rel="noreferrer" className="group relative min-h-72 overflow-hidden bg-muted sm:min-h-[25rem]">
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
                <Link href={featuredArticle.href} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
              <span className="hidden text-sm font-bold text-muted-foreground sm:block">۹ مقاله</span>
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

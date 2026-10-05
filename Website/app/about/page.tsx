import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { StoreHeader } from "@/features/categories/components/store-header";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "آشنایی با زریوان؛ تامین‌کننده محصولات ورزشی، کوهنوردی و تجهیزات فنی از سال ۱۳۹۰.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />

      <main className="relative isolate flex-1 overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-45" />
        <div className="mx-auto w-full max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.18em] text-primary">داستان زریوان</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              همراه مطمئن ماجراجویی‌های شما
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              سال‌ها تجربه، انتخاب دقیق و عشق به طبیعت؛ این همان چیزی است که زریوان را ساخته است.
            </p>
          </div>

          <section className="relative mt-12 overflow-hidden rounded-3xl border border-primary/35 bg-secondary/90 p-6 text-secondary-foreground shadow-2xl shadow-primary-shadow backdrop-blur-xl sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full border-[2rem] border-accent/20" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 size-64 rounded-full border-[3rem] border-primary/20" aria-hidden="true" />

            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
              <div>
                <p className="text-sm font-bold text-accent">از سال ۱۳۹۰ تا امروز</p>
                <h2 className="mt-3 text-2xl font-black leading-10 sm:text-3xl">
                  تجربه‌ای که از دل کوه و طبیعت آمده است
                </h2>
                <div className="mt-6 space-y-5 text-sm leading-8 text-secondary-foreground/85 sm:text-base sm:leading-9">
                  <p>
                    زریوان فعالیت خود را از سال ۱۳۹۰ در عرصه تأمین محصولات ورزشی و کوهنوردی آغاز کرد؛ از سنگ‌نوردی و غارنوردی گرفته تا دوچرخه‌سواری کوهستان و دیگر تجهیزات تخصصی طبیعت‌گردی.
                  </p>
                  <p>
                    در طول این سال‌ها، با شناخت دقیق نیازهای ورزشکاران و علاقه‌مندان به طبیعت، تلاش کرده‌ایم مجموعه‌ای از اکسسوری‌های کاربردی و ابزارآلات فنی درجه‌یک بازار ایران را با وسواس و دقت در اختیار شما قرار دهیم.
                  </p>
                  <p>
                    برای ما رضایت مشتری فقط یک شعار نیست؛ زریوان همواره کوشیده است با ارائه محصولاتی باکیفیت و دارای ضمانت اصالت، اعتماد شما را به تجربه‌ای ماندگار تبدیل کند.
                  </p>
                </div>
              </div>

              <div className="mx-auto flex size-44 items-center justify-center rounded-full border border-accent/55 bg-background/10 p-4 shadow-xl shadow-black/15 sm:size-52">
                <Image src="/images/zaryvan-logo.png" alt="لوگوی زریوان" width={208} height={208} className="size-full rounded-full object-contain" priority />
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["تجربه و تخصص", "بیش از یک دهه همراهی با جامعه ورزش و طبیعت‌گردی"],
              ["انتخاب مطمئن", "تمرکز بر کیفیت، کاربرد و اصالت کالا"],
              ["همراه شما", "تلاش برای ساختن تجربه‌ای بهتر پیش از خرید و پس از آن"],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="mt-3 font-black">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              مشاهده محصولات زریوان
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

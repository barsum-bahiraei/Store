import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: "همکاری با ما",
  description: "همکاری مربیان، تورلیدرها و همراهان جامعه ورزش و طبیعت‌گردی با فروشگاه زریوان.",
};

const audiences = [
  {
    icon: "fitness_center",
    title: "مربیان باشگاه",
    description: "اگر با ورزشکاران و علاقه‌مندان به کوه و طبیعت در ارتباط هستید، می‌توانید زریوان را به اعضای باشگاه خود معرفی کنید.",
  },
  {
    icon: "hiking",
    title: "تورلیدرها",
    description: "اگر برگزارکننده تورهای طبیعت‌گردی و برنامه‌های کوه‌نوردی هستید، این همکاری می‌تواند همراهان شما را به تجهیزات مناسب نزدیک‌تر کند.",
  },
  {
    icon: "diversity_3",
    title: "همراهان زریوان",
    description: "اگر به هر شکلی می‌توانید زریوان را به دوستان و جامعه اطراف خود معرفی کنید، از گفت‌وگو با شما خوشحال می‌شویم.",
  },
] as const;

const steps = [
  ["۰۱", "با ما تماس بگیرید", "از طریق صفحه ارتباط با ما، موضوع همکاری و زمینه فعالیت خود را برای تیم پشتیبانی توضیح دهید."],
  ["۰۲", "جامعه خود را معرفی کنید", "درباره باشگاه، تورها یا جمع دوستانی که با آن‌ها در ارتباط هستید، اطلاعات بیشتری در اختیار ما قرار دهید."],
  ["۰۳", "باشگاه مشتریان خود را بسازید", "با معرفی دوستانتان، باشگاه مشتریان اختصاصی خود را شکل دهید و از مزایای همکاری با فروشگاه زریوان برخوردار شوید."],
] as const;

export default function CooperationPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />

      <main className="relative isolate flex-1 overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-50" />
        <div className="mx-auto w-full max-w-6xl">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.18em] text-primary">همکاری با زریوان</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              با هم، مسیرهای بیشتری را فتح می‌کنیم
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              اگر مربی باشگاه، تورلیدر یا یکی از همراهان فعال جامعه ورزش و طبیعت‌گردی هستید و می‌توانید زریوان را به دوستانتان معرفی کنید، مشتاق گفت‌وگو با شما هستیم.
            </p>
          </header>

          <section className="relative mt-12 overflow-hidden rounded-3xl border border-primary/35 bg-secondary/95 p-6 text-secondary-foreground shadow-2xl shadow-primary-shadow sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full border-[2.5rem] border-accent/20" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full border-[3.5rem] border-primary/20" aria-hidden="true" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-center">
              <div>
                <p className="text-sm font-bold text-accent">یک همکاری دوطرفه و ماندگار</p>
                <h2 className="mt-3 text-2xl font-black leading-10 sm:text-3xl">
                  باشگاه مشتریان خودتان را با زریوان بسازید
                </h2>
                <p className="mt-5 text-sm leading-8 text-secondary-foreground/85 sm:text-base sm:leading-9">
                  شما می‌توانید با معرفی دوستان، ورزشکاران و همراهانتان، باشگاه مشتریان اختصاصی خود را شکل دهید. این همکاری فرصتی است تا جامعه شما راحت‌تر به تجهیزات کمپینگ و کوه‌نوردی دسترسی داشته باشد و شما نیز از مزایای فروشگاه زریوان بهره‌مند شوید.
                </p>
                <p className="mt-4 text-sm leading-8 text-secondary-foreground/70 sm:text-base">
                  برای آشنایی با شیوه همکاری و دریافت جزئیات، کافی است با تیم پشتیبانی ما در تماس باشید.
                </p>

                <Link href="/contact" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow outline-none transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary">
                  <span className="material-symbols-rounded" aria-hidden="true">support_agent</span>
                  ارتباط با تیم پشتیبانی
                </Link>
              </div>

              <div className="grid gap-3">
                {audiences.map((audience) => (
                  <article key={audience.title} className="rounded-2xl border border-accent/30 bg-background/10 p-5 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                        <span className="material-symbols-rounded text-2xl" aria-hidden="true">{audience.icon}</span>
                      </span>
                      <div>
                        <h3 className="font-black">{audience.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-secondary-foreground/75">{audience.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="cooperation-steps-title" className="mt-8">
            <div className="text-center">
              <p className="text-sm font-bold text-primary">شروع همکاری</p>
              <h2 id="cooperation-steps-title" className="mt-2 text-2xl font-black sm:text-3xl">سه قدم تا همراهی با زریوان</h2>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <article key={number} className="rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-primary-shadow">
                  <span className="text-3xl font-black text-primary/35">{number}</span>
                  <h3 className="mt-3 text-lg font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-10 text-center">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary bg-surface px-6 text-sm font-black text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              رفتن به صفحه ارتباط با ما
              <span className="material-symbols-rounded" aria-hidden="true">arrow_back</span>
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

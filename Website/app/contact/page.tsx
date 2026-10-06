import type { Metadata } from "next";
import Link from "next/link";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreLocationMap } from "@/features/layout/components/store-location-map";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با لوازم کمپ و کوه‌نوردی زریوان.",
};

const neshanMapUrl = "https://neshan.org/maps/share/37.250805015534795,55.1845741520782";

const socialLinks = [
  { label: "تلگرام", icon: "send", href: "https://t.me/" },
  { label: "اینستاگرام", icon: "photo_camera", href: "https://instagram.com/" },
  { label: "بله", icon: "forum", href: "https://bale.ai/" },
] as const;

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />

      <main className="relative isolate flex-1 overflow-hidden px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_68%)] opacity-45" />
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.18em] text-primary">ارتباط با زریوان</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">همیشه در کنار شما هستیم</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              برای پیگیری سفارش، دریافت راهنمایی یا آشنایی بیشتر با محصولات، از راه‌های ارتباطی زیر با ما در تماس باشید.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <section className="relative overflow-hidden rounded-3xl border border-primary/35 bg-secondary/90 p-6 text-secondary-foreground shadow-2xl shadow-primary-shadow backdrop-blur-xl sm:p-10">
              <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full border-[2rem] border-accent/20" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-sm font-bold text-accent">راه‌های ارتباطی</p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">ما را در شبکه‌های اجتماعی دنبال کنید</h2>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {socialLinks.map((social) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-accent/35 bg-background/10 px-2 text-center transition-[transform,background-color,border-color] hover:-translate-y-1 hover:border-accent hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                      <span className="material-symbols-rounded text-3xl text-accent transition-transform group-hover:scale-110" aria-hidden="true">{social.icon}</span>
                      <span className="text-xs font-bold">{social.label}</span>
                    </a>
                  ))}
                </div>

                <div className="mt-8 space-y-4 border-t border-secondary-foreground/15 pt-6">
                  <ContactRow icon="location_on" label="کد پستی" value="۴۹۷۹۱۴۶۱۳۱" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ContactRow icon="phone_iphone" label="شماره همراه" value="۰۹۳۰۶۸۱۵۸۵۸" href="tel:09306815858" />
                    <ContactRow icon="phone" label="شماره ثابت" value="۰۱۷۳۳۵۵۲۱۱۰" href="tel:01733552110" />
                  </div>
                  <ContactRow icon="schedule" label="ساعت کاری" value={<>شنبه تا پنج‌شنبه: ۸ صبح تا ۹ شب<br />جمعه: ۱۱ صبح تا ۹ شب</>} />
                </div>
              </div>
            </section>

            <section className="relative flex min-h-[25rem] flex-col overflow-hidden rounded-3xl border border-accent/65 bg-accent/20 p-6 shadow-2xl shadow-primary-shadow backdrop-blur-xl sm:p-10">
              <div className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full border-[3rem] border-primary/20" aria-hidden="true" />
              <div className="relative z-10 flex flex-1 flex-col">
                <p className="text-sm font-bold text-primary">موقعیت زریوان</p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">لوکیشن فروشگاه</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                  آدرس دقیق فروشگاه را روی نقشه پیدا کنید و برای مسیریابی، آن را در برنامهٔ نشان باز کنید.
                </p>

                <div className="my-8 min-h-64 flex-1 overflow-hidden rounded-2xl border border-primary/35 bg-background/45 p-1.5 text-center">
                  <StoreLocationMap />
                </div>

                <a href={neshanMapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <span className="material-symbols-rounded" aria-hidden="true">map</span>
                  باز کردن در نشان
                </a>
              </div>
            </section>
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

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: React.ReactNode; href?: string }) {
  const content = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/35 bg-background/10 text-accent">
        <span className="material-symbols-rounded" aria-hidden="true">{icon}</span>
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-secondary-foreground/65">{label}</span>
        <span className="mt-1 block text-sm font-black leading-7">{value}</span>
      </span>
    </>
  );

  return href ? <a href={href} className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent">{content}</a> : <div className="flex items-center gap-3">{content}</div>;
}

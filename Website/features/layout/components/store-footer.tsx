import Link from "next/link";
import Image from "next/image";

const trustSealImage = "https://Trustseal.eNamad.ir/logo.aspx?id=261898&Code=fAmxCvuhBi7lav0BUQhk";
const trustSealLink = "https://trustseal.enamad.ir/?id=261898&Code=fAmxCvuhBi7lav0BUQhk";
const storeBenefits = [
  { icon: "local_shipping", title: "تحویل اکسپرس", description: "در کمترین زمان" },
  { icon: "support_agent", title: "پشتیبانی ۲۴ ساعته", description: "پشتیبانی هفت روز هفته" },
  { icon: "timer", title: "۷ روز ضمانت بازگشت", description: "هفت روز مهلت دارید" },
  { icon: "verified", title: "ضمانت اصالت کالا", description: "تأیید اصالت کالا" },
] as const;

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground">
      <section aria-label="مزایای خرید از زریوان" className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
        {storeBenefits.map((benefit) => (
          <div key={benefit.title} className="flex min-h-24 items-center justify-center gap-4 rounded-xl border border-white/20 bg-secondary/70 px-4 py-4 text-secondary-foreground shadow-sm lg:px-5">
            <span className="material-symbols-rounded shrink-0 text-4xl text-primary-foreground" aria-hidden="true">{benefit.icon}</span>
            <span className="text-right">
              <span className="block text-sm font-black">{benefit.title}</span>
              <span className="mt-1 block text-xs leading-5 text-secondary-foreground/75">{benefit.description}</span>
            </span>
          </div>
        ))}
      </section>
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-12">
        <div className="max-w-3xl">
          <Link href="/" aria-label="خانه فروشگاه" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Image src="/images/zaryvan-logo.png" alt="" width={48} height={48} className="size-12 rounded-full object-contain" />
            <span className="text-lg font-black tracking-[-0.04em]">لوازم کمپ و کوه‌نوردی زریوان</span>
          </Link>
          <p className="mt-3 text-sm leading-8 text-muted-foreground">
            مجموعه زریوان فروشگاه عرضه حضوری و مجازی محصولات متنوع کوهنوردی، طبیعت گردی و لوازم سنگ نوردی و دره نوردی با قیمت بسیار مناسب و کیفیت مطلوب است. هدف ما فراهم سازی بستری مطمئن جهت خرید آسان و با رضایت و اطمینان خاطر کامل مشتریان عزیز می باشد
          </p>
          <p className="mt-5 text-xl font-black leading-9 text-foreground sm:text-2xl">
            زریوان از منزل تا قله همراه شماست.
          </p>
        </div>

        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noreferrer"
          href={trustSealLink}
          aria-label="مشاهده نماد اعتماد الکترونیکی زریوان"
          className="mx-auto inline-flex min-h-32 min-w-32 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring md:mx-0"
        >
          <Image
            unoptimized
            referrerPolicy="origin"
            src={trustSealImage}
            alt="نماد اعتماد الکترونیکی زریوان"
            width={120}
            height={120}
            id="fAmxCvuhBi7lav0BUQhk"
            className="max-h-32 w-auto cursor-pointer object-contain"
          />
        </a>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">
        تمامی حقوق برای لوازم کمپ و کوه‌نوردی زریوان محفوظ است.
      </div>
    </footer>
  );
}

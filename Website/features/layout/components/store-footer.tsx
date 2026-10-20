import Link from "next/link";
import Image from "next/image";
import { socialLinks, whatsappSupportNumber, whatsappSupportUrl } from "../utils/social-links";

const trustSealImage = "/images/enamad.png";
const trustSealLink = "https://trustseal.enamad.ir/?id=261898&code=fAmxCvuhBi7lav0BUQhk";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,1fr)_auto] lg:items-start lg:px-12">
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

        <section aria-labelledby="footer-contact-title" className="min-w-0">
          <h2 id="footer-contact-title" className="text-lg font-black">پشتیبانی و راه‌های ارتباطی</h2>
          <div className="mt-4 space-y-1 text-sm">
            <a href="tel:09306815858" className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="text-muted-foreground">شماره همراه</span><span dir="ltr" className="font-bold">۰۹۳۰۶۸۱۵۸۵۸</span></a>
            <a href="tel:01733552110" className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="text-muted-foreground">شماره ثابت</span><span dir="ltr" className="font-bold">۰۱۷۳۳۵۵۲۱۱۰</span></a>
            <a href={whatsappSupportUrl} target="_blank" rel="noreferrer" className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="text-muted-foreground">پشتیبانی واتساپ</span><span dir="ltr" className="font-bold">{whatsappSupportNumber}</span></a>
          </div>
          <p className="mt-4 px-2 text-xs leading-6 text-muted-foreground">شنبه تا پنج‌شنبه: ۸ صبح تا ۹ شب<br />جمعه: ۱۱ صبح تا ۹ شب</p>
          <nav aria-label="شبکه‌های اجتماعی زریوان" className="mt-5 grid grid-cols-4 gap-2">
            {socialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-2 text-center outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Image src={social.image} alt="" width={32} height={32} className="size-8 object-contain" /><span className="text-xs font-bold">{social.label}</span></a>)}
          </nav>
          <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-bold text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">تماس با ما<span className="material-symbols-rounded text-lg" aria-hidden="true">arrow_back</span></Link>
        </section>

        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noopener"
          href={trustSealLink}
          aria-label="مشاهده نماد اعتماد الکترونیکی زریوان"
          className="mx-auto inline-flex min-h-32 min-w-32 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-span-2 lg:col-span-1"
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

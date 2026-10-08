import Image from "next/image";
import Link from "next/link";

type Promo = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  image: string;
  imageAlt: string;
};

const promos = [
  {
    href: "/shop?category=3",
    eyebrow: "چادرهای کمپینگ",
    title: "شب را وسط طبیعت زندگی کن",
    description: "چادرت را برپا کن و هر منظره را به خانه‌ای تازه تبدیل کن.",
    action: "مشاهده چادرها",
    image: "/images/home/tent-category-promo.png",
    imageAlt: "چادر سرخپوستی در طبیعت کوهستانی کنار دریاچه",
  },
  {
    href: "/shop?category=6",
    eyebrow: "کیسه‌خواب و استراحت",
    title: "برف بیرون، آرامش اینجاست",
    description: "با کیسه‌خواب گرم و تشک بادی راحت، سرمای مسیر را پشت سر بگذار.",
    action: "مشاهده کیسه‌خواب‌ها",
    image: "/images/home/sleeping-bag-category-promo.png",
    imageAlt: "فردی آسوده داخل کیسه‌خواب روی تشک بادی در طبیعت برفی",
  },
] as const satisfies readonly Promo[];

const outdoorEssentialsPromos = [
  {
    href: "/shop?category=14",
    eyebrow: "میز و صندلی کمپینگ",
    title: "قله را به بهترین کافه دنیا تبدیل کن",
    description: "میز را باز کن، صندلی‌ات را بچین و طعم استراحت را وسط بلندترین منظره‌ها بچش.",
    action: "مشاهده میز و صندلی‌ها",
    image: "/images/home/camp-furniture-category-promo.png",
    imageAlt: "میز و صندلی‌های کمپینگ کنار دریاچه و کوهستان هنگام غروب",
  },
  {
    href: "/shop?category=16",
    eyebrow: "کوله‌پشتی‌های کوهنوردی",
    title: "همه مسیر را روی دوشت فتح کن",
    description: "کوله‌ات را ببند؛ هر چیزی که برای صعود بعدی لازم داری، آماده حرکت است.",
    action: "مشاهده کوله‌پشتی‌ها",
    image: "/images/home/backpack-category-promo.png",
    imageAlt: "کوله‌پشتی کوهنوردی حرفه‌ای روی صخره در طلوع کوهستان",
  },
] as const satisfies readonly Promo[];

function PromoGrid({ items, label }: { items: readonly Promo[]; label: string }) {
  return (
    <section aria-label={label} className="bg-background px-4 pb-10 text-white sm:px-8 sm:pb-14 lg:px-12">
      <div className="mx-auto grid w-full max-w-[1700px] gap-5 lg:grid-cols-2 lg:gap-6">
        {items.map((promo) => (
          <Link key={promo.href} href={promo.href} className="group relative block min-h-[32rem] overflow-hidden rounded-3xl border border-primary/20 shadow-xl shadow-primary-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[40rem] lg:min-h-[48rem]">
            <Image src={promo.image} alt={promo.imageAlt} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
            <span className="absolute inset-0 bg-gradient-to-b from-secondary/90 via-secondary/30 to-transparent" aria-hidden="true" />

            <span className="relative z-10 flex min-h-[32rem] items-start px-5 py-8 sm:min-h-[40rem] sm:px-9 sm:py-10 lg:min-h-[48rem] lg:px-10 lg:py-12">
              <span className="block w-full min-w-0 text-right drop-shadow-md">
                <span className="inline-flex min-h-8 items-center rounded-full border border-accent/60 bg-secondary/45 px-3 text-xs font-black text-accent backdrop-blur-sm sm:min-h-9 sm:px-4 sm:text-sm">{promo.eyebrow}</span>
                <strong className="mt-4 block whitespace-nowrap text-[clamp(1rem,2.2vw,2.25rem)] font-black leading-tight tracking-[-0.04em]">{promo.title}</strong>
                <span className="mt-3 block text-sm font-medium leading-7 text-white/85 sm:text-base">{promo.description}</span>
                <span className="mt-5 inline-flex min-h-10 items-center gap-1 rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-lg shadow-primary-shadow sm:min-h-11 sm:text-sm">
                  {promo.action}
                  <span className="material-symbols-rounded text-lg" aria-hidden="true">arrow_back</span>
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CategoryPromos() {
  return <PromoGrid items={promos} label="دسته‌بندی‌های منتخب" />;
}

export function OutdoorEssentialsPromos() {
  return <PromoGrid items={outdoorEssentialsPromos} label="تجهیزات سفر و کمپینگ" />;
}

export type HeroSlide = {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  categoryId?: number;
  href?: string;
  external?: boolean;
  linkLabel?: string;
  showInstagramLogo?: boolean;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "خرید اقساطی زریوان",
    title: "فروش چکی با ۲۵٪ پیش‌پرداخت",
    description: "باقی مبلغ را با پرداخت ۳ فقره چک پرداخت کنید و تجهیزات کمپینگ مورد نیازتان را همین امروز تهیه کنید.",
    image: "/images/home/hero-installment-camping.png",
    imageAlt: "منظره کمپینگ با چادر، کوله‌پشتی، ماگ و برگه چک",
  },
  {
    eyebrow: "تجهیزات روشنایی کمپ",
    title: "نور و روشنایی در دل طبیعت",
    description: "با چراغ‌قوه‌ها و فانوس‌های کمپینگ، مسیر و محل اقامت خود را در تاریکی شب روشن نگه دارید.",
    image: "/images/home/hero-outdoor-lighting.png",
    imageAlt: "چراغ‌قوه‌ها و فانوس‌های روشن در جنگل تاریک",
    categoryId: 72,
  },
  {
    eyebrow: "کفش‌های کوهنوردی",
    title: "فروش کفش‌های هومتو و اسنوهاک",
    description: "کفش مناسب مسیرهای برفی و پیمایش‌های طولانی را از میان مدل‌های هومتو و اسنوهاک انتخاب کنید.",
    image: "/images/home/hero-homtto-snowhawk.png",
    imageAlt: "کوهنورد در حال پیمایش مسیر برفی با منظره کوهستان",
    categoryId: 60,
  },
  {
    eyebrow: "ماگ و فلاسک‌های استنلی",
    title: "استنلی‌ات را بردار و راه بیفت!",
    description: "از اولین جرعه صبح تا آخرین توقف مسیر، مدل محبوبت را همین حالا انتخاب کن.",
    image: "/images/home/hero-stanley-drinkware.png",
    imageAlt: "چند مدل ماگ و فلاسک استنلی در منظره کوهستانی",
    categoryId: 30,
  },
  {
    eyebrow: "همراه زریوان باشید",
    title: "ما را در شبکه‌های اجتماعی دنبال کنید",
    description: "تازه‌ترین محصولات، پیشنهادها و لحظه‌های طبیعت‌گردی زریوان را در اینستاگرام دنبال کنید.",
    image: "/images/home/hero-social-media.png",
    imageAlt: "موبایل و کوله‌پشتی در منظره کوهستانی هنگام طلوع",
    href: "https://instagram.com/zaryvan.shop",
    external: true,
    linkLabel: "مشاهده صفحه اینستاگرام زریوان",
    showInstagramLogo: true,
  },
];

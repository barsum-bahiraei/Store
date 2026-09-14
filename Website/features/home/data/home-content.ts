export type HeroSlide = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    title: "زمان، به سبک شما.",
    description: "اکسسوری‌های کاربردی برای هر برنامه، از شروع صبح تا پایان شب.",
    image: "/images/home/hero-watch.jpg",
    imageAlt: "ساعت مچی مینیمال روی سطحی ساده",
  },
  {
    title: "قدم‌های تازه از اینجا شروع می‌شوند.",
    description: "کفش‌های فصل جدید برای راحتی و انرژی بیشتر در هر روز.",
    image: "/images/home/hero-sneaker.jpg",
    imageAlt: "کفش ورزشی قرمز با پس‌زمینه هماهنگ",
  },
  {
    title: "صدای روزمره را بهتر بشنوید.",
    description: "صدایی فراگیر و راحتی ماندگار برای کار، سفر و تمام لحظه‌های بین آن‌ها.",
    image: "/images/home/hero-headphones.jpg",
    imageAlt: "هدفون مشکی روی پس‌زمینه زرد گرم",
  },
];

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { A11y, Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { heroSlides, type HeroSlide } from "../data/home-content";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function InstagramLogo() {
  return (
    <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] shadow-lg sm:size-16" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-8 fill-none stroke-white sm:size-9" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.7" r="1" className="fill-white stroke-none" />
      </svg>
    </span>
  );
}

function HeroSlideLink({ slide }: { slide: HeroSlide }) {
  const href = slide.href ?? (slide.categoryId ? `/shop?category=${slide.categoryId}` : null);
  if (!href) return null;

  const className = "absolute inset-0 z-20 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";
  const ariaLabel = slide.linkLabel ?? `مشاهده محصولات ${slide.title}`;

  return slide.external
    ? <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className={className} />
    : <Link href={href} aria-label={ariaLabel} className={className} />;
}

export function HeroSlider() {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    () => false,
  );

  return (
    <section aria-label="مجموعه‌های ویژه" className="relative w-full overflow-hidden bg-secondary">
      <Swiper
        modules={[A11y, Autoplay, Keyboard, Pagination]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        loop
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        autoplay={prefersReducedMotion ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        a11y={{ prevSlideMessage: "پیشنهاد قبلی", nextSlideMessage: "پیشنهاد بعدی" }}
        className="[--swiper-pagination-bullet-inactive-color:var(--foreground)] [--swiper-pagination-bullet-inactive-opacity:0.25] [--swiper-pagination-color:var(--accent)] [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination-bullet]:size-2 [&_.swiper-pagination-bullet]:transition-[width,background-color] [&_.swiper-pagination-bullet-active]:w-7 [&_.swiper-pagination-bullet-active]:rounded-full"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.title}>
            <article className="relative min-h-[20rem] overflow-hidden bg-secondary text-white sm:min-h-[31rem] lg:min-h-[29rem]">
              <Image src={slide.image} alt={slide.imageAlt} fill priority={index === 0} sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-secondary/45 sm:bg-gradient-to-r sm:from-secondary/90 sm:via-secondary/55 sm:to-transparent" aria-hidden="true" />
              <HeroSlideLink slide={slide} />

              <div className="relative z-10 flex min-h-[20rem] items-center px-5 pb-14 pt-8 sm:min-h-[31rem] sm:px-20 sm:pb-16 sm:pt-12 lg:min-h-[29rem] lg:px-24 xl:px-[max(6rem,calc((100vw-80rem)/2))]">
                <div className="mr-auto max-w-md text-right drop-shadow-md">
                  {slide.showInstagramLogo ? <InstagramLogo /> : null}
                  {slide.eyebrow ? (
                    <span className="inline-flex min-h-8 items-center rounded-full border border-accent/60 bg-secondary/45 px-3 text-xs font-black text-accent backdrop-blur-sm sm:min-h-9 sm:px-4 sm:text-sm">{slide.eyebrow}</span>
                  ) : (
                    <span className="block h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
                  )}
                  <h1 className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] sm:mt-5 sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mt-3 line-clamp-3 max-w-sm text-xs font-medium leading-5 text-white/85 sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7">
                    {slide.description}
                  </p>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between sm:flex lg:inset-x-8">
        <button type="button" onClick={() => swiperRef.current?.slidePrev()} aria-label="پیشنهاد قبلی" className="pointer-events-auto grid size-11 place-items-center rounded-full border border-border bg-surface/90 text-foreground outline-none backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
        </button>
        <button type="button" onClick={() => swiperRef.current?.slideNext()} aria-label="پیشنهاد بعدی" className="pointer-events-auto grid size-11 place-items-center rounded-full border border-border bg-surface/90 text-foreground outline-none backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <span className="material-symbols-rounded" aria-hidden="true">arrow_back</span>
        </button>
      </div>
    </section>
  );
}

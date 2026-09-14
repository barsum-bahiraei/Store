"use client";

import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { A11y, Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { heroSlides } from "../data/home-content";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia(reducedMotionQuery).matches;
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
            <article className="grid min-h-[31rem] bg-secondary text-secondary-foreground lg:min-h-[29rem] lg:grid-cols-[0.72fr_1.28fr]">
              <div className="relative z-10 flex items-center px-5 pb-14 pt-9 sm:px-10 lg:px-12 lg:py-14 xl:pl-16 xl:pr-[max(3rem,calc((100vw-80rem)/2))]">
                <div className="max-w-md">
                  <span className="block h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
                  <h1 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {slide.description}
                  </p>
                </div>
              </div>

              <div className="relative order-first min-h-64 overflow-hidden lg:order-none lg:min-h-full">
                <Image src={slide.image} alt={slide.imageAlt} fill priority={index === 0} sizes="(max-width: 1023px) 100vw, 60vw" className="object-cover" />
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute left-5 top-5 z-20 hidden gap-2 sm:flex lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col">
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

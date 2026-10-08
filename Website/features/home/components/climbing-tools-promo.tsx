import Image from "next/image";
import Link from "next/link";

export function ClimbingToolsPromo() {
  return (
    <section aria-label="ابزارهای صعود" className="bg-background px-4 pb-10 text-white sm:px-8 sm:pb-14 lg:px-12">
      <div className="mx-auto w-full max-w-[1700px]">
      <Link href="/shop?category=41" className="group relative block min-h-64 w-full overflow-hidden rounded-3xl border border-primary/20 shadow-xl shadow-primary-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-80 lg:min-h-96">
        <Image src="/images/home/climbing-tools-promo.png" alt="کارابین و طناب گره‌خورده در مسیر صعود کوهستانی" fill sizes="(max-width: 1700px) 100vw, 1700px" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        <span className="absolute inset-0 bg-secondary/45 sm:bg-gradient-to-r sm:from-secondary/90 sm:via-secondary/55 sm:to-transparent" aria-hidden="true" />

        <span className="relative z-10 flex min-h-64 items-center px-5 py-8 sm:min-h-80 sm:px-12 lg:min-h-96 lg:px-16">
          <span className="mr-auto block max-w-lg text-right drop-shadow-md">
            <span className="inline-flex min-h-8 items-center rounded-full border border-accent/60 bg-secondary/45 px-3 text-xs font-black text-accent backdrop-blur-sm sm:min-h-9 sm:px-4 sm:text-sm">ابزارهای صعود</span>
            <strong className="mt-4 block text-2xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">هر گره، شروع یک صعود تازه</strong>
            <span className="mt-3 block max-w-md text-sm font-medium leading-7 text-white/85 sm:text-base">با طناب و کارابین مطمئن، قدم بعدی را محکم‌تر بردار.</span>
            <span className="mt-5 inline-flex min-h-10 items-center gap-1 rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-lg shadow-primary-shadow sm:min-h-11 sm:text-sm">
              مشاهده ابزارهای صعود
              <span className="material-symbols-rounded text-lg" aria-hidden="true">arrow_back</span>
            </span>
          </span>
        </span>
      </Link>
      </div>
    </section>
  );
}

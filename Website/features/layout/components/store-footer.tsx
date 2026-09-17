import Link from "next/link";

const footerLinks = [
  { href: "/", label: "خانه" },
  { href: "/search", label: "محصولات" },
  { href: "/cart", label: "سبد خرید" },
  { href: "/account", label: "حساب من" },
] as const;

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
        <div className="max-w-md">
          <Link href="/" aria-label="خانه فروشگاه" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="material-symbols-rounded text-2xl" aria-hidden="true">storefront</span>
            </span>
            <span className="text-lg font-black tracking-[-0.04em]">فروشگاه<span className="text-accent">.</span></span>
          </Link>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">محلی برای پیدا کردن و خرید محصولات مورد نیاز شما.</p>
        </div>

        <nav aria-label="پیوندهای پایین صفحه">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center rounded-lg text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">
        تمامی حقوق برای فروشگاه محفوظ است.
      </div>
    </footer>
  );
}

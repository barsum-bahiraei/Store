import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-secondary p-12 text-secondary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative z-10 flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="material-symbols-rounded" aria-hidden="true">storefront</span>
          </span>
          <span className="text-lg font-black tracking-[-0.04em]">فروشگاه.</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="material-symbols-rounded mb-6 text-5xl text-primary" aria-hidden="true">local_mall</span>
          <p className="text-4xl font-black leading-tight tracking-[-0.05em]">
            راهی ساده‌تر برای پیدا کردن چیزهایی که دوست دارید.
          </p>
          <p className="mt-5 max-w-md text-sm leading-7 text-secondary-foreground/70">
            وارد شوید تا تجربه خریدی سریع، شخصی و یکپارچه داشته باشید.
          </p>
        </div>

        <p className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground/50">
          انتخاب بهتر، خرید آسان‌تر
        </p>
        <div className="absolute -bottom-32 -right-28 size-96 rounded-full border-[5rem] border-primary/15" aria-hidden="true" />
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
            <span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
            بازگشت به فروشگاه
          </Link>
          <div className="mb-8">
            <p className="mb-3 text-xs font-black tracking-[0.15em] text-primary">حساب کاربری شما</p>
            <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h1>
            <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

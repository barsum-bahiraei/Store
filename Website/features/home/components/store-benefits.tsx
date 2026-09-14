const benefits = [
  { icon: "local_shipping", title: "ارسال سریع", detail: "تحویل مطمئن سفارش‌ها" },
  { icon: "verified_user", title: "خرید امن", detail: "پرداخت محافظت‌شده" },
  { icon: "assignment_return", title: "بازگشت آسان", detail: "فرایند ساده مرجوعی" },
  { icon: "support_agent", title: "پشتیبانی واقعی", detail: "همراه شما در خرید" },
] as const;

export function StoreBenefits() {
  return (
    <section aria-label="مزایای خرید" className="border-y border-border bg-surface px-5 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex items-center gap-3 border-border px-2 py-6 even:border-l sm:px-5 lg:border-l lg:first:border-l-0">
            <span className="material-symbols-rounded text-2xl text-accent" aria-hidden="true">{benefit.icon}</span>
            <div><h2 className="text-sm font-black">{benefit.title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{benefit.detail}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

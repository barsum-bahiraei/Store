import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: "نتیجه پرداخت | فروشگاه",
  robots: { index: false, follow: false },
};

export default async function PaymentResultPage({ searchParams }: PageProps<"/payment-result">) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const invoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const successful = status === "success";
  const pending = status === "pending";
  const icon = successful ? "check_circle" : pending ? "hourglass_top" : "cancel";
  const title = successful ? "پرداخت با موفقیت انجام شد" : pending ? "پرداخت در حال بررسی است" : "پرداخت ناموفق بود";
  const description = successful
    ? "تراکنش توسط بانک تأیید و تسویه شد."
    : pending
      ? "نتیجه قطعی بانک هنوز دریافت نشده است. سفارش تا مشخص‌شدن وضعیت پردازش نمی‌شود."
      : "وجهی برای این سفارش تأیید نشده است. در صورت کسر وجه، بازگشت آن مطابق فرایند بانکی انجام می‌شود.";
  const color = successful ? "text-success" : pending ? "text-warning" : "text-error";

  return (
    <>
      <StoreHeader />
      <main className="mx-auto grid w-full max-w-4xl flex-1 place-items-center px-4 py-14 text-foreground sm:px-8">
        <section className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-7 text-center sm:p-12">
          <span className={`material-symbols-rounded text-7xl ${color}`} aria-hidden="true">{icon}</span>
          <h1 className="mt-5 text-2xl font-black sm:text-3xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">{description}</p>
          {invoiceId && <p className="mt-5 rounded-xl bg-muted p-3 text-sm font-bold">شماره سفارش: {Number(invoiceId).toLocaleString("fa-IR")}</p>}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/account?tab=orders" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground">مشاهده سفارش‌ها</Link>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm font-black">بازگشت به فروشگاه</Link>
          </div>
        </section>
      </main>
      <StoreFooter />
    </>
  );
}

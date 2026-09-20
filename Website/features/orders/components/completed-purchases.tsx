"use client";

import { formatToman } from "@/features/products/utils/product";
import { useInvoices } from "../hooks/use-invoices";
import { DeliveryMethod, PaymentMethod } from "../types/invoice";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "نقدی",
  [PaymentMethod.Online]: "آنلاین",
  [PaymentMethod.Check]: "چک",
};
const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  [DeliveryMethod.Pickup]: "تحویل حضوری",
  [DeliveryMethod.Delivery]: "ارسال به نشانی",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "تاریخ نامشخص" : dateFormatter.format(date);
}

function OrdersSkeleton() {
  return (
    <div className="grid gap-4" aria-label="در حال بارگذاری سفارش‌ها">
      {[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-xl border border-border bg-muted" />)}
    </div>
  );
}

export function OrdersList() {
  const { data: invoices = [], isLoading, isError, error, refetch, isFetching } = useInvoices();

  if (isLoading) return <OrdersSkeleton />;

  if (isError) {
    return (
      <div role="alert" className="rounded-xl border border-border bg-surface p-6 text-center">
        <span className="material-symbols-rounded text-4xl text-error" aria-hidden="true">receipt_long</span>
        <p className="mt-3 font-black">سفارش‌های شما بارگذاری نشد</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          {isFetching ? "در حال تلاش…" : "تلاش دوباره"}
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">shopping_bag</span>
        <p className="mt-4 font-black">هنوز سفارشی ندارید</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">پس از ثبت سفارش، اطلاعات آن در این بخش نمایش داده می‌شود.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {invoices.map((invoice) => (
        <li key={invoice.id}>
          <article className="overflow-hidden rounded-xl border border-border bg-surface">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h3 className="font-black">سفارش شماره {invoice.id}</h3>
              <time dateTime={invoice.createdAt} className="text-xs font-bold text-muted-foreground">{formatDate(invoice.createdAt)}</time>
            </header>
            <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-bold text-muted-foreground">مبلغ کل</dt>
                <dd className="mt-1 font-black text-primary">{formatToman(invoice.totalPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-muted-foreground">تعداد کالا</dt>
                <dd className="mt-1 font-black">{invoice.totalCount.toLocaleString("fa-IR")}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-muted-foreground">روش پرداخت</dt>
                <dd className="mt-1 font-black">{paymentMethodLabels[invoice.paymentMethod] ?? "نامشخص"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-muted-foreground">روش تحویل</dt>
                <dd className="mt-1 font-black">{deliveryMethodLabels[invoice.deliveryMethod] ?? "نامشخص"}</dd>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <dt className="text-xs font-bold text-muted-foreground">نشانی تحویل</dt>
                <dd className="mt-1 text-sm font-bold leading-7">{invoice.address || "ثبت نشده"}</dd>
              </div>
            </dl>
          </article>
        </li>
      ))}
    </ul>
  );
}

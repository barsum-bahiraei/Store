"use client";

import { useEffect } from "react";
import { formatToman } from "@/features/products/utils/product";
import { useInvoices } from "../hooks/use-invoices";
import { useRetryPayment } from "../hooks/use-retry-payment";
import { DeliveryMethod, PaymentMethod, PaymentStatus } from "../types/invoice";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "نقدی",
  [PaymentMethod.Online]: "آنلاین",
  [PaymentMethod.Check]: "چک",
};
const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  [DeliveryMethod.Pickup]: "تحویل حضوری",
  [DeliveryMethod.Chapar]: "ارسال با چاپار",
  [DeliveryMethod.Tipax]: "ارسال با تیپاکس",
  [DeliveryMethod.Post]: "ارسال با پست",
};
const paymentStatusDetails: Record<PaymentStatus, { label: string; className: string }> = {
  [PaymentStatus.New]: { label: "سفارش ثبت شده", className: "bg-muted text-foreground" },
  [PaymentStatus.ProcessingPayment]: { label: "در حال پرداخت", className: "bg-warning/10 text-warning" },
  [PaymentStatus.PaymentCompleted]: { label: "پرداخت موفق", className: "bg-success/10 text-success" },
  [PaymentStatus.Preparing]: { label: "در حال آماده‌سازی", className: "bg-primary/10 text-primary" },
  [PaymentStatus.ReadyForShipment]: { label: "آماده ارسال", className: "bg-primary/10 text-primary" },
  [PaymentStatus.Shipping]: { label: "در حال ارسال", className: "bg-primary/10 text-primary" },
  [PaymentStatus.Delivered]: { label: "تحویل مشتری", className: "bg-success/10 text-success" },
  [PaymentStatus.Cancelled]: { label: "لغو شده", className: "bg-muted text-muted-foreground" },
  [PaymentStatus.Failed]: { label: "پرداخت ناموفق", className: "bg-error/10 text-error" },
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
  const retryPayment = useRetryPayment();

  useEffect(() => {
    if (!retryPayment.data?.refId || !retryPayment.data.gatewayUrl) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = retryPayment.data.gatewayUrl;
    const refId = document.createElement("input");
    refId.type = "hidden";
    refId.name = "RefId";
    refId.value = retryPayment.data.refId;
    form.appendChild(refId);
    document.body.appendChild(form);
    form.submit();

    return () => form.remove();
  }, [retryPayment.data]);

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
      {invoices.map((invoice) => {
        const status = paymentStatusDetails[invoice.paymentStatus];
        const isRetrying = retryPayment.isPending && retryPayment.variables === invoice.id;
        return (
          <li key={invoice.id}>
            <article className="overflow-hidden rounded-xl border border-border bg-surface">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-black">سفارش شماره {invoice.id}</h3>
                  <span aria-label={`وضعیت سفارش: ${status?.label ?? "نامشخص"}`} className={`rounded-full px-3 py-1 text-xs font-black ${status?.className ?? "bg-muted text-muted-foreground"}`}>{status?.label ?? "نامشخص"}</span>
                </div>
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
              {invoice.canRetryPayment && (
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
                  <p className="text-xs font-bold text-muted-foreground">مهلت پرداخت تا {formatDate(invoice.expiresAt!)}</p>
                  <button type="button" onClick={() => retryPayment.mutate(invoice.id)} disabled={retryPayment.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <span className={`material-symbols-rounded ${isRetrying ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true">{isRetrying ? "progress_activity" : "credit_card"}</span>
                    {isRetrying ? "در حال انتقال…" : "پرداخت مجدد"}
                  </button>
                </footer>
              )}
            </article>
          </li>
        );
      })}
      {retryPayment.isError && <li role="alert" className="rounded-xl bg-error/10 p-4 text-sm font-bold text-error">{retryPayment.error.message}</li>}
    </ul>
  );
}

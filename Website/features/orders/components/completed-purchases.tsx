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
    <div className="grid gap-6" aria-label="در حال بارگذاری سفارش‌ها">
      {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-primary-shadow"><div className="h-24 bg-secondary/20" /></div>)}
    </div>
  );
}

function OrderDetail({ icon, label, value, accent = false }: { icon: string; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-border py-4 lg:border-b-0">
      <span className="material-symbols-rounded mt-0.5 text-xl text-primary" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
        <dd className={`mt-1 break-words font-black ${accent ? "text-primary" : "text-foreground"}`}>{value}</dd>
      </div>
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
      <div role="alert" className="rounded-3xl border border-border bg-surface p-8 text-center shadow-xl shadow-primary-shadow">
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
      <div className="overflow-hidden rounded-3xl border border-border bg-surface text-center shadow-xl shadow-primary-shadow">
        <div className="bg-secondary px-6 py-8 text-secondary-foreground">
          <span className="material-symbols-rounded text-5xl" aria-hidden="true">shopping_bag</span>
        </div>
        <div className="px-6 py-10">
        <p className="mt-4 font-black">هنوز سفارشی ندارید</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">پس از ثبت سفارش، اطلاعات آن در این بخش نمایش داده می‌شود.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-6">
      {invoices.map((invoice) => {
        const status = paymentStatusDetails[invoice.paymentStatus];
        const isRetrying = retryPayment.isPending && retryPayment.variables === invoice.id;
        return (
          <li key={invoice.id}>
            <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-primary-shadow">
              <header className="flex flex-col gap-4 bg-secondary px-5 py-5 text-secondary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="material-symbols-rounded grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-2xl text-primary-foreground" aria-hidden="true">receipt_long</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black">سفارش شماره {invoice.id}</h3>
                    <time dateTime={invoice.createdAt} className="mt-1 flex items-center gap-1.5 text-xs font-bold text-secondary-foreground/70"><span className="material-symbols-rounded text-base" aria-hidden="true">calendar_today</span>{formatDate(invoice.createdAt)}</time>
                  </div>
                </div>
                <span aria-label={`وضعیت سفارش: ${status?.label ?? "نامشخص"}`} className={`w-fit rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset ring-current/10 ${status?.className ?? "bg-muted text-muted-foreground"}`}>{status?.label ?? "نامشخص"}</span>
              </header>
              <dl className="grid gap-x-6 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                <OrderDetail icon="payments" label="مبلغ کل" value={formatToman(invoice.totalPrice)} accent />
                <OrderDetail icon="inventory_2" label="تعداد کالا" value={invoice.totalCount.toLocaleString("fa-IR")} />
                <OrderDetail icon="credit_card" label="روش پرداخت" value={paymentMethodLabels[invoice.paymentMethod] ?? "نامشخص"} />
                <OrderDetail icon="local_shipping" label="روش تحویل" value={deliveryMethodLabels[invoice.deliveryMethod] ?? "نامشخص"} />
                <div className="my-5 flex min-w-0 gap-3 rounded-2xl bg-muted p-4 sm:col-span-2 lg:col-span-4">
                  <span className="material-symbols-rounded mt-0.5 text-xl text-primary" aria-hidden="true">location_on</span>
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-muted-foreground">نشانی تحویل</dt>
                    <dd className="mt-1 break-words text-sm font-bold leading-7">{invoice.address || "ثبت نشده"}</dd>
                  </div>
                </div>
              </dl>
              {invoice.canRetryPayment && (
                <footer className="flex flex-col gap-3 border-t border-border bg-muted/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><span className="material-symbols-rounded text-lg text-warning" aria-hidden="true">schedule</span>مهلت پرداخت تا {formatDate(invoice.expiresAt!)}</p>
                  <button type="button" onClick={() => retryPayment.mutate(invoice.id)} disabled={retryPayment.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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

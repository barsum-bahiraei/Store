import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { SellerOrderDetail, VariantValueOutput } from "../models/seller-dashboard";
import {
  deliveryMethodLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from "../models/seller-dashboard";
import { errorMessage, formatDateTime, formatNumber } from "../utils/format";

interface OrderDetailsModalProps {
  orderId: number | null;
  onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (orderId === null) return;
    let active = true;
    setOrder(null);
    setLoading(true);
    setError(null);
    void sellerDashboardApi.getOrderDetails(orderId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((caughtError) => {
        if (active) setError(errorMessage(caughtError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId, reloadToken]);

  useEffect(() => {
    if (orderId === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orderId, onClose]);

  const printInvoice = () => {
    if (!order) return;

    const previousTitle = document.title;
    const recipientName = `${order.customer.firstName} ${order.customer.lastName}`.trim() || "گیرنده";
    const orderDate = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(order.createdAt));
    document.title = `سفارش-${order.id}-${recipientName}-${orderDate}`
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "-");

    window.addEventListener("afterprint", () => {
      document.title = previousTitle;
    }, { once: true });
    window.print();
  };

  if (orderId === null) return null;

  return (
    <div
      className="order-print-overlay fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
      onMouseDown={onClose}
    >
      <div
        className="order-print-sheet flex h-dvh max-h-dvh w-full max-w-4xl flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:h-auto sm:max-h-[85dvh] sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="order-print-hidden flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h2 id="order-details-title" className="text-lg font-semibold text-gray-950 dark:text-white">
              پیش‌نمایش فاکتور سفارش #{orderId}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {order && (
              <button type="button" onClick={printInvoice} className="flex min-h-10 items-center gap-2 rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-700">
                <span className="material-symbols-outlined text-lg">print</span>
                چاپ / ذخیره PDF
              </button>
            )}
            <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="بستن">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="order-print-content flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-500">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              در حال دریافت جزئیات سفارش...
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button type="button" onClick={() => setReloadToken((value) => value + 1)} className="mt-4 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                تلاش دوباره
              </button>
            </div>
          ) : order ? (
            <div className="invoice-document overflow-hidden rounded-xl border-2 border-gray-800 bg-white text-gray-900 dark:border-gray-500 dark:bg-gray-900 dark:text-white">
              <header className="grid border-b-2 border-gray-800 dark:border-gray-500 sm:grid-cols-[1fr_auto_1fr]">
                <div className="border-b border-gray-300 p-4 text-center sm:border-b-0 sm:border-l sm:text-right dark:border-gray-700">
                  <p className="text-xs text-gray-500">شماره سفارش</p>
                  <p className="mt-1 text-lg font-black">#{formatNumber(order.id)}</p>
                </div>
                <div className="px-8 py-4 text-center">
                  <h2 className="text-xl font-black">فاکتور آماده‌سازی سفارش</h2>
                  <p className="mt-1 text-xs text-gray-500">نسخه واحد فروش</p>
                </div>
                <div className="border-t border-gray-300 p-4 text-center sm:border-r sm:border-t-0 sm:text-left dark:border-gray-700">
                  <p className="text-xs text-gray-500">تاریخ ثبت</p>
                  <p className="mt-1 text-sm font-bold">{formatDateTime(order.createdAt)}</p>
                </div>
              </header>

              <div className="order-print-summary grid border-b border-gray-300 text-sm dark:border-gray-700 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-gray-300 dark:sm:divide-gray-700">
                <p className="px-4 py-3"><span className="text-gray-500">وضعیت: </span><strong>{paymentStatusLabels[order.paymentStatus]}</strong></p>
                <p className="px-4 py-3"><span className="text-gray-500">پرداخت: </span><strong>{paymentMethodLabels[order.paymentMethod] ?? "نامشخص"}</strong></p>
                <p className="px-4 py-3"><span className="text-gray-500">تحویل: </span><strong>{deliveryMethodLabels[order.deliveryMethod] ?? "نامشخص"}</strong></p>
              </div>

              <section className="border-b border-gray-300 p-4 dark:border-gray-700">
                <h3 className="mb-3 text-sm font-black">مشخصات گیرنده</h3>
                <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
                  <p><span className="text-gray-500">نام و نام خانوادگی: </span><strong>{`${order.customer.firstName} ${order.customer.lastName}`.trim() || "ثبت نشده"}</strong></p>
                  <p><span className="text-gray-500">شماره تماس: </span><strong dir="ltr" className="inline-block">{order.customer.phoneNumber}</strong></p>
                  <p><span className="text-gray-500">کد پستی: </span><strong>{order.customer.postalCode || "ثبت نشده"}</strong></p>
                  <p className="leading-7 sm:col-span-3"><span className="text-gray-500">نشانی کامل: </span><strong>{order.customer.address || "ثبت نشده"}</strong></p>
                </div>
              </section>

              <section className="md:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item, index) => (
                    <article key={item.id} className="order-print-item p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">ردیف {formatNumber(index + 1)}</p>
                          <h4 className="mt-1 break-words text-sm font-bold leading-6">{item.productName}</h4>
                          <p className="mt-1 text-xs text-gray-500">کد تنوع: {formatNumber(item.productVariantId)}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm font-black text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">{formatNumber(item.productCount)} عدد</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.values.flatMap((value: VariantValueOutput) => [
                          value.size ? <span key={`${value.id}-mobile-size`} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs dark:border-gray-700">سایز: <strong>{value.size}</strong></span> : null,
                          value.colorName ? <span key={`${value.id}-mobile-color`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs dark:border-gray-700">{value.colorCode && <span className="size-3 rounded-full border" style={{ backgroundColor: value.colorCode }} />}رنگ: <strong>{value.colorName}</strong></span> : null,
                        ])}
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
                        <div><dt className="text-gray-400">قیمت واحد</dt><dd className="mt-1 font-bold">{formatNumber(item.productPrice)} تومان</dd></div>
                        <div><dt className="text-gray-400">مبلغ کل</dt><dd className="mt-1 font-bold">{formatNumber(item.totalPrice)} تومان</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              <section className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] border-collapse text-right text-sm">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[27%]" />
                    <col className="w-[20%]" />
                    <col className="w-[9%]" />
                    <col className="w-[19%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="px-2 py-3 text-center">ردیف</th>
                      <th className="px-3 py-3">شرح کالا</th>
                      <th className="px-3 py-3">مشخصات تنوع</th>
                      <th className="px-2 py-3 text-center">تعداد</th>
                      <th className="px-2 py-3 text-left">قیمت واحد</th>
                      <th className="px-2 py-3 text-left">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id} className="order-print-item border-b border-gray-200 align-middle last:border-b-0 dark:border-gray-700">
                        <td className="px-3 py-4 text-center font-bold">{formatNumber(index + 1)}</td>
                        <td className="break-words px-3 py-4">
                          <p className="font-bold leading-6">{item.productName}</p>
                          <p className="mt-1 text-xs text-gray-500">کد تنوع: {formatNumber(item.productVariantId)}</p>
                        </td>
                        <td className="break-words border-r border-gray-200 px-3 py-4 dark:border-gray-700">
                          <div className="space-y-1.5">
                            {item.values.flatMap((value: VariantValueOutput) => [
                              value.size ? <p key={`${value.id}-size`}><span className="text-gray-500">سایز: </span><strong className="text-base">{value.size}</strong></p> : null,
                              value.colorName ? (
                                <p key={`${value.id}-color`} className="flex items-center gap-2">
                                  <span className="text-gray-500">رنگ:</span>
                                  {value.colorCode && <span className="size-4 rounded-full border border-gray-400" style={{ backgroundColor: value.colorCode }} />}
                                  <strong>{value.colorName}</strong>
                                </p>
                              ) : null,
                            ])}
                            {item.values.every((value) => !value.size && !value.colorName) && <span className="text-gray-500">بدون تنوع</span>}
                          </div>
                        </td>
                        <td className="bg-blue-50 px-2 py-4 text-center text-xl font-black dark:bg-blue-950/30">{formatNumber(item.productCount)}</td>
                        <td className="px-2 py-4 text-left leading-6">{formatNumber(item.productPrice)}<br />تومان</td>
                        <td className="px-2 py-4 text-left font-bold leading-6">{formatNumber(item.totalPrice)}<br />تومان</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <footer className="order-print-total grid border-t-2 border-gray-800 bg-gray-100 dark:border-gray-500 dark:bg-gray-800 sm:grid-cols-2">
                <div className="p-4 text-sm">
                  <span className="text-gray-500">تعداد کل اقلام: </span>
                  <strong className="text-base">{formatNumber(order.totalCount)} عدد</strong>
                </div>
                <div className="border-t border-gray-300 p-4 text-left sm:border-r sm:border-t-0 dark:border-gray-700">
                  <span className="text-sm">مبلغ کل فروشنده: </span>
                  <strong className="text-lg">{formatNumber(order.totalPrice)} تومان</strong>
                </div>
              </footer>

              <div className="grid min-h-24 border-t border-gray-300 text-xs dark:border-gray-700 sm:grid-cols-2">
                <div className="p-4 sm:border-l dark:border-gray-700">نام و امضای آماده‌کننده کالا:</div>
                <div className="border-t border-gray-300 p-4 sm:border-t-0 dark:border-gray-700">نام و امضای کنترل‌کننده نهایی:</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

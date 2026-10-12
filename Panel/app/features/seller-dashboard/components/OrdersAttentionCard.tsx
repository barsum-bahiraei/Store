import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { OrderAttentionItem, PaymentStatus, SellerDateRange } from "../models/seller-dashboard";
import { allowedNextStatuses, paymentStatusLabels } from "../models/seller-dashboard";
import { errorMessage, formatDateTime, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { SectionCard } from "./SectionCard";

interface OrdersAttentionCardProps {
  range: SellerDateRange;
  status?: PaymentStatus;
}

const statusColors: Record<number, string> = {
  0: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  2: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  3: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  4: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  5: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  6: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  7: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  8: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const inputClasses =
  "min-h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-900 outline-none transition-colors focus:border-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export function OrdersAttentionCard({ range, status }: OrdersAttentionCardProps) {
  const [items, setItems] = useState<OrderAttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({});
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    order: OrderAttentionItem;
    nextStatus: PaymentStatus;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await sellerDashboardApi.getOrdersAttention(range, status));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, status]);

  const changeStatus = async (order: OrderAttentionItem, next: PaymentStatus) => {
    setUpdatingId(order.id);
    setActionError(null);
    try {
      const updated = await sellerDashboardApi.updateOrderStatus(order.id, { PaymentStatus: next });
      setItems((current) =>
        status !== undefined && status !== updated.paymentStatus
          ? current.filter((item) => item.id !== order.id)
          : current.map((item) =>
            item.id === order.id ? { ...item, paymentStatus: updated.paymentStatus } : item,
          ),
      );
      setSelectedStatuses((current) => ({ ...current, [order.id]: "" }));
    } catch (caughtError) {
      setActionError(errorMessage(caughtError));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
    <SectionCard title="سفارش‌های پرداخت‌شده" icon="local_shipping">
      {actionError && (
        <div className="mx-4 mt-4 sm:mx-6">
          <ErrorBanner message={actionError} onRetry={() => setActionError(null)} />
        </div>
      )}
      {loading ? (
        <LoadingState message="در حال بارگذاری سفارش‌ها..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load()} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="check_circle" message="سفارشی نیازمند اقدام نیست." />
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((order) => {
            const nextStatuses = allowedNextStatuses(order.paymentStatus);
            return (
              <li key={order.id} className="space-y-3 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                       <button type="button" onClick={() => setDetailOrderId(order.id)} className="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
                         سفارش #{order.id}
                       </button>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusColors[order.paymentStatus] ?? statusColors[8]
                        }`}
                      >
                        {paymentStatusLabels[order.paymentStatus] ?? `وضعیت ${order.paymentStatus}`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(order.createdAt)} · {formatNumber(order.totalCount)} قلم ·{" "}
                      {formatNumber(order.totalPrice)} تومان
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{order.address}</p>
                  </div>
                   <div className="flex flex-wrap items-center gap-2">
                     <button type="button" onClick={() => setDetailOrderId(order.id)} className="min-h-9 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                       مشاهده جزئیات
                     </button>
                     {nextStatuses.length === 0 ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        تغییر وضعیت مجاز نیست
                      </span>
                    ) : (
                       <>
                         <select
                           value={selectedStatuses[order.id] ?? ""}
                           onChange={(event) => setSelectedStatuses((current) => ({ ...current, [order.id]: event.target.value }))}
                           className={inputClasses}
                         >
                           <option value="">وضعیت بعدی</option>
                           {nextStatuses.map((next) => <option key={next} value={next}>{paymentStatusLabels[next]}</option>)}
                         </select>
                         <button
                           type="button"
                           disabled={updatingId === order.id || !selectedStatuses[order.id]}
                            onClick={() => setPendingStatusChange({
                              order,
                              nextStatus: Number(selectedStatuses[order.id]) as PaymentStatus,
                            })}
                           className="min-h-9 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                         >
                           {updatingId === order.id ? "در حال بروزرسانی..." : "ثبت وضعیت"}
                         </button>
                       </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
    <OrderDetailsModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />
    <ConfirmDialog
      open={pendingStatusChange !== null}
      title="تأیید تغییر وضعیت سفارش"
      message={pendingStatusChange
        ? `وضعیت سفارش #${pendingStatusChange.order.id} به «${paymentStatusLabels[pendingStatusChange.nextStatus]}» تغییر کند؟`
        : ""}
      confirmLabel="بله، ثبت شود"
      danger={false}
      onConfirm={() => {
        if (!pendingStatusChange) return;
        const { order, nextStatus } = pendingStatusChange;
        setPendingStatusChange(null);
        void changeStatus(order, nextStatus);
      }}
      onCancel={() => setPendingStatusChange(null)}
    />
    </>
  );
}

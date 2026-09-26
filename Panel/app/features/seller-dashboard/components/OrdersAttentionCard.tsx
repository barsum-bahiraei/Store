import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { OrderAttentionItem, PaymentStatus, SellerDateRange } from "../models/seller-dashboard";
import { allowedNextStatuses, paymentStatusLabels } from "../models/seller-dashboard";
import { errorMessage, formatDateTime, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

interface OrdersAttentionCardProps {
  range: SellerDateRange;
  refreshToken: number;
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

const DEFAULT_STUCK_DAYS = 3;

const inputClasses =
  "min-h-9 w-20 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-900 outline-none transition-colors focus:border-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export function OrdersAttentionCard({ range, refreshToken }: OrdersAttentionCardProps) {
  const [items, setItems] = useState<OrderAttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stuckDaysInput, setStuckDaysInput] = useState(String(DEFAULT_STUCK_DAYS));
  const [stuckDays, setStuckDays] = useState(DEFAULT_STUCK_DAYS);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await sellerDashboardApi.getOrdersAttention(range, stuckDays));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, stuckDays, refreshToken]);

  const applyStuckDays = () => {
    const parsed = Number(stuckDaysInput);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setStuckDays(parsed);
  };

  const changeStatus = async (order: OrderAttentionItem, next: PaymentStatus) => {
    setUpdatingId(order.id);
    setActionError(null);
    try {
      await sellerDashboardApi.updateOrderStatus(order.id, { PaymentStatus: next });
      setItems((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, paymentStatus: next } : item,
        ),
      );
    } catch (caughtError) {
      setActionError(errorMessage(caughtError));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SectionCard
      title="سفارش‌های نیازمند اقدام"
      icon="pending_actions"
      action={
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="stuck-days">
            روز ماندگاری
          </label>
          <input
            id="stuck-days"
            type="number"
            min="0"
            value={stuckDaysInput}
            onChange={(event) => setStuckDaysInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyStuckDays();
            }}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={applyStuckDays}
            className="min-h-9 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            اعمال
          </button>
        </div>
      }
    >
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        سفارش #{order.id}
                      </p>
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
                    {nextStatuses.length === 0 ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        تغییر وضعیت مجاز نیست
                      </span>
                    ) : (
                      nextStatuses.map((next) => (
                        <button
                          key={next}
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => void changeStatus(order, next)}
                          className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            next === 7
                              ? "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                              : "bg-primary-600 text-white hover:bg-primary-700"
                          }`}
                        >
                          {updatingId === order.id
                            ? "در حال بروزرسانی..."
                            : `به ${paymentStatusLabels[next]}`}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

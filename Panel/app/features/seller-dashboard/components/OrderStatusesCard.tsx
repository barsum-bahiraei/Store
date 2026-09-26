import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { OrderStatusCountItem, SellerDateRange } from "../models/seller-dashboard";
import { paymentStatusLabels } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

interface OrderStatusesCardProps {
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

export function OrderStatusesCard({ range, refreshToken }: OrderStatusesCardProps) {
  const [items, setItems] = useState<OrderStatusCountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await sellerDashboardApi.getOrderStatuses(range));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, refreshToken]);

  return (
    <SectionCard title="وضعیت سفارش‌ها" icon="order_status">
      {loading ? (
        <LoadingState message="در حال بارگذاری وضعیت‌ها..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load()} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="order_status" message="سفارشی وجود ندارد." />
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((item) => (
            <li
              key={item.paymentStatus}
              className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
            >
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  statusColors[item.paymentStatus] ?? statusColors[8]
                }`}
              >
                {paymentStatusLabels[item.paymentStatus] ?? `وضعیت ${item.paymentStatus}`}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatNumber(item.count)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

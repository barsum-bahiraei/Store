import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { DiscountStatisticsItem, SellerDateRange } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

interface DiscountStatisticsCardProps {
  range: SellerDateRange;
  refreshToken: number;
}

export function DiscountStatisticsCard({ range, refreshToken }: DiscountStatisticsCardProps) {
  const [items, setItems] = useState<DiscountStatisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await sellerDashboardApi.getDiscountStatistics(range));
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
    <SectionCard title="آمار کدهای تخفیف" icon="local_offer">
      {loading ? (
        <LoadingState message="در حال بارگذاری آمار تخفیف‌ها..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load()} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="local_offer" message="کد تخفیفی استفاده نشده است." />
        </div>
      ) : (
        <>
          <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 sm:grid sm:grid-cols-[1fr_90px_130px_130px] sm:gap-4">
            <span>کد</span>
            <span className="text-center">استفاده</span>
            <span className="text-left">مبلغ تخفیف</span>
            <span className="text-left">فروش</span>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.discountCodeId}
                className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[1fr_90px_130px_130px] sm:items-center sm:gap-4 sm:px-6"
              >
                <p className="truncate font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {item.code}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-center">
                  {formatNumber(item.usageCount)}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 sm:text-left">
                  {formatNumber(item.discountAmount)}
                </p>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 sm:text-left">
                  {formatNumber(item.salesAmount)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}

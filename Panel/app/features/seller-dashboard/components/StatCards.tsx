import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { SellerDashboardStats, SellerDateRange } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";

interface StatCardsProps {
  range: SellerDateRange;
  refreshToken: number;
}

const cards: { key: keyof SellerDashboardStats; label: string; icon: string; money?: boolean }[] = [
  { key: "totalSales", label: "مجموع فروش", icon: "payments", money: true },
  { key: "orderCount", label: "تعداد سفارش", icon: "shopping_cart" },
  { key: "itemsSoldCount", label: "اقلام فروخته‌شده", icon: "inventory" },
  { key: "averageOrderValue", label: "میانگین سفارش", icon: "avg_pace", money: true },
  { key: "completedOrderCount", label: "سفارش تکمیل‌شده", icon: "check_circle" },
  { key: "cancelledOrderCount", label: "سفارش لغوشده", icon: "cancel" },
  { key: "discountAmount", label: "مجموع تخفیف", icon: "sell", money: true },
];

export function StatCards({ range, refreshToken }: StatCardsProps) {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await sellerDashboardApi.getDashboard(range));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, refreshToken]);

  if (loading) return <LoadingState message="در حال بارگذاری آمار..." />;
  if (error) return <ErrorBanner message={error} onRetry={() => void load()} />;
  if (!stats) {
    return <EmptyState icon="analytics" message="آماری برای نمایش وجود ندارد." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-600 dark:text-primary-400">{card.icon}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-950 dark:text-white">
            {card.money ? formatNumber(stats[card.key]) : formatNumber(stats[card.key])}
            {card.money && <span className="mr-1 text-xs font-normal text-gray-400">تومان</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

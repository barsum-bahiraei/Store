import { useEffect, useState } from "react";
import { PersianDateTimePicker } from "~/components/common/PersianDateTimePicker";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { SellerDashboardStats, SellerDateRange } from "../models/seller-dashboard";
import { CategorySalesCard } from "../components/CategorySalesCard";
import { DiscountStatisticsCard } from "../components/DiscountStatisticsCard";
import { LowStockCard } from "../components/LowStockCard";
import { OrderStatusesCard } from "../components/OrderStatusesCard";
import { OrdersAttentionCard } from "../components/OrdersAttentionCard";
import { ProductsWithoutSalesCard } from "../components/ProductsWithoutSalesCard";
import { SalesChartCard } from "../components/SalesChartCard";
import { StatCards } from "../components/StatCards";
import { TopProductsCard } from "../components/TopProductsCard";
import { TopVariantsCard } from "../components/TopVariantsCard";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingState } from "../components/LoadingState";
import { errorMessage, toDateRange } from "../utils/format";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

export default function SellerDashboardPage() {
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");
  const [range, setRange] = useState<SellerDateRange>({});
  const [refreshToken, setRefreshToken] = useState(0);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerMissing, setSellerMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setSellerMissing(false);

    void sellerDashboardApi.getDashboard(range)
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((caughtError) => {
        if (cancelled) return;
        const message = errorMessage(caughtError);
        if (message.toLowerCase().includes("seller not found")) {
          setStats(null);
          setSellerMissing(true);
          return;
        }
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range.from, range.to, refreshToken]);

  const applyFilters = () => {
    setRange(toDateRange(fromDraft, toDraft));
    setRefreshToken((token) => token + 1);
  };

  const clearFilters = () => {
    setFromDraft("");
    setToDraft("");
    setRange({});
    setRefreshToken((token) => token + 1);
  };

  const hasFilters = Boolean(fromDraft || toDraft);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            فروشنده
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
            داشبورد فروشنده
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            آمار فروش، سفارش‌ها و موجودی فروشگاه شما.
          </p>
        </div>
      </div>

      {sellerMissing ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <span className="material-symbols-outlined mx-auto flex! size-14 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            storefront
          </span>
          <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            در حال حاضر فروشگاهی تعریف نکرده‌اید.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            پس از تعریف فروشگاه، آمار فروش، سفارش‌ها و موجودی آن در این صفحه نمایش داده می‌شود.
          </p>
        </div>
      ) : loading ? (
        <LoadingState message="در حال بررسی اطلاعات فروشگاه..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={() => setRefreshToken((token) => token + 1)} />
      ) : stats ? (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  از تاریخ
                </span>
                <PersianDateTimePicker mode="date" value={fromDraft} onChange={setFromDraft} className={inputClasses} ariaLabel="از تاریخ" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  تا تاریخ
                </span>
                <PersianDateTimePicker mode="date" value={toDraft} onChange={setToDraft} className={inputClasses} ariaLabel="تا تاریخ" />
              </label>
              <button
                type="button"
                onClick={applyFilters}
                className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                اعمال فیلتر
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="min-h-11 rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                پاک کردن
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              خالی بودن تاریخ‌ها یعنی محدودیت زمانی اعمال نمی‌شود.
            </p>
          </div>

          <StatCards stats={stats} />

          <div className="grid gap-5 lg:grid-cols-2">
            <SalesChartCard range={range} refreshToken={refreshToken} />
            <OrderStatusesCard range={range} refreshToken={refreshToken} />
          </div>

          <TopProductsCard range={range} refreshToken={refreshToken} />
          <TopVariantsCard range={range} refreshToken={refreshToken} />

          <div className="grid gap-5 lg:grid-cols-2">
            <CategorySalesCard range={range} refreshToken={refreshToken} />
            <DiscountStatisticsCard range={range} refreshToken={refreshToken} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <LowStockCard refreshToken={refreshToken} />
            <ProductsWithoutSalesCard range={range} refreshToken={refreshToken} />
          </div>

          <OrdersAttentionCard range={range} refreshToken={refreshToken} />
        </>
      ) : null}
    </div>
  );
}

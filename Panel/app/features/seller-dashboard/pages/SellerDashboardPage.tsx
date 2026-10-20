import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PersianDateTimePicker } from "~/components/common/PersianDateTimePicker";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { SellerDashboardStats, SellerDateRange } from "../models/seller-dashboard";
import { LowStockCard } from "../components/LowStockCard";
import { SalesChartCard } from "../components/SalesChartCard";
import { StatCards } from "../components/StatCards";
import { TopProductsCard } from "../components/TopProductsCard";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingState } from "../components/LoadingState";
import { errorMessage, toDateRange } from "../utils/format";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultDateFilter() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return { from: formatInputDate(from), to: formatInputDate(to) };
}

export default function SellerDashboardPage() {
  const [initialDates] = useState(defaultDateFilter);
  const [fromDraft, setFromDraft] = useState(initialDates.from);
  const [toDraft, setToDraft] = useState(initialDates.to);
  const [range, setRange] = useState<SellerDateRange>(() =>
    toDateRange(initialDates.from, initialDates.to) ?? {},
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
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
    const nextRange = toDateRange(fromDraft, toDraft);
    if (!nextRange) {
      setFilterError("بازه زمانی معتبر نیست. تاریخ شروع باید قبل از تاریخ پایان باشد.");
      return;
    }
    setFilterError(null);
    setRange(nextRange);
    setRefreshToken((token) => token + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-6 text-gray-950 shadow-sm dark:border-gray-800 dark:bg-black dark:text-white sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700 dark:bg-white/10 dark:text-gray-200">
                <span className="material-symbols-outlined text-base">date_range</span>
                عملکرد ۳۰ روز اخیر
              </span>
              <Link to="/orders-attention" className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-500">
                سفارش‌های نیازمند اقدام
                <span className="material-symbols-outlined text-base">arrow_back</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">مرکز عملکرد فروشگاه</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">فروش، محصولات پرفروش و موجودی‌های نیازمند اقدام در یک نگاه</p>
          </div>
          <div className="grid gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-white/5 sm:grid-cols-[170px_170px_auto] sm:items-end">
            <label>
              <span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">از تاریخ</span>
              <PersianDateTimePicker mode="date" value={fromDraft} onChange={setFromDraft} clearable={false} className={inputClasses} ariaLabel="از تاریخ" />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">تا تاریخ</span>
              <PersianDateTimePicker mode="date" value={toDraft} onChange={setToDraft} clearable={false} className={inputClasses} ariaLabel="تا تاریخ" />
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              نمایش گزارش
            </button>
          </div>
        </div>
        {filterError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{filterError}</p>}
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
      ) : (
        <>
          {loading ? (
            <LoadingState message="در حال محاسبه خلاصه فروش..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={() => setRefreshToken((token) => token + 1)} />
          ) : stats ? (
            <StatCards stats={stats} />
          ) : null}

          <SalesChartCard range={range} refreshToken={refreshToken} />

          <div className="grid items-start gap-5 xl:grid-cols-2">
            <TopProductsCard range={range} refreshToken={refreshToken} />
            <LowStockCard refreshToken={refreshToken} />
          </div>
        </>
      )}
    </div>
  );
}

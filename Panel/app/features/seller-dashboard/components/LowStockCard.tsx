import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { LowStockItem, PagedResult } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { SectionCard } from "./SectionCard";
import { formatVariantValues } from "./TopVariantsCard";

interface LowStockCardProps {
  refreshToken: number;
}

const PAGE_SIZE = 10;
const DEFAULT_THRESHOLD = 5;

const inputClasses =
  "min-h-9 w-24 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-900 outline-none transition-colors focus:border-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export function LowStockCard({ refreshToken }: LowStockCardProps) {
  const [thresholdInput, setThresholdInput] = useState(String(DEFAULT_THRESHOLD));
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [result, setResult] = useState<PagedResult<LowStockItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetPage: number, targetThreshold: number) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await sellerDashboardApi.getLowStock(targetThreshold, targetPage, PAGE_SIZE));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    void load(1, threshold);
  }, [threshold, refreshToken]);

  const applyThreshold = () => {
    const parsed = Number(thresholdInput);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setThreshold(parsed);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void load(nextPage, threshold);
  };

  const items = result?.items ?? [];

  return (
    <SectionCard
      title="موجودی کم"
      icon="warning"
      action={
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="low-stock-threshold">
            آستانه
          </label>
          <input
            id="low-stock-threshold"
            type="number"
            min="0"
            value={thresholdInput}
            onChange={(event) => setThresholdInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyThreshold();
            }}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={applyThreshold}
            className="min-h-9 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            اعمال
          </button>
        </div>
      }
    >
      {loading ? (
        <LoadingState message="در حال بارگذاری موجودی کم..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load(page, threshold)} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="check_circle" message="محصولی با موجودی کمتر از آستانه وجود ندارد." />
        </div>
      ) : (
        <>
          <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 sm:grid sm:grid-cols-[1fr_1.2fr_100px_90px] sm:gap-4">
            <span>محصول</span>
            <span>مقادیر</span>
            <span className="text-center">قیمت</span>
            <span className="text-center">موجودی</span>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.productVariantId}
                className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[1fr_1.2fr_100px_90px] sm:items-center sm:gap-4 sm:px-6"
              >
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatVariantValues(item.values)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-center">
                  {formatNumber(item.price)}
                </p>
                <p className="sm:text-center">
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {formatNumber(item.stock)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={result?.totalCount ?? 0}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </SectionCard>
  );
}

import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { PagedResult, SellerDateRange, TopProductItem } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { SectionCard } from "./SectionCard";

interface TopProductsCardProps {
  range: SellerDateRange;
  refreshToken: number;
}

const PAGE_SIZE = 10;

export function TopProductsCard({ range, refreshToken }: TopProductsCardProps) {
  const [result, setResult] = useState<PagedResult<TopProductItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await sellerDashboardApi.getTopProducts(range, targetPage, PAGE_SIZE));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    void load(1);
  }, [range.from, range.to, refreshToken]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void load(nextPage);
  };

  const items = result?.items ?? [];

  return (
    <SectionCard title="پرفروش‌ترین محصولات" icon="trophy">
      {loading ? (
        <LoadingState message="در حال بارگذاری محصولات..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load(page)} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="inventory_2" message="محصولی فروخته نشده است." />
        </div>
      ) : (
        <>
          <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 sm:grid sm:grid-cols-[1fr_100px_140px] sm:gap-4">
            <span>محصول</span>
            <span className="text-center">تعداد فروش</span>
            <span className="text-left">مبلغ فروش</span>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[1fr_100px_140px] sm:items-center sm:gap-4 sm:px-6"
              >
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {item.productName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-center">
                  {formatNumber(item.unitsSold)}
                </p>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 sm:text-left">
                  {formatNumber(item.salesAmount)} تومان
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

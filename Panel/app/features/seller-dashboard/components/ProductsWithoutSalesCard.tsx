import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { PagedResult, ProductWithoutSalesItem, SellerDateRange } from "../models/seller-dashboard";
import { errorMessage } from "../utils/format";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { Pagination } from "./Pagination";
import { SectionCard } from "./SectionCard";

interface ProductsWithoutSalesCardProps {
  range: SellerDateRange;
  refreshToken: number;
}

const PAGE_SIZE = 10;

export function ProductsWithoutSalesCard({ range, refreshToken }: ProductsWithoutSalesCardProps) {
  const [result, setResult] = useState<PagedResult<ProductWithoutSalesItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await sellerDashboardApi.getProductsWithoutSales(range, targetPage, PAGE_SIZE));
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
    <SectionCard title="محصولات بدون فروش" icon="remove_shopping_cart">
      {loading ? (
        <LoadingState message="در حال بارگذاری محصولات..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load(page)} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="check_circle" message="همه محصولات در این بازه فروش داشته‌اند." />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.productId}
                className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white sm:px-6"
              >
                {item.productName}
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

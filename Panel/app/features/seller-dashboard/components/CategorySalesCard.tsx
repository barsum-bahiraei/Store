import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { CategorySalesItem, SellerDateRange } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { useTheme } from "~/contexts/theme-context";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

interface CategorySalesCardProps {
  range: SellerDateRange;
  refreshToken: number;
}

export function CategorySalesCard({ range, refreshToken }: CategorySalesCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<CategorySalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await sellerDashboardApi.getCategorySales(range));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, refreshToken]);

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const pieColors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#db2777", "#4f46e5"];

  const options: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
      height: 320,
    },
    title: { text: undefined },
    accessibility: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: isDark ? "#1f2937" : "#111827",
      borderColor: "transparent",
      style: { color: "#f9fafb", fontSize: "12px" },
      pointFormat: "{point.name}: <b>{point.y} تومان</b>",
    },
    plotOptions: {
      pie: {
        innerSize: "55%",
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b><br/>{point.percentage:.1f}%",
          style: { color: textColor, fontSize: "11px", textOutline: "none" },
        },
        showInLegend: false,
      },
    },
    series: [
      {
        type: "pie",
        name: "فروش",
        data: items.map((item) => ({
          name: item.categoryName,
          y: item.salesAmount,
        })),
      },
    ],
    colors: pieColors,
  };

  return (
    <SectionCard title="فروش دسته‌بندی‌ها" icon="category">
      {loading ? (
        <LoadingState message="در حال بارگذاری دسته‌بندی‌ها..." />
      ) : error ? (
        <div className="p-4">
          <ErrorBanner message={error} onRetry={() => void load()} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon="category" message="فروشی برای دسته‌بندی‌ها ثبت نشده است." />
        </div>
      ) : mounted ? (
        <div className="p-4 sm:p-6">
          <HighchartsReact highcharts={Highcharts} options={options} />
          <ul className="mt-4 space-y-2">
            {items.map((item, index) => (
              <li key={item.categoryId} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="truncate font-medium text-gray-900 dark:text-white">
                    {item.categoryName}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(item.unitsSold)} قلم · {formatNumber(item.orderCount)} سفارش
                </span>
                <span className="shrink-0 font-semibold text-primary-600 dark:text-primary-400">
                  {formatNumber(item.salesAmount)} تومان
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="h-80" />
      )}
    </SectionCard>
  );
}

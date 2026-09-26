import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { sellerDashboardApi } from "../api/seller-dashboard-api";
import type { SalesChartGroupBy, SalesChartPoint, SellerDateRange } from "../models/seller-dashboard";
import { errorMessage, formatNumber } from "../utils/format";
import { useTheme } from "~/contexts/theme-context";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

interface SalesChartCardProps {
  range: SellerDateRange;
  refreshToken: number;
}

const groupOptions: { value: SalesChartGroupBy; label: string }[] = [
  { value: "Day", label: "روزانه" },
  { value: "Week", label: "هفتگی" },
  { value: "Month", label: "ماهانه" },
];

const selectClasses =
  "min-h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-900 outline-none transition-colors focus:border-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export function SalesChartCard({ range, refreshToken }: SalesChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [groupBy, setGroupBy] = useState<SalesChartGroupBy>("Day");
  const [points, setPoints] = useState<SalesChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPoints(await sellerDashboardApi.getSalesChart({ ...range, groupBy }));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, groupBy, refreshToken]);

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const barColor = isDark ? "#3b82f6" : "#2563eb";

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
      height: 320,
    },
    title: { text: undefined },
    accessibility: { enabled: false },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: points.map((point) => point.date),
      labels: { style: { color: textColor, fontSize: "11px" } },
      lineColor: gridColor,
      tickColor: gridColor,
    },
    yAxis: {
      labels: {
        style: { color: textColor, fontSize: "11px" },
        formatter: function () {
          return formatNumber(Number(this.value));
        },
      },
      gridLineColor: gridColor,
    },
    tooltip: {
      shared: true,
      backgroundColor: isDark ? "#1f2937" : "#111827",
      borderColor: "transparent",
      style: { color: "#f9fafb", fontSize: "12px" },
      formatter: function () {
        const point = this.points?.[0];
        if (!point) return "";
        const data = points[point.index];
        if (!data) return "";
        return [
          `<b>${data.date}</b>`,
          `فروش: ${formatNumber(data.salesAmount)} تومان`,
          `سفارش: ${formatNumber(data.orderCount)}`,
          `اقلام: ${formatNumber(data.itemsSoldCount)}`,
        ].join("<br/>");
      },
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        borderWidth: 0,
        maxPointWidth: 40,
        color: barColor,
      },
    },
    series: [
      {
        type: "column",
        name: "فروش",
        data: points.map((point) => point.salesAmount),
        color: barColor,
      },
    ],
  };

  return (
    <SectionCard
      title="نمودار فروش"
      icon="monitoring"
      action={
        <select
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as SalesChartGroupBy)}
          className={selectClasses}
          aria-label="گروه‌بندی نمودار"
        >
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    >
      <div className="p-4 sm:p-6">
        {loading ? (
          <LoadingState message="در حال بارگذاری نمودار..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={() => void load()} />
        ) : points.length === 0 ? (
          <EmptyState icon="monitoring" message="داده‌ای برای نمایش وجود ندارد." />
        ) : mounted ? (
          <HighchartsReact highcharts={Highcharts} options={options} />
        ) : (
          <div className="h-80" />
        )}
      </div>
    </SectionCard>
  );
}

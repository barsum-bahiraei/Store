import type { SellerDashboardStats } from "../models/seller-dashboard";
import { formatNumber } from "../utils/format";

interface StatCardsProps {
  stats: SellerDashboardStats;
}

const cards: { key: keyof SellerDashboardStats; label: string; icon: string; money?: boolean }[] = [
  { key: "totalSales", label: "فروش دوره", icon: "payments", money: true },
  { key: "orderCount", label: "سفارش موفق", icon: "shopping_bag" },
  { key: "itemsSoldCount", label: "کالای فروخته‌شده", icon: "inventory_2" },
  { key: "averageOrderValue", label: "میانگین ارزش سفارش", icon: "monitoring", money: true },
];

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.key}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className={`absolute inset-y-0 right-0 w-1 ${index === 0 ? "bg-emerald-500" : index === 1 ? "bg-blue-500" : index === 2 ? "bg-amber-500" : "bg-violet-500"}`} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <span className="material-symbols-outlined flex! size-10 items-center justify-center rounded-xl bg-gray-100 text-[21px] text-gray-700 dark:bg-gray-800 dark:text-gray-200">{card.icon}</span>
          </div>
          <p className="mt-4 text-2xl font-black tracking-tight text-gray-950 dark:text-white">
            {formatNumber(stats[card.key])}
            {card.money && <span className="mr-1.5 text-xs font-normal text-gray-400">تومان</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { PersianDateTimePicker } from "~/components/common/PersianDateTimePicker";
import { OrdersAttentionCard } from "../components/OrdersAttentionCard";
import { PaymentStatus, paymentStatusLabels } from "../models/seller-dashboard";
import type { SellerDateRange } from "../models/seller-dashboard";
import { toDateRange } from "../utils/format";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

const fulfillmentStatuses = [
  PaymentStatus.PaymentCompleted,
  PaymentStatus.Preparing,
  PaymentStatus.ReadyForShipment,
  PaymentStatus.Shipping,
  PaymentStatus.Delivered,
];

export default function OrdersAttentionPage() {
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [range, setRange] = useState<SellerDateRange>({});
  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [filterError, setFilterError] = useState<string | null>(null);

  const applyFilters = () => {
    const nextRange = toDateRange(fromDraft, toDraft);
    if (!nextRange) {
      setFilterError("بازه زمانی معتبر نیست. تاریخ شروع باید قبل از تاریخ پایان باشد.");
      return;
    }
    setFilterError(null);
    setRange(nextRange);
    setStatus(statusDraft === "" ? undefined : Number(statusDraft) as PaymentStatus);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            سفارش‌ها
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
            سفارش‌های نیازمند اقدام
          </h1>
           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            سفارش‌های پرداخت‌شده را بررسی و برای ارسال آماده کنید.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">از تاریخ</span>
            <PersianDateTimePicker mode="date" value={fromDraft} onChange={setFromDraft} className={inputClasses} ariaLabel="از تاریخ" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تا تاریخ</span>
            <PersianDateTimePicker mode="date" value={toDraft} onChange={setToDraft} className={inputClasses} ariaLabel="تا تاریخ" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">وضعیت سفارش</span>
            <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)} className={inputClasses}>
              <option value="">همه سفارش‌های جاری</option>
              {fulfillmentStatuses.map((item) => (
                <option key={item} value={item}>{paymentStatusLabels[item]}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={applyFilters} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
            اعمال فیلتر
          </button>
        </div>
        {filterError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{filterError}</p>}
      </div>

      <OrdersAttentionCard range={range} status={status} />
    </div>
  );
}

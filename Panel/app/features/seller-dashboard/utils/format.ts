import type { SellerDateRange } from "../models/seller-dashboard";
import {
  formatLocalDate,
  formatLocalDateTime,
  localDateBoundaryToUtcIso,
} from "~/shared/utils/date-time";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
}

export function formatDateTime(value: string): string {
  return formatLocalDateTime(value);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.";
}

export function toDateRange(from: string, to: string): SellerDateRange | null {
  const range: SellerDateRange = {};
  const fromUtc = from ? localDateBoundaryToUtcIso(from) : null;
  const toUtc = to ? localDateBoundaryToUtcIso(to, true) : null;

  if ((from && !fromUtc) || (to && !toUtc)) return null;
  if (fromUtc && toUtc && fromUtc > toUtc) return null;
  if (fromUtc) range.from = fromUtc;
  if (toUtc) range.to = toUtc;
  return range;
}

export function formatSalesChartDate(value: string, groupBy: "Day" | "Week" | "Month"): string {
  const options: Intl.DateTimeFormatOptions = groupBy === "Month"
    ? { year: "numeric", month: "long" }
    : { year: "numeric", month: "2-digit", day: "2-digit" };
  return formatLocalDate(value, options);
}

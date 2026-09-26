import type { SellerDateRange } from "../models/seller-dashboard";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fa-IR");
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.";
}

export function toDateRange(from: string, to: string): SellerDateRange {
  const range: SellerDateRange = {};
  if (from) range.from = new Date(`${from}T00:00:00`).toISOString();
  if (to) range.to = new Date(`${to}T23:59:59.999`).toISOString();
  return range;
}

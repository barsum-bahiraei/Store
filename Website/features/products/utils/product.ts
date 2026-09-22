import { ProductAttributeType, ProductAttributeUnit } from "../types/product";

export const priceFormatter = new Intl.NumberFormat("fa-IR", {
  style: "decimal",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" });

const attributeUnitLabels: Record<ProductAttributeUnit, string> = {
  [ProductAttributeUnit.Geram]: "گرم",
  [ProductAttributeUnit.Kilo]: "کیلوگرم",
  [ProductAttributeUnit.Meter]: "متر",
  [ProductAttributeUnit.None]: "",
  [ProductAttributeUnit.Milligram]: "میلی‌گرم",
  [ProductAttributeUnit.Millimeter]: "میلی‌متر",
  [ProductAttributeUnit.Centimeter]: "سانتی‌متر",
  [ProductAttributeUnit.Milliliter]: "میلی‌لیتر",
  [ProductAttributeUnit.Liter]: "لیتر",
  [ProductAttributeUnit.Piece]: "عدد",
  [ProductAttributeUnit.Pair]: "جفت",
  [ProductAttributeUnit.Pack]: "بسته",
  [ProductAttributeUnit.Box]: "جعبه",
  [ProductAttributeUnit.Set]: "ست",
};

export function formatToman(price: number) {
  return `${priceFormatter.format(price)} تومان`;
}

export function getSalePrice(price: number, discount: number) {
  return Math.max(0, price - discount);
}

export function getProductImageUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7185/api";
  return `${apiBase.replace(/\/api\/?$/, "")}/${url.replace(/^\//, "")}`;
}

export function getProductAttributeUnitLabel(unit: ProductAttributeUnit) {
  return attributeUnitLabels[unit] ?? "";
}

export function formatProductAttributeValue(value: string, type: ProductAttributeType) {
  const trimmedValue = value.trim();

  if (type === ProductAttributeType.Bool) {
    const normalizedValue = trimmedValue.toLowerCase();
    if (normalizedValue === "true" || normalizedValue === "1") return "بله";
    if (normalizedValue === "false" || normalizedValue === "0") return "خیر";
  }

  if (type === ProductAttributeType.Int) {
    const number = Number(trimmedValue);
    if (Number.isSafeInteger(number)) return integerFormatter.format(number);
  }

  if (type === ProductAttributeType.Date || type === ProductAttributeType.DateTime) {
    const date = new Date(type === ProductAttributeType.Date ? `${trimmedValue}T00:00:00` : trimmedValue);
    if (!Number.isNaN(date.getTime())) {
      return type === ProductAttributeType.Date ? dateFormatter.format(date) : dateTimeFormatter.format(date);
    }
  }

  if (type === ProductAttributeType.Time) {
    return trimmedValue.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  }

  return trimmedValue;
}

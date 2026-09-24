import { ProductAttributeType, ProductAttributeUnit, type ProductVariant, type ProductVariantAttributeValue } from "../types/product";

export type VariantOption = {
  name: string;
  code: string;
};

export type VariantGroup = {
  size: string;
  options: VariantOption[];
};

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

export function formatVariantLabel(values: ProductVariantAttributeValue[]) {
  if (values.length === 0) return undefined;
  return values.map((value) => `${value.size}: ${value.name || value.code}`).join("، ");
}

function variantOptionKey(value: { name: string; code: string }) {
  return value.name || value.code;
}

export function buildVariantGroups(variants: ProductVariant[]): VariantGroup[] {
  const groups = new Map<string, Map<string, VariantOption>>();
  for (const variant of variants) {
    for (const value of variant.values) {
      const options = groups.get(value.size) ?? new Map<string, VariantOption>();
      const key = variantOptionKey(value);
      if (!options.has(key)) options.set(key, { name: value.name, code: value.code });
      groups.set(value.size, options);
    }
  }
  return [...groups.entries()].map(([size, options]) => ({ size, options: [...options.values()] }));
}

export function createDefaultVariantSelection(variants: ProductVariant[], groups: VariantGroup[]): Record<string, string> {
  if (variants.length === 1) {
    return Object.fromEntries(variants[0].values.map((value) => [value.size, variantOptionKey(value)]));
  }
  const selection: Record<string, string> = {};
  for (const group of groups) {
    if (group.options.length === 1) selection[group.size] = variantOptionKey(group.options[0]);
  }
  return selection;
}

function variantMatchesSelection(variant: ProductVariant, selection: Record<string, string>) {
  return Object.entries(selection).every(([size, option]) =>
    variant.values.some((value) => value.size === size && variantOptionKey(value) === option),
  );
}

export function matchVariantBySelection(variants: ProductVariant[], selection: Record<string, string>) {
  if (Object.keys(selection).length === 0) return undefined;
  return variants.find((variant) => variantMatchesSelection(variant, selection));
}

export function getVariantOptionStatus(
  variants: ProductVariant[],
  selection: Record<string, string>,
  size: string,
  option: string,
) {
  const hypothetical = { ...selection, [size]: option };
  const matching = variants.filter((variant) => variantMatchesSelection(variant, hypothetical));
  const hasStock = matching.some((variant) => variant.stock > 0);
  return {
    disabled: !hasStock,
    outOfStock: matching.length > 0 && !hasStock,
  };
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

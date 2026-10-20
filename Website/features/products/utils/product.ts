import { ProductAttributeType, ProductAttributeUnit, type ProductVariant, type ProductVariantAttributeValue } from "../types/product";

export type VariantColor = {
  colorName?: string;
  colorCode?: string;
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
  const labels = values
    .map((value) => [getVariantColor(value)?.colorName, getVariantSize(value), getVariantModel(value)].filter(Boolean).join("، "))
    .filter(Boolean);
  return labels.join("، ") || undefined;
}

function getVariantSize(value: ProductVariantAttributeValue) {
  return value.size?.trim() || null;
}

function getVariantModel(value: ProductVariantAttributeValue) {
  return value.model?.trim() || null;
}

function getVariantColor(value: ProductVariantAttributeValue): VariantColor | null {
  const name = (value.colorName ?? "").trim();
  const code = (value.colorCode ?? "").trim();
  return name || code ? { colorName: name || code || undefined, colorCode: code || undefined } : null;
}

export function getVariantColors(variants: ProductVariant[]): VariantColor[] {
  const colors = new Map<string, VariantColor>();
  for (const variant of variants) {
    for (const value of variant.values) {
      const color = getVariantColor(value);
      if (color?.colorName && !colors.has(color.colorName)) colors.set(color.colorName, color);
    }
  }
  return [...colors.values()];
}

function variantHasColor(variant: ProductVariant, color: string) {
  return variant.values.some((value) => getVariantColor(value)?.colorName === color);
}

function variantHasSize(variant: ProductVariant, size: string) {
  return variant.values.some((value) => getVariantSize(value) === size);
}

function variantHasModel(variant: ProductVariant, model: string) {
  return variant.values.some((value) => getVariantModel(value) === model);
}

export function getVariantSizes(variants: ProductVariant[], color: string | null): string[] {
  const sizes = new Set<string>();
  for (const variant of variants) {
    if (color && !variantHasColor(variant, color)) continue;
    for (const value of variant.values) {
      const size = getVariantSize(value);
      if (size) sizes.add(size);
    }
  }
  return [...sizes];
}

export function getVariantModels(variants: ProductVariant[], color: string | null, size: string | null): string[] {
  const models = new Set<string>();
  for (const variant of variants) {
    if (color && !variantHasColor(variant, color)) continue;
    if (size && !variantHasSize(variant, size)) continue;
    for (const value of variant.values) {
      const model = getVariantModel(value);
      if (model) models.add(model);
    }
  }
  return [...models];
}

export function isVariantOptionOutOfStock(
  variants: ProductVariant[],
  color: string | null,
  size: string | null,
  model: string | null,
) {
  return !variants.some((variant) =>
    (!color || variantHasColor(variant, color)) &&
    (!size || variantHasSize(variant, size)) &&
    (!model || variantHasModel(variant, model)) &&
    variant.stock > 0,
  );
}

export function matchVariantBySelection(
  variants: ProductVariant[],
  color: string | null,
  size: string | null,
  model: string | null,
) {
  const matching = variants.filter((variant) =>
    (!color || variantHasColor(variant, color)) &&
    (!size || variantHasSize(variant, size)) &&
    (!model || variantHasModel(variant, model)),
  );
  return matching.find((variant) => variant.stock > 0) ?? matching[0];
}

export function getProductImageUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const baseUrl = process.env.NEXT_PUBLIC_MINIO_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${url.replace(/^\//, "")}` : null;
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

export enum AttributeUnit {
  Geram = 0,
  Kilo = 1,
  Meter = 2,
  None = 3,
  Milligram = 4,
  Millimeter = 5,
  Centimeter = 6,
  Milliliter = 7,
  Liter = 8,
  Piece = 9,
  Pair = 10,
  Pack = 11,
  Box = 12,
  Set = 13,
}

export const ATTRIBUTE_UNIT_OPTIONS: { value: AttributeUnit; label: string }[] = [
  { value: AttributeUnit.Geram, label: "گرم" },
  { value: AttributeUnit.Kilo, label: "کیلوگرم" },
  { value: AttributeUnit.Meter, label: "متر" },
  { value: AttributeUnit.None, label: "بدون واحد" },
  { value: AttributeUnit.Milligram, label: "میلی‌گرم" },
  { value: AttributeUnit.Millimeter, label: "میلی‌متر" },
  { value: AttributeUnit.Centimeter, label: "سانتی‌متر" },
  { value: AttributeUnit.Milliliter, label: "میلی‌لیتر" },
  { value: AttributeUnit.Liter, label: "لیتر" },
  { value: AttributeUnit.Piece, label: "عدد" },
  { value: AttributeUnit.Pair, label: "جفت" },
  { value: AttributeUnit.Pack, label: "بسته" },
  { value: AttributeUnit.Box, label: "جعبه" },
  { value: AttributeUnit.Set, label: "ست" },
];

export function getAttributeUnitLabel(unit: AttributeUnit): string {
  return ATTRIBUTE_UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? String(unit);
}

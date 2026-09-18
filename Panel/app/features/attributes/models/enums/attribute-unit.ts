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
  { value: AttributeUnit.Geram, label: "Gram" },
  { value: AttributeUnit.Kilo, label: "Kilogram" },
  { value: AttributeUnit.Meter, label: "Meter" },
  { value: AttributeUnit.None, label: "None" },
  { value: AttributeUnit.Milligram, label: "Milligram" },
  { value: AttributeUnit.Millimeter, label: "Millimeter" },
  { value: AttributeUnit.Centimeter, label: "Centimeter" },
  { value: AttributeUnit.Milliliter, label: "Milliliter" },
  { value: AttributeUnit.Liter, label: "Liter" },
  { value: AttributeUnit.Piece, label: "Piece" },
  { value: AttributeUnit.Pair, label: "Pair" },
  { value: AttributeUnit.Pack, label: "Pack" },
  { value: AttributeUnit.Box, label: "Box" },
  { value: AttributeUnit.Set, label: "Set" },
];

export function getAttributeUnitLabel(unit: AttributeUnit): string {
  return ATTRIBUTE_UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? String(unit);
}

export enum AttributeUnit {
  Geram = 0,
  Kilo = 1,
  Meter = 2,
}

export const ATTRIBUTE_UNIT_OPTIONS: { value: AttributeUnit; label: string }[] = [
  { value: AttributeUnit.Geram, label: "Gram" },
  { value: AttributeUnit.Kilo, label: "Kilogram" },
  { value: AttributeUnit.Meter, label: "Meter" },
];

export function getAttributeUnitLabel(unit: AttributeUnit): string {
  return ATTRIBUTE_UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? String(unit);
}

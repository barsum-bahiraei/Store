export enum AttributeType {
  Strint = 0,
  Int = 1,
  Decimal = 2,
  Bool = 3,
}

export enum AttributeUnit {
  Geram = 0,
  Kilo = 1,
  Meter = 2,
}

export const ATTRIBUTE_TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: AttributeType.Strint, label: "String" },
  { value: AttributeType.Int, label: "Integer" },
  { value: AttributeType.Decimal, label: "Decimal" },
  { value: AttributeType.Bool, label: "Boolean" },
];

export const ATTRIBUTE_UNIT_OPTIONS: { value: AttributeUnit; label: string }[] = [
  { value: AttributeUnit.Geram, label: "Gram" },
  { value: AttributeUnit.Kilo, label: "Kilogram" },
  { value: AttributeUnit.Meter, label: "Meter" },
];

export function getAttributeTypeLabel(type: AttributeType): string {
  return ATTRIBUTE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? String(type);
}

export function getAttributeUnitLabel(unit: AttributeUnit): string {
  return ATTRIBUTE_UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? String(unit);
}

export interface Attribute {
  id: number;
  title: string;
  unit: AttributeUnit;
  type: AttributeType;
}

export type AttributeDto = Omit<Attribute, "id">;

export enum AttributeType {
  Strint = 0,
  Int = 1,
  Decimal = 2,
  Bool = 3,
}

export const ATTRIBUTE_TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: AttributeType.Strint, label: "String" },
  { value: AttributeType.Int, label: "Integer" },
  { value: AttributeType.Decimal, label: "Decimal" },
  { value: AttributeType.Bool, label: "Boolean" },
];

export function getAttributeTypeLabel(type: AttributeType): string {
  return ATTRIBUTE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? String(type);
}

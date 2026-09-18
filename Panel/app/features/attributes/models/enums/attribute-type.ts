export enum AttributeType {
  String = 0,
  Int = 1,
  Bool = 2,
  LongText = 3,
  Date = 4,
  DateTime = 5,
  Time = 6,
  Select = 7,
  MultiSelect = 8,
  Url = 9,
  Email = 10,
  Phone = 11,
}

export const ATTRIBUTE_TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: AttributeType.String, label: "String" },
  { value: AttributeType.Int, label: "Integer" },
  { value: AttributeType.Bool, label: "Boolean" },
  { value: AttributeType.LongText, label: "Long text" },
  { value: AttributeType.Date, label: "Date" },
  { value: AttributeType.DateTime, label: "Date and time" },
  { value: AttributeType.Time, label: "Time" },
  { value: AttributeType.Select, label: "Select" },
  { value: AttributeType.MultiSelect, label: "Multi-select" },
  { value: AttributeType.Url, label: "URL" },
  { value: AttributeType.Email, label: "Email" },
  { value: AttributeType.Phone, label: "Phone" },
];

export function getAttributeTypeLabel(type: AttributeType): string {
  return ATTRIBUTE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? String(type);
}

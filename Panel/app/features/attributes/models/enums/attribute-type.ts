export enum AttributeType {
  String = 0,
  Int = 1,
  Bool = 2,
  LongText = 3,
  Date = 4,
  DateTime = 5,
  Time = 6,
  Url = 7,
  Email = 8,
  Phone = 9,
}

export const ATTRIBUTE_TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: AttributeType.String, label: "متن" },
  { value: AttributeType.Int, label: "عدد صحیح" },
  { value: AttributeType.Bool, label: "بولین" },
  { value: AttributeType.LongText, label: "متن بلند" },
  { value: AttributeType.Date, label: "تاریخ" },
  { value: AttributeType.DateTime, label: "تاریخ و زمان" },
  { value: AttributeType.Time, label: "زمان" },
  { value: AttributeType.Url, label: "آدرس اینترنتی" },
  { value: AttributeType.Email, label: "ایمیل" },
  { value: AttributeType.Phone, label: "تلفن" },
];

export function getAttributeTypeLabel(type: AttributeType): string {
  return ATTRIBUTE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? String(type);
}

import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

export function parseProfileDate(value: string | null): DateObject | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:$|T| )/.test(value)) return null;
  const datePart = value.slice(0, 10);
  const date = new DateObject({ date: datePart, format: "YYYY-MM-DD", calendar: gregorian, locale: gregorianEn });
  return date.isValid && date.format("YYYY-MM-DD") === datePart ? date : null;
}

export function formatPersianProfileDate(value: string | null): string | null {
  return parseProfileDate(value)?.convert(persian, persianFa).format("YYYY/MM/DD") ?? null;
}

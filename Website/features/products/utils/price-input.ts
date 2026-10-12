const smallNumbers = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const scales = ["", "هزار", "میلیون", "میلیارد", "تریلیون", "کوادریلیون"];

export function normalizePriceDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) - (digit >= "۰" ? 1776 : 1632))).replace(/\D/g, "");
}

function groupToWords(value: number): string {
  const parts: string[] = [];
  if (value >= 100) parts.push(hundreds[Math.floor(value / 100)]);
  const remainder = value % 100;
  if (remainder >= 20) {
    parts.push(tens[Math.floor(remainder / 10)]);
    if (remainder % 10) parts.push(smallNumbers[remainder % 10]);
  } else if (remainder) {
    parts.push(smallNumbers[remainder]);
  }
  return parts.join(" و ");
}

export function priceToWords(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) return "";
  if (value === 0) return "صفر تومان";
  const parts: string[] = [];
  let remaining = value;
  let scale = 0;
  while (remaining > 0) {
    const group = remaining % 1000;
    if (group) {
      const words = group === 1 && scale === 1 ? "هزار" : [groupToWords(group), scales[scale]].filter(Boolean).join(" ");
      parts.unshift(words);
    }
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return `${parts.join(" و ")} تومان`;
}

export const priceFormatter = new Intl.NumberFormat("fa-IR", {
  style: "decimal",
  maximumFractionDigits: 0,
});

export function formatToman(price: number) {
  return `${priceFormatter.format(price)} تومان`;
}

export function getSalePrice(price: number, discount: number) {
  return Math.max(0, price - discount);
}

export function getProductImageUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7185/api";
  return `${apiBase.replace(/\/api\/?$/, "")}/${url.replace(/^\//, "")}`;
}

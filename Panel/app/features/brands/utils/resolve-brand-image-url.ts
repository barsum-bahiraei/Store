import type { BrandImage } from "../models/brand";

export function resolveBrandImageUrl(image: BrandImage | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image.url)) return image.url;

  const baseUrl = import.meta.env.VITE_MINIO_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${image.url.replace(/^\//, "")}` : null;
}

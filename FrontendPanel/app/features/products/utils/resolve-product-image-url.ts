import type { ProductListOutput } from "../models/product";

export function resolveProductImageUrl(image: ProductListOutput["image"]): string | null {
  if (!image) return null;

  const path = typeof image === "string" ? image : image.url;
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = import.meta.env.VITE_MINIO_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${path.replace(/^\//, "")}` : null;
}

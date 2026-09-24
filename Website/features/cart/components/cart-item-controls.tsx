"use client";

import { formatVariantLabel } from "@/features/products/utils/product";
import type { ProductVariant } from "@/features/products/types/product";
import { useCartItemActions } from "../hooks/use-cart";

type CartItemControlsProps = {
  productId: number;
  productName: string;
  productCount: number;
  productVariantId?: number;
  cartItemId?: number;
  variant?: ProductVariant;
};

export function CartItemControls({ productId, productName, productCount, productVariantId, cartItemId, variant }: CartItemControlsProps) {
  const { change, isPending, error } = useCartItemActions({
    productId,
    productVariantId,
    cartItemId,
    productCount,
    productName,
    variantName: variant ? formatVariantLabel(variant.values) : undefined,
  });
  const stock = variant?.stock;
  const outOfStock = stock === 0;
  const atStockLimit = stock != null && productCount >= stock;
  const buttonClass = "grid size-11 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
        <div className="flex items-center rounded-lg border border-border">
          <button type="button" onClick={() => change("decrease")} disabled={isPending} aria-label={productCount === 1 ? `حذف ${productName}` : `کاهش تعداد ${productName}`} className={buttonClass}>
            <span className="material-symbols-rounded" aria-hidden="true">{productCount === 1 ? "delete" : "remove"}</span>
          </button>
          <span className="min-w-10 text-center text-sm font-bold tabular-nums" aria-live="polite" aria-label={`تعداد: ${productCount}`}>{productCount}</span>
          <button type="button" onClick={() => change("increase")} disabled={isPending || outOfStock || atStockLimit} aria-label={`افزایش تعداد ${productName}`} className={buttonClass}>
            <span className="material-symbols-rounded" aria-hidden="true">add</span>
          </button>
        </div>
        <button type="button" onClick={() => change("remove")} disabled={isPending} aria-label={`حذف ${productName} از سبد`} className={`${buttonClass} text-error`}>
          <span className="material-symbols-rounded" aria-hidden="true">delete</span>
        </button>
        {isPending && <span role="status" className="text-xs text-muted-foreground">در حال به‌روزرسانی…</span>}
      </div>
      {outOfStock && <p role="status" className="mt-2 text-xs font-bold text-error">ناموجود — امکان افزایش تعداد نیست.</p>}
      {!outOfStock && atStockLimit && <p role="status" className="mt-2 text-xs text-muted-foreground">حداکثر موجودی در سبد است.</p>}
      {error && <p role="alert" className="mt-2 text-sm text-error">{error.message}</p>}
    </div>
  );
}

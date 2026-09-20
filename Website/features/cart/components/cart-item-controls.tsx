"use client";

import { useCartItemActions } from "../hooks/use-cart";
import type { CartItem } from "../types/cart";

type CartItemControlsProps = {
  item: Pick<CartItem, "id" | "productCount"> & { product: Pick<CartItem["product"], "id" | "name"> };
  productVariantId?: number;
};

export function CartItemControls({ item, productVariantId }: CartItemControlsProps) {
  const { change, isPending, error } = useCartItemActions({
    productId: item.product.id,
    productVariantId,
    cartItemId: productVariantId == null ? item.id : undefined,
    productCount: item.productCount,
    productName: item.product.name,
  });
  const buttonClass = "grid size-11 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
        <div className="flex items-center rounded-lg border border-border">
          <button type="button" onClick={() => change("decrease")} disabled={isPending}             aria-label={item.productCount === 1 ? `حذف ${item.product.name}` : `کاهش تعداد ${item.product.name}`} className={buttonClass}>
            <span className="material-symbols-rounded" aria-hidden="true">{item.productCount === 1 ? "delete" : "remove"}</span>
          </button>
          <span className="min-w-10 text-center text-sm font-bold tabular-nums" aria-live="polite" aria-label={`تعداد: ${item.productCount}`}>{item.productCount}</span>
          <button type="button" onClick={() => change("increase")} disabled={isPending}             aria-label={`افزایش تعداد ${item.product.name}`} className={buttonClass}>
            <span className="material-symbols-rounded" aria-hidden="true">add</span>
          </button>
        </div>
        <button type="button" onClick={() => change("remove")} disabled={isPending} aria-label={`حذف ${item.product.name} از سبد`} className={`${buttonClass} text-error`}>
          <span className="material-symbols-rounded" aria-hidden="true">delete</span>
        </button>
        {isPending && <span role="status" className="text-xs text-muted-foreground">در حال به‌روزرسانی…</span>}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error.message}</p>}
    </div>
  );
}

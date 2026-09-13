import type { Metadata } from "next";
import { CartContent } from "@/features/cart/components/cart-content";
import { StoreHeader } from "@/features/categories/components/store-header";

export const metadata: Metadata = {
  title: "Shopping cart | Store",
  description: "Review your shopping cart and manage product quantities.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 text-foreground sm:px-8 sm:py-14">
        <h1 className="mb-6 text-3xl font-black tracking-tight">Shopping cart</h1>
        <CartContent />
      </main>
    </>
  );
}

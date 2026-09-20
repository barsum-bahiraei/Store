import type { Metadata } from "next";
import { CheckoutContent } from "@/features/checkout/components/checkout-content";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: "تکمیل خرید | فروشگاه",
  description: "روش تحویل و پرداخت سفارش خود را بررسی و ثبت کنید.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-foreground sm:px-8 sm:py-14">
        <CheckoutContent />
      </main>
      <StoreFooter />
    </>
  );
}

import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { HeroSlider } from "@/features/home/components/hero-slider";
import { StoreBenefits } from "@/features/home/components/store-benefits";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: "فروشگاه | انتخاب‌های هوشمند برای زندگی روزمره",
  description: "تازه‌ترین محصولات و کالاهای کاربردی روزمره را در فروشگاه پیدا کنید.",
};

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="flex-1">
        <HeroSlider />
        <StoreBenefits />
        <FeaturedProducts />
      </main>
      <StoreFooter />
    </div>
  );
}

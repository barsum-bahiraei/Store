import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { HeroSlider } from "@/features/home/components/hero-slider";
import { StoreBenefits } from "@/features/home/components/store-benefits";

export const metadata: Metadata = {
  title: "فروشگاه | انتخاب‌های هوشمند برای زندگی روزمره",
  description: "تازه‌ترین محصولات و کالاهای کاربردی روزمره را در فروشگاه پیدا کنید.",
};

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <StoreHeader />
      <main>
        <HeroSlider />
        <StoreBenefits />
        <FeaturedProducts />
      </main>
    </div>
  );
}

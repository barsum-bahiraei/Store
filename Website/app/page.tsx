import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { BrandShowcase } from "@/features/home/components/brand-showcase";
import { HeroSlider } from "@/features/home/components/hero-slider";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: { absolute: "لوازم کمپ و کوه‌نوردی زریوان | تجهیزات طبیعت‌گردی" },
  description: "خرید لوازم کمپینگ، کوه‌نوردی و تجهیزات طبیعت‌گردی از فروشگاه زریوان.",
};

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <StoreHeader />
      <main className="flex-1">
        <HeroSlider />
        <FeaturedProducts />
        <BrandShowcase />
      </main>
      <StoreFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { HeroSlider } from "@/features/home/components/hero-slider";
import { StoreBenefits } from "@/features/home/components/store-benefits";

export const metadata: Metadata = {
  title: "Store | Thoughtful goods for everyday life",
  description: "Discover curated everyday essentials, fresh arrivals, and considered design for you and your home.",
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

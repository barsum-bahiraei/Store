import type { Metadata } from "next";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";
import { ProductDetailContent } from "@/features/products/components/product-detail";

export const metadata: Metadata = {
  title: "جزئیات محصول | فروشگاه",
  description: "مشاهده جزئیات محصول، مشخصات فنی، اطلاعات فروشنده و نظرات مشتریان.",
};

export default async function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  return <div className="flex min-h-dvh flex-col bg-background text-foreground"><StoreHeader /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-8 lg:px-12"><ProductDetailContent productId={Number(id)} /></main><StoreFooter /></div>;
}

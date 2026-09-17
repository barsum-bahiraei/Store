import type { Metadata } from "next";
import { AccountProfile } from "@/features/auth/components/account-profile";
import { StoreHeader } from "@/features/categories/components/store-header";
import { StoreFooter } from "@/features/layout/components/store-footer";

export const metadata: Metadata = {
  title: "حساب من | فروشگاه",
  description: "اطلاعات حساب کاربری خود را مشاهده کنید.",
  robots: { index: false, follow: false },
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { tab, returnTo } = await searchParams;
  return (
    <>
      <StoreHeader />
      <AccountProfile tab={tab === "cart" || tab === "orders" || tab === "bookmarks" ? tab : "profile"} returnTo={returnTo === "/checkout" ? returnTo : undefined} />
      <StoreFooter />
    </>
  );
}

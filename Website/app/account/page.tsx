import type { Metadata } from "next";
import { AccountProfile } from "@/features/auth/components/account-profile";

export const metadata: Metadata = {
  title: "حساب من | فروشگاه",
  description: "اطلاعات حساب کاربری خود را مشاهده کنید.",
  robots: { index: false, follow: false },
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { tab } = await searchParams;
  return <AccountProfile tab={tab === "cart" || tab === "orders" ? tab : "profile"} />;
}

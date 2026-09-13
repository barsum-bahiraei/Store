import type { Metadata } from "next";
import { AccountProfile } from "@/features/auth/components/account-profile";

export const metadata: Metadata = {
  title: "My account | Store",
  description: "View your Store account profile.",
  robots: { index: false, follow: false },
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { tab } = await searchParams;
  return <AccountProfile tab={tab === "cart" || tab === "orders" ? tab : "profile"} />;
}

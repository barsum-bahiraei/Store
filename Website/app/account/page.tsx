import type { Metadata } from "next";
import { AccountProfile } from "@/features/auth/components/account-profile";

export const metadata: Metadata = {
  title: "My account | Store",
  description: "View your Store account profile.",
};

export default function AccountPage() {
  return <AccountProfile />;
}

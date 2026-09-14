import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "ساخت حساب | فروشگاه",
  description: "حساب کاربری خود را در فروشگاه بسازید.",
};

export default function RegisterPage() {
  return <AuthShell title="حساب خود را بسازید" description="برای تجربه خرید سریع‌تر و شخصی‌تر به فروشگاه بپیوندید."><RegisterForm /></AuthShell>;
}

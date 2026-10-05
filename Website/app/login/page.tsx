import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "ورود",
  description: "وارد حساب کاربری خود در لوازم کمپ و کوه‌نوردی زریوان شوید.",
};

export default function LoginPage() {
  return <AuthShell title="خوش آمدید" description="برای ادامه وارد حساب کاربری خود شوید."><LoginForm /></AuthShell>;
}

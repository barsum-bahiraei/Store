import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create account | Store",
  description: "Create your Store account.",
};

export default function RegisterPage() {
  return <AuthShell title="Create your account" description="Join Store for a faster, more personal shopping experience."><RegisterForm /></AuthShell>;
}

import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Store",
  description: "Sign in to your Store account.",
};

export default function LoginPage() {
  return <AuthShell title="Welcome back" description="Sign in to continue to your account."><LoginForm /></AuthShell>;
}

import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpVerifyForm } from "@/features/auth/components/otp-verify-form";

export const metadata: Metadata = {
  title: "تأیید کد | فروشگاه",
  description: "کد تأیید ارسال شده به شماره تماس خود را وارد کنید.",
};

export default async function VerifyOtpPage({ searchParams }: PageProps<"/verify-otp">) {
  const params = await searchParams;
  const phone = typeof params.phone === "string" ? params.phone : null;
  return (
    <AuthShell title="تأیید کد" description="کد تأیید ارسال شده به شماره تماس خود را وارد کنید.">
      {phone ? <OtpVerifyForm phone={phone} /> : <p className="text-sm text-muted-foreground">شماره تماس مشخص نیست. <a href="/login" className="font-bold text-primary hover:text-primary-hover">بازگشت به ورود</a></p>}
    </AuthShell>
  );
}

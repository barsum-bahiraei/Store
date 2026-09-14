"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegister } from "../hooks/use-account";
import type { Gender } from "../types/account";

const inputClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    if (password !== String(formData.get("confirmPassword") ?? "")) {
      setError("رمزهای عبور یکسان نیستند.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ نویسه باشد.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        gender: Number(formData.get("gender")) as Gender,
        password,
      });
      router.push("/account");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "ساخت حساب انجام نشد.");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="firstName" className="text-sm font-bold">نام</label><input id="firstName" name="firstName" autoComplete="given-name" required className={inputClassName} /></div>
          <div><label htmlFor="lastName" className="text-sm font-bold">نام خانوادگی</label><input id="lastName" name="lastName" autoComplete="family-name" required className={inputClassName} /></div>
        </div>
        <div><label htmlFor="email" className="text-sm font-bold">ایمیل</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="example@email.com" dir="ltr" className={inputClassName} /></div>
        <div><label htmlFor="gender" className="text-sm font-bold">جنسیت</label><select id="gender" name="gender" defaultValue="2" className={inputClassName}><option value="2">ترجیح می‌دهم نگویم</option><option value="0">مرد</option><option value="1">زن</option></select></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="password" className="text-sm font-bold">رمز عبور</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required className={inputClassName} /></div>
          <div><label htmlFor="confirmPassword" className="text-sm font-bold">تکرار رمز عبور</label><input id="confirmPassword" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required className={inputClassName} /></div>
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}
        <button type="submit" disabled={registerMutation.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
          {registerMutation.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {registerMutation.isPending ? "در حال ساخت حساب…" : "ساخت حساب"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">حساب دارید؟ <Link href="/login" className="font-black text-primary hover:text-primary-hover">وارد شوید</Link></p>
    </>
  );
}

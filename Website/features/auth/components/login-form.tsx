"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSendOtp } from "../hooks/use-account";

const inputClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

export function LoginForm() {
  const router = useRouter();
  const sendOtpMutation = useSendOtp();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();

    if (!phoneNumber) {
      setError("شماره تماس را وارد کنید.");
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({ phoneNumber });
      router.push(`/verify-otp?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "ارسال کد انجام نشد.");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="phoneNumber" className="text-sm font-bold">شماره تماس</label>
          <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required placeholder="09123456789" dir="ltr" className={inputClassName} />
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}
        <button type="submit" disabled={sendOtpMutation.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
          {sendOtpMutation.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {sendOtpMutation.isPending ? "در حال ارسال کد…" : "ارسال کد تأیید"}
        </button>
      </form>
    </>
  );
}

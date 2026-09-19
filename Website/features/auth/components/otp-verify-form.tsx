"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSendOtp, useVerifyOtp } from "../hooks/use-account";

const OTP_EXPIRY_SECONDS = 5 * 60;
const INPUT_LENGTH = 5;

export function OtpVerifyForm({ phone }: { phone: string }) {
  const router = useRouter();
  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_EXPIRY_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const canResend = remainingSeconds <= 0;

  useEffect(() => {
    mountedRef.current = true;
    inputRef.current?.focus();
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleVerify = useCallback(async (codeValue: string) => {
    setError("");
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await verifyOtpMutation.mutateAsync({ phoneNumber: phone, code: codeValue });
      router.push("/account");
    } catch (caughtError) {
      if (!mountedRef.current) return;
      setError(caughtError instanceof Error ? caughtError.message : "تأیید کد انجام نشد.");
      setCode("");
      inputRef.current?.focus();
    }
  }, [verifyOtpMutation, phone, router]);

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "").slice(0, INPUT_LENGTH);
    setCode(value);
    if (value.length === INPUT_LENGTH) {
      handleVerify(value);
    }
  }

  async function handleResend() {
    setError("");
    setCode("");
    try {
      await sendOtpMutation.mutateAsync({ phoneNumber: phone });
      if (mountedRef.current) {
        setRemainingSeconds(OTP_EXPIRY_SECONDS);
        inputRef.current?.focus();
      }
    } catch (caughtError) {
      if (!mountedRef.current) return;
      setError(caughtError instanceof Error ? caughtError.message : "ارسال مجدد کد انجام نشد.");
    }
  }

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); if (code.length === INPUT_LENGTH) handleVerify(code); }} className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">کد تأیید ارسال شده به شماره <span className="font-bold text-foreground" dir="ltr">{phone}</span> را وارد کنید.</p>
          <input
            ref={inputRef}
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={INPUT_LENGTH}
            value={code}
            onChange={handleCodeChange}
            dir="ltr"
            placeholder="-----"
            className="mt-3 h-14 w-full rounded-xl border border-border bg-surface px-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={`font-mono font-bold ${canResend ? "text-muted-foreground" : "text-foreground"}`}>
            {canResend ? "زمان تمام شد" : formattedTime}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || sendOtpMutation.isPending}
            className="font-bold text-primary outline-none hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendOtpMutation.isPending ? "در حال ارسال…" : "ارسال مجدد کد"}
          </button>
        </div>

        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}

        <button type="submit" disabled={code.length !== INPUT_LENGTH || verifyOtpMutation.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
          {verifyOtpMutation.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {verifyOtpMutation.isPending ? "در حال تأیید…" : "تأیید کد"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground"><Link href="/login" className="font-black text-primary hover:text-primary-hover">تغییر شماره تماس</Link></p>
    </>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { useTheme } from "~/contexts/theme-context";
import loginImage from "~/assets/images/login.png";

const OTP_LENGTH = 5;
const RESEND_COOLDOWN = 300;

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const phoneNumber = (location.state as { phoneNumber?: string } | null)?.phoneNumber;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/", { replace: true });
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== OTP_LENGTH) {
      setError(`کد تأیید باید ${OTP_LENGTH} رقم باشد.`);
      return;
    }

    if (!phoneNumber) return;

    setSubmitting(true);
    try {
      await verifyOtp(phoneNumber, code);
      navigate("/attributes", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "کد تأیید نامعتبر است.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber || remainingSeconds > 0) return;
    setError("");
    try {
      await sendOtp(phoneNumber);
      setRemainingSeconds(RESEND_COOLDOWN);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "امکان ارسال مجدد کد وجود ندارد.");
    }
  };

  const maskedPhone = phoneNumber
    ? phoneNumber.slice(0, 4) + "***" + phoneNumber.slice(-2)
    : "";

  return (
    <div className="flex min-h-screen">
      <button
        onClick={toggleTheme}
        className="fixed left-4 top-4 z-10 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="تغییر پوسته"
      >
        <span className="material-symbols-outlined">
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
      </button>
      <div className="hidden lg:block lg:w-1/2">
        <div className="relative h-full w-full">
          <img src={loginImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <span className="material-symbols-outlined text-xl text-white">dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">تأیید کد</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              کد تأیید {OTP_LENGTH} رقمی ارسال شده به {maskedPhone} را وارد کنید
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                کد تأیید
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                  setCode(value);
                }}
                placeholder="------"
                dir="ltr"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-lg tracking-[0.5em] text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting || code.length !== OTP_LENGTH}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-950"
            >
              {submitting ? "در حال تأیید..." : "تأیید کد"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {remainingSeconds > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ارسال مجدد کد تا {formatTime(remainingSeconds)} دیگر فعال می‌شود
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                ارسال مجدد کد تأیید
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              تغییر شماره تماس
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

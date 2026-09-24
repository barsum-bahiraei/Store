import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { useTheme } from "~/contexts/theme-context";
import {
  canAccessPanel,
  getDefaultPanelPath,
} from "~/features/auth/utils/authorization";
import loginImage from "~/assets/images/login.png";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { sendOtp, isReady, isAuthenticated, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady || !isAuthenticated || !currentUser) return;
    if (!canAccessPanel(currentUser)) return;
    navigate(getDefaultPanelPath(currentUser), { replace: true });
  }, [isReady, isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phoneNumber.replace(/\s+/g, "");
    if (!cleaned) {
      setError("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    if (!/^(09\d{9}|\+989\d{9}|00989\d{9})$/.test(cleaned)) {
      setError("شماره تماس وارد شده معتبر نیست.");
      return;
    }

    setSubmitting(true);
    try {
      await sendOtp(cleaned);
      navigate("/verify", { state: { phoneNumber: cleaned } });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "امکان ارسال کد تأیید وجود ندارد.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-600">progress_activity</span>
      </div>
    );
  }

  if (isAuthenticated && currentUser && !canAccessPanel(currentUser)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-950">
        <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="material-symbols-outlined text-5xl text-red-500">lock</span>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">دسترسی غیرمجاز</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            شما دسترسی لازم برای ورود به پنل مدیریت را ندارید.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <button
        onClick={toggleTheme}
        className="fixed left-4 top-4 z-10 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="تغییر پوسته"
      >
        <span className="material-symbols-outlined" suppressHydrationWarning>
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
      </button>
      <div className="hidden lg:block lg:w-1/2">
        <div className="relative h-full w-full">
          <img
            src={loginImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <span className="material-symbols-outlined text-xl text-white">dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">خوش آمدید</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              شماره تماس خود را وارد کنید تا کد تأیید دریافت کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                شماره تماس
              </label>
              <input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                dir="ltr"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-950"
            >
              {submitting ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

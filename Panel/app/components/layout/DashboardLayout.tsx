import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { Sidebar } from "~/components/layout/Sidebar";
import {
  canAccessPanel,
  canAccessRoute,
} from "~/features/auth/utils/authorization";

export default function DashboardLayout() {
  const { isAuthenticated, isReady, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
  }, [isAuthenticated, isReady, navigate]);

  if (!isReady || !isAuthenticated) return null;

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
        <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="material-symbols-outlined text-5xl text-red-500">lock</span>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            دسترسی غیرمجاز
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            شما دسترسی لازم برای ورود به پنل مدیریت را ندارید.
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
            className="mt-6 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            بازگشت به ورود
          </button>
        </section>
      </main>
    );
  }

  if (
    !canAccessPanel(currentUser) ||
    !canAccessRoute(currentUser, location.pathname)
  ) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
              aria-label="باز کردن منو"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">پنل فروشگاه</p>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">فضای مدیریت</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="flex min-h-11 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-800"
          >
            <div className="hidden text-left sm:block">
              <p className="max-w-48 truncate text-sm font-medium text-gray-900 dark:text-white">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "حساب من"}
              </p>
              <p className="max-w-48 truncate text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {currentUser ? `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase() || <span className="material-symbols-outlined text-xl">person</span> : <span className="material-symbols-outlined text-xl">person</span>}
            </div>
            <span className="material-symbols-outlined hidden text-lg text-gray-400 sm:block">chevron_left</span>
          </Link>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

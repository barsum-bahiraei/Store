import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { Sidebar } from "~/components/layout/Sidebar";

export default function DashboardLayout() {
  const { isAuthenticated, isReady, currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isReady, navigate]);

  if (!isReady || !isAuthenticated) return null;

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
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Store Panel</p>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">Management workspace</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="flex min-h-11 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-800"
          >
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-medium text-gray-900 dark:text-white">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "My account"}
              </p>
              <p className="max-w-48 truncate text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {currentUser ? `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase() : <span className="material-symbols-outlined text-xl">person</span>}
            </div>
            <span className="material-symbols-outlined hidden text-lg text-gray-400 sm:block">chevron_right</span>
          </Link>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { Sidebar } from "~/components/layout/Sidebar";

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}

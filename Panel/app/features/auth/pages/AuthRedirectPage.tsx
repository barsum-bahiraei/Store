import { Navigate } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { canAccessPanel } from "~/features/auth/utils/authorization";

export default function AuthRedirectPage() {
  const { isReady, isAuthenticated, currentUser } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-600">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canAccessPanel(currentUser)) return <Navigate to="/404" replace />;

  return <Navigate to="/dashboard" replace />;
}

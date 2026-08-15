import { Link, useLocation } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { useTheme } from "~/contexts/theme-context";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { to: "/products", label: "Products", icon: "inventory_2" },
  { to: "/attributes", label: "Attributes", icon: "list_alt" },
  { to: "/categories", label: "Categories", icon: "folder" },
  { to: "/roles", label: "Roles", icon: "admin_panel_settings" },
  { to: "/users", label: "Users", icon: "group" },
];

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto lg:translate-x-0 lg:transition-none`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary-600">dashboard</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Panel</span>
          </div>
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

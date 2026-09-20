import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "~/contexts/auth-context";
import { useTheme } from "~/contexts/theme-context";
import { canAccessRoute } from "~/features/auth/utils/authorization";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  children: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "محصولات",
    icon: "inventory_2",
    children: [
      { to: "/products", label: "همه محصولات", icon: "inventory_2" },
      { to: "/brands", label: "برندها", icon: "branding_watermark" },
      { to: "/variants", label: "رنگ‌ها", icon: "palette" },
    ],
  },
];

const navItems: NavItem[] = [
  { to: "/sellers", label: "فروشندگان", icon: "storefront" },
  { to: "/attributes", label: "ویژگی‌ها", icon: "list_alt" },
  { to: "/categories", label: "دسته‌بندی‌ها", icon: "folder" },
  { to: "/roles", label: "نقش‌ها", icon: "admin_panel_settings" },
  { to: "/users", label: "کاربران", icon: "group" },
  { to: "/discount-codes", label: "کدهای تخفیف", icon: "local_offer" },
];

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of navGroups) {
      if (group.children.some((child) => location.pathname === child.to)) {
        initial.add(group.label);
      }
    }
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const linkClasses = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    }`;

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      children: group.children.filter((child) =>
        canAccessRoute(currentUser, child.to),
      ),
    }))
    .filter((group) => group.children.length > 0);
  const visibleItems = navItems.filter((item) =>
    canAccessRoute(currentUser, item.to),
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        } lg:static lg:z-auto lg:translate-x-0 lg:transition-none`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary-600">dashboard</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">پنل</span>
          </div>
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.label);
            const isGroupActive = group.children.some(
              (child) => location.pathname === child.to
            );

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isGroupActive && !isExpanded
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{group.icon}</span>
                  <span className="flex-1 text-right">{group.label}</span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isExpanded && (
                  <div className="mr-4 mt-0.5 space-y-0.5 border-r border-gray-200 pr-3 dark:border-gray-700">
                    {group.children.map((child) => {
                      const isActive = location.pathname === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={onMobileClose}
                          className={linkClasses(isActive)}
                        >
                          <span className="material-symbols-outlined text-[20px]">{child.icon}</span>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {visibleItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={linkClasses(isActive)}
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
            <span className="material-symbols-outlined text-[20px]" suppressHydrationWarning>
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            <span suppressHydrationWarning>{theme === "dark" ? "حالت روشن" : "حالت تاریک"}</span>
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}

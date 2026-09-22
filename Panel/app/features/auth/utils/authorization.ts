import { UserRole, type AccountUser } from "~/features/auth/models/account";

const ownerRoutes = ["/attributes", "/categories", "/roles", "/users", "/discount-codes", "/brands", "/variants"];
const sellerRoutes = ["/products", "/sellers"];
const sharedRoutes = ["/profile"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function hasRole(user: AccountUser | null, role: UserRole) {
  return user?.roles.includes(role) ?? false;
}

export function canAccessPanel(user: AccountUser | null) {
  return hasRole(user, UserRole.Owner) || hasRole(user, UserRole.Seller);
}

export function canAccessRoute(user: AccountUser | null, pathname: string) {
  if (!canAccessPanel(user)) return false;
  if (matchesRoute(pathname, sharedRoutes)) return true;

  return (
    (hasRole(user, UserRole.Owner) && matchesRoute(pathname, ownerRoutes)) ||
    (hasRole(user, UserRole.Seller) && matchesRoute(pathname, sellerRoutes))
  );
}

export function getDefaultPanelPath(user: AccountUser | null) {
  if (hasRole(user, UserRole.Seller)) return "/products";
  if (hasRole(user, UserRole.Owner)) return "/attributes";
  return "/404";
}

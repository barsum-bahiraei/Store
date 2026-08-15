import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("features/auth/pages/LoginPage.tsx"),
  route("register", "features/auth/pages/RegisterPage.tsx"),
  layout("components/layout/DashboardLayout.tsx", [
    route("products", "features/products/pages/ProductsPage.tsx"),
    route("attributes", "features/attributes/pages/AttributesPage.tsx"),
    route("categories", "features/categories/pages/CategoriesPage.tsx"),
    route("roles", "features/access/pages/RolesPage.tsx"),
    route("users", "features/access/pages/UsersPage.tsx"),
    route("profile", "features/auth/pages/ProfilePage.tsx"),
  ]),
  route("*", "features/not-found/pages/NotFoundPage.tsx"),
] satisfies RouteConfig;

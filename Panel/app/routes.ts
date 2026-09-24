import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("features/auth/pages/LoginPage.tsx"),
  route("verify", "features/auth/pages/VerifyPage.tsx"),
  layout("components/layout/DashboardLayout.tsx", [
    route("products", "features/products/pages/ProductsPage.tsx"),
    route("brands", "features/brands/pages/BrandsPage.tsx"),
    route("sellers", "features/sellers/pages/SellersPage.tsx"),
    route("attributes", "features/attributes/pages/AttributesPage.tsx"),
    route("categories", "features/categories/pages/CategoriesPage.tsx"),
    route("roles", "features/access/pages/RolesPage.tsx"),
    route("users", "features/access/pages/UsersPage.tsx"),
    route("discount-codes", "features/discount-codes/pages/DiscountCodesPage.tsx"),
    route("profile", "features/auth/pages/ProfilePage.tsx"),
  ]),
  route("*", "features/not-found/pages/NotFoundPage.tsx"),
] satisfies RouteConfig;

import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("features/auth/pages/LoginPage.tsx"),
  route("register", "features/auth/pages/RegisterPage.tsx"),
  layout("components/layout/DashboardLayout.tsx", [
    route("attributes", "features/attributes/pages/AttributesPage.tsx"),
  ]),
] satisfies RouteConfig;

import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  {
    path: "authentication",
    file: "pages/authentication/index.tsx",
    children: [
      {
        path: "login",
        file: "pages/authentication/login.tsx",
      },
      {
        path: "register",
        file: "pages/authentication/register.tsx",
      },
    ],
  },
] satisfies RouteConfig;

import type { Route } from "./+types/authentication/index";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" }
  ];
}

export default function AuthenticationIndex() {
  return (
    <Outlet />
  );
}

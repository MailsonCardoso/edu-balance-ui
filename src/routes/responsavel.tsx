import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/responsavel")({
  component: ResponsavelLayout,
});

function ResponsavelLayout() {
  return <Outlet />;
}

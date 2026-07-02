import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/financeiro")({
  component: FinanceiroLayout,
});

function FinanceiroLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

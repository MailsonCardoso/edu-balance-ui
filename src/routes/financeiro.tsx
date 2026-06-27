import { Outlet, createFileRoute, useRouterState, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financeiro")({
  component: FinanceiroLayout,
});

const tabs = [
  { to: "/financeiro", label: "Mensalidades", exact: true },
  { to: "/financeiro/dashboard", label: "Dashboard" },
  { to: "/financeiro/entradas", label: "Entradas" },
  { to: "/financeiro/saidas", label: "Saídas" },
];

function FinanceiroLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.to
            : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}

import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financeiro")({
  component: FinanceiroLayout,
});

const tabs = [
  { to: "/financeiro", label: "Mensalidades", exact: true },
  { to: "/financeiro/receitas", label: "Receitas" },
  { to: "/financeiro/despesas", label: "Despesas" },
];

function FinanceiroLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-border pb-2">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                active
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
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

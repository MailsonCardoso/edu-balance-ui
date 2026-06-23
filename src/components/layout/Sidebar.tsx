import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Wallet,
  AlertTriangle,
  FileBarChart,
  UserCircle,
  GraduationCap,
  ChevronLeft,
  LogOut,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/inadimplentes", label: "Inadimplentes", icon: AlertTriangle },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/perfil", label: "Perfil", icon: UserCircle },
  { to: "/gestao-noticias", label: "Notícias", icon: Newspaper },
  { to: "/gestao-ouvidoria", label: "Ouvidoria", icon: MessageCircle },
] as const;

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 sticky top-0 h-screen z-30",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <div className="size-9 rounded-lg bg-primary/20 grid place-items-center shrink-0">
          <GraduationCap className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">EduFinance</span>
            <span className="text-[11px] text-sidebar-foreground/60">Gestão Escolar</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          aria-label="Recolher menu"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Link>
      </div>
    </aside>
  );
}

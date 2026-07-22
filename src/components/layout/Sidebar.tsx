import { Link, useRouterState } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Tags,
  FileText,
  ScrollText,
  Package,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Gestão Financeira",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/financeiro", label: "Mensalidades", icon: Wallet },
      { to: "/financeiro/receita-despesa", label: "Receita/Despesa", icon: TrendingUp },
      { to: "/inadimplentes", label: "Inadimplentes", icon: AlertTriangle },
      { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { to: "/alunos", label: "Alunos", icon: Users },
      { to: "/gestao-associados", label: "Associados", icon: Users },
      { to: "/gestao-categorias", label: "Categorias", icon: Tags },
    ],
  },
  {
    title: "Administração",
    items: [
      { to: "/gestao-inventario", label: "Inventário", icon: Package },
      { to: "/gestao-noticias", label: "Notícias", icon: Newspaper },
      { to: "/gestao-ouvidoria", label: "Ouvidoria", icon: MessageCircle },
      { to: "/gestao-documentos", label: "Documentos", icon: FileText },
      { to: "/gestao-estatuto", label: "Estatuto", icon: ScrollText },
      { to: "/gestao-auditoria", label: "Auditoria", icon: ShieldCheck },
    ],
  },
  {
    title: "Pessoal",
    items: [
      { to: "/perfil", label: "Perfil", icon: UserCircle },
    ],
  },
];

const allNav = sections.flatMap((s) => s.items);

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

      <ScrollArea className="flex-1 bg-sidebar" type="never">
        <nav className="px-2 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-4 last:mb-0">
            {!collapsed && (
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const sorted = [...allNav].sort((a, b) => b.to.length - a.to.length);
                const best = sorted.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
                const active = best?.to === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
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
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>

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

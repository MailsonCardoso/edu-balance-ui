import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md hover:bg-accent"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar alunos, mensalidades..."
          className="w-full h-10 pl-9 pr-3 rounded-md bg-muted/50 border border-transparent focus:border-ring focus:bg-background outline-none text-sm transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>
        <button className="p-2 rounded-md hover:bg-accent relative" aria-label="Notificações">
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-3 pl-3 ml-2 border-l border-border">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium">Admin Escola</span>
            <span className="text-xs text-muted-foreground">admin@escola.com</span>
          </div>
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground font-semibold text-sm">
            AE
          </div>
        </div>
      </div>
    </header>
  );
}

import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md hover:bg-accent"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

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
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

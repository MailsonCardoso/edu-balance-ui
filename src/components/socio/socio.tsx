import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* ProfileCard — cartão hero de perfil do associado                          */
/* -------------------------------------------------------------------------- */

export function ProfileCard({
  nome,
  status,
  desde,
}: {
  nome: string;
  status: string;
  desde: string;
}) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-[0_18px_48px_-12px_color-mix(in_oklab,var(--color-brand)_55%,transparent)] animate-fade-up">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-black/10 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-sm ring-1 ring-white/30">
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Bem-vindo</p>
          <h1 className="truncate text-xl font-bold leading-tight">{nome}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {status === "ativo" ? "Ativo" : status}
            </span>
            <span className="text-xs text-white/70">Sócio desde {desde}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* InfoTile — mini card de informação (email, telefone, data...)             */
/* -------------------------------------------------------------------------- */

export function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.04] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-transform duration-200 active:scale-[0.98] animate-fade-up">
      <div className="mb-2 flex items-center gap-2 text-brand">
        <div className="grid size-8 place-items-center rounded-xl bg-brand-light">
          <Icon className="size-4" />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* StatCard — card de métrica com profundidade                                */
/* -------------------------------------------------------------------------- */

const toneMap = {
  brand: "bg-brand-light text-brand",
  emerald: "bg-emerald-50 text-emerald-500",
  amber: "bg-amber-50 text-amber-500",
  red: "bg-red-50 text-red-500",
  blue: "bg-blue-50 text-blue-500",
} as const;

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneMap;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.04] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <div className={cn("grid size-8 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionTitle — título de seção                                             */
/* -------------------------------------------------------------------------- */

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-1">
      <h2 className="text-base font-bold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FloatingTabBar — navegação inferior flutuante                             */
/* -------------------------------------------------------------------------- */

export function FloatingTabBar({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string; icon: LucideIcon }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
      <div className="flex items-center justify-between gap-1 rounded-2xl border border-black/[0.04] bg-white/90 p-1.5 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-300",
                isActive ? "text-brand" : "text-gray-400 hover:text-gray-600",
              )}
            >
              {isActive && (
                <span className="absolute -top-1 size-1 rounded-full bg-brand animate-tab-pulse" />
              )}
              <span
                className={cn(
                  "grid place-items-center rounded-xl p-1.5 transition-all duration-300",
                  isActive && "bg-brand-light scale-105",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="max-w-full truncate px-0.5 text-[9px] font-semibold leading-tight">
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* AppHeader — cabeçalho compacto (desktop)                                  */
/* -------------------------------------------------------------------------- */

export function AppHeader({ nome, onLogout }: { nome: string; onLogout: () => void }) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white">
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-400">Painel do associado</p>
          <h1 className="truncate text-sm font-bold text-gray-900">Olá, {nome.split(" ")[0]}</h1>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sair"
          className="grid size-9 place-items-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:scale-95"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}

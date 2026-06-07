import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}) {
  const toneMap = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-2 tracking-tight">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={cn("size-10 rounded-lg grid place-items-center", toneMap[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pago: "bg-success/15 text-success border-success/30",
    pendente: "bg-warning/15 text-warning border-warning/30",
    vencido: "bg-destructive/15 text-destructive border-destructive/30",
    parcial: "bg-info/15 text-info border-info/30",
    ativo: "bg-success/15 text-success border-success/30",
    inativo: "bg-muted text-muted-foreground border-border",
    em_dia: "bg-success/15 text-success border-success/30",
    inadimplente: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const label = status.replace("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        map[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center mb-4">
        <svg className="size-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

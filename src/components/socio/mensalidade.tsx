import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { type Mensalidade, type OrigemPagamento } from "@/lib/mock-data";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string; icon: LucideIcon }
> = {
  pago: { label: "Pago", color: "text-emerald-600", dot: "bg-emerald-500", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "text-amber-600", dot: "bg-amber-500", icon: Clock },
  atrasado: { label: "Atrasado", color: "text-red-600", dot: "bg-red-500", icon: AlertCircle },
};

const origemConfig: Record<OrigemPagamento, { label: string; color: string; icon: LucideIcon }> = {
  mercadopago: { label: "Mercado Pago", color: "bg-sky-50 text-sky-700", icon: Clock },
  caixa: { label: "Caixa", color: "bg-blue-50 text-blue-700", icon: Clock },
  admin: { label: "Admin", color: "bg-gray-100 text-gray-600", icon: Clock },
  pix_manual: { label: "PIX", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  dinheiro: { label: "Dinheiro", color: "bg-amber-50 text-amber-700", icon: Clock },
  transferencia: { label: "Transferência", color: "bg-purple-50 text-purple-700", icon: Clock },
};

export function MensalidadeRow({
  m,
  onPagar,
  pagando,
  showAluno,
}: {
  m: Mensalidade;
  onPagar?: (m: Mensalidade) => void;
  pagando?: boolean;
  showAluno?: boolean;
}) {
  const status = statusConfig[m.status] ?? statusConfig.pendente;
  const StatusIcon = status.icon;
  const origem = m.origem ? origemConfig[m.origem] : null;
  const OrigemIcon = origem?.icon ?? Clock;
  const aberto = m.status === "pendente" || m.status === "atrasado";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-fade-up">
      <span className={cn("size-2.5 shrink-0 rounded-full", status.dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900">{m.mesReferencia}</p>
          {showAluno && m.alunoNome && (
            <span className="truncate text-[11px] text-gray-400">· {m.alunoNome}</span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className={cn("text-[11px] font-semibold", status.color)}>{status.label}</span>
          {origem && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                origem.color,
              )}
            >
              <OrigemIcon className="size-2.5" />
              {origem.label}
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            {m.status === "pago" ? `Pago ${m.dataPagamento}` : `Vence ${m.dataVencimento}`}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-sm font-bold text-gray-900">{brl(m.valor)}</p>
        {aberto && onPagar && (
          <button
            onClick={() => onPagar(m)}
            disabled={pagando}
            className="grid size-9 place-items-center rounded-full bg-brand text-white shadow-[0_6px_16px_-6px_var(--color-brand)] transition-transform duration-150 active:scale-90 disabled:opacity-60"
            aria-label="Pagar com PIX"
          >
            {pagando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <StatusIcon className="size-4" />
            )}
          </button>
        )}
        {!aberto && <CheckCircle2 className="size-4 text-emerald-500" />}
      </div>
    </div>
  );
}

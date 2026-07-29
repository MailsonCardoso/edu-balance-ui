import { X, Download } from "lucide-react";
import type { Mensalidade } from "@/lib/mock-data";
import { brl, fmtDate, fmtDateFull, numeroExtenso } from "@/lib/format";
import { baixarPdfRecibo } from "@/lib/recibo";

const formaPagamentoLabel: Record<string, string> = {
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
};

function labelPagamento(m: Mensalidade): string {
  if (m.formaPagamento) return formaPagamentoLabel[m.formaPagamento] ?? m.formaPagamento;
  if (m.origem === "mercadopago") return "Mercado Pago";
  if (m.origem === "pix_manual") return "PIX";
  return "—";
}

export function ReciboModal({
  mensalidade,
  onClose,
}: {
  mensalidade: Mensalidade;
  onClose: () => void;
}) {
  const rotulo = mensalidade.alunoSexo === "feminino" ? "Aluna" : "Aluno";
  const dataPg = mensalidade.dataPagamento ? fmtDateFull(mensalidade.dataPagamento) : "—";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-pop-in rounded-t-3xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
        >
          <X className="size-4" />
        </button>

        <div className="pt-4 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-400">Comprovante de Pagamento</p>
          <p className="mt-1 text-lg font-bold text-gray-900">Bombeiro Paranã</p>
          <p className="text-[11px] text-gray-400">Colégio Militar 2 de Julho – Unidade XII – Paranã</p>
        </div>

        <div className="mt-5 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-2.5">
            <span className="text-gray-400">{rotulo}:</span>
            <span className="font-medium text-gray-900">{mensalidade.alunoNome || "—"}</span>
            <span className="text-gray-400">Responsável:</span>
            <span className="font-medium text-gray-900">{mensalidade.alunoResponsavel || "—"}</span>
            <span className="text-gray-400">Mês:</span>
            <span className="font-medium text-gray-900">{mensalidade.mesReferencia}</span>
            <span className="text-gray-400">Valor:</span>
            <span className="font-medium text-gray-900">
              {brl(mensalidade.valor)} <span className="text-[11px] text-gray-400">({numeroExtenso(mensalidade.valor)})</span>
            </span>
            <span className="text-gray-400">Pagamento:</span>
            <span className="font-medium text-gray-900">{dataPg}</span>
            <span className="text-gray-400">Forma:</span>
            <span className="font-medium capitalize text-gray-900">{labelPagamento(mensalidade)}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Paranã, {dataPg}.
        </p>

        <div className="mt-5 text-center border-t border-gray-100 pt-4">
          <div className="inline-block border-t border-gray-300 pt-2 px-10">
            <p className="text-xs font-semibold text-gray-600">Responsável pelo Recebimento</p>
            <p className="text-[10px] text-gray-400">Colégio Militar 2 de Julho – Unidade XII – Paranã</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            Fechar
          </button>
          <button
            onClick={() => baixarPdfRecibo(mensalidade)}
            className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_var(--color-brand)] transition-colors hover:brightness-110 active:scale-[0.98]"
          >
            <Download className="mr-1.5 inline size-4" />
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

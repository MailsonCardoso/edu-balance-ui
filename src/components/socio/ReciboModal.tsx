import { useRef, useState } from "react";
import { X, Download, ImageDown } from "lucide-react";
import type { Mensalidade } from "@/lib/mock-data";
import { baixarPdfRecibo } from "@/lib/recibo";
import { baixarPngRecibo } from "@/lib/recibo-png";
import { ReciboVisual } from "@/components/shared/ReciboVisual";

export function ReciboModal({
  mensalidade,
  onClose,
}: {
  mensalidade: Mensalidade;
  onClose: () => void;
}) {
  const reciboRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg animate-pop-in rounded-t-3xl bg-white p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] sm:rounded-3xl sm:p-6 max-h-[90dvh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-x-auto pb-2 pt-2">
          <ReciboVisual ref={reciboRef} mensalidade={mensalidade} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            Fechar
          </button>
          <button
            onClick={() => baixarPdfRecibo(mensalidade)}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            <Download className="mr-1.5 inline size-4" />
            Baixar PDF
          </button>
          <button
            onClick={async () => {
              if (!reciboRef.current || gerando) return;
              setGerando(true);
              try {
                await baixarPngRecibo(reciboRef.current, `recibo-${mensalidade.id}`);
              } finally {
                setGerando(false);
              }
            }}
            disabled={gerando}
            className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_var(--color-brand)] transition-colors hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {gerando ? (
              "Gerando..."
            ) : (
              <>
                <ImageDown className="mr-1.5 inline size-4" />
                Baixar Imagem
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          A imagem abre direto no chat do WhatsApp com visual bonito. O PDF é útil para arquivar ou imprimir.
        </p>
      </div>
    </div>
  );
}
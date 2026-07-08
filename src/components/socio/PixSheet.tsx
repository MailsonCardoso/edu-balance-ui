import { Smartphone, CheckCircle2, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PixSheet({
  open,
  status,
  qrCodeBase64,
  qrCode,
  onClose,
}: {
  open: boolean;
  status: "waiting" | "confirmed";
  qrCodeBase64?: string;
  qrCode?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copy = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm animate-pop-in rounded-t-3xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] sm:rounded-3xl">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
        >
          <X className="size-4" />
        </button>

        {status === "confirmed" ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-9 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-emerald-600">Pagamento confirmado!</h3>
            <p className="mt-1 text-sm text-gray-400">Redirecionando...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-brand">
              <div className="grid size-9 place-items-center rounded-xl bg-brand-light">
                <Smartphone className="size-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Pague com PIX</h3>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Escaneie o QR Code abaixo com o app do seu banco
            </p>

            {qrCodeBase64 && (
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="mx-auto my-5 size-52 rounded-2xl border border-gray-100 bg-white p-2"
              />
            )}

            {qrCode && (
              <button
                onClick={copy}
                className="flex w-full items-center justify-between gap-2 rounded-2xl bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 active:scale-[0.99]"
              >
                <span className="truncate font-mono text-[11px] text-gray-500">{qrCode}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm">
                  {copied ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </span>
              </button>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="size-2 animate-pulse rounded-full bg-brand" />
              Aguardando pagamento...
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Play,
  Send,
  Shield,
  MessageCircle,
  Save,
  X,
} from "lucide-react";
import type { OuvidoriaListItem } from "@/lib/api/ouvidoria";

const tipoLabel: Record<string, string> = {
  sugestao: "Sugestão",
  reclamacao: "Reclamação",
  denuncia: "Denúncia",
  elogio: "Elogio",
  outro: "Outro",
};

const tipoColor: Record<string, string> = {
  sugestao: "text-blue-600 bg-blue-50",
  reclamacao: "text-red-600 bg-red-50",
  denuncia: "text-orange-600 bg-orange-50",
  elogio: "text-emerald-600 bg-emerald-50",
  outro: "text-gray-600 bg-gray-50",
};

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; label: string }
> = {
  pendente: {
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
    label: "Pendente",
  },
  em_andamento: {
    icon: Play,
    color: "text-blue-600 bg-blue-50",
    label: "Em Andamento",
  },
  respondido: {
    icon: Send,
    color: "text-emerald-600 bg-emerald-50",
    label: "Respondido",
  },
};

const viewCls =
  "w-full min-h-10 px-3 py-2.5 rounded-md bg-muted/30 border border-border text-sm text-foreground flex items-center";

export function OuvidoriaSheet({
  open,
  onOpenChange,
  item,
  onStartAtendimento,
  onResponder,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OuvidoriaListItem | null;
  onStartAtendimento: (id: number, descricao?: string) => void;
  onResponder: (id: number, descricao: string) => void;
  isPending: boolean;
}) {
  const [descricao, setDescricao] = useState("");
  const [action, setAction] = useState<"view" | "start" | "respond">("view");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDescricao("");
      setAction("view");
    }
    onOpenChange(open);
  };

  if (!item) return null;

  const config = statusConfig[item.status] || statusConfig.pendente;
  const StatusIcon = config.icon;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="pr-8">
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono text-primary">{item.protocolo}</span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
            >
              <StatusIcon className="size-3" />
              {config.label}
            </span>
          </SheetTitle>
          <SheetDescription>Detalhes da manifestação</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Informações
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Protocolo
                </label>
                <p className={viewCls + " font-mono"}>{item.protocolo}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Data
                </label>
                <p className={viewCls}>{item.created_at}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tipo
                </label>
                <div className={viewCls}>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tipoColor[item.tipo] || "text-gray-600 bg-gray-50"}`}
                  >
                    {tipoLabel[item.tipo] || item.tipo}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </label>
                <div className={viewCls}>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
                  >
                    <StatusIcon className="size-3" />
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Autor
            </h4>
            {item.anonimo ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="size-4 text-amber-500" />
                Manifestação anônima
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nome
                  </label>
                  <p className={viewCls}>{item.nome}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    E-mail
                  </label>
                  <p className={viewCls}>{item.email}</p>
                </div>
              </div>
            )}
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Mensagem
            </h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-background p-3 rounded-md border border-border">
              {item.mensagem}
            </p>
          </section>

          {item.descricao && (
            <section className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary inline-block" />
                Resposta/Descrição
              </h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-background p-3 rounded-md border border-border">
                {item.descricao}
              </p>
            </section>
          )}

          {item.status === "pendente" && action === "view" && (
            <div className="pt-2">
              <Button
                onClick={() => setAction("start")}
                className="w-full"
              >
                <Play className="size-4" /> Iniciar Atendimento
              </Button>
            </div>
          )}

          {item.status === "em_andamento" && action === "view" && (
            <div className="pt-2">
              <Button
                onClick={() => setAction("respond")}
                className="w-full"
              >
                <Send className="size-4" /> Registrar Resposta
              </Button>
            </div>
          )}

          {action === "start" && (
            <section className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-500 inline-block" />
                Iniciar Atendimento
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Descrição (opcional)
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  placeholder="Adicione uma observação..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAction("view");
                    setDescricao("");
                  }}
                >
                  <X className="size-4" /> Cancelar
                </Button>
                <Button
                  onClick={() => {
                    onStartAtendimento(item.id, descricao.trim() || undefined);
                    handleOpenChange(false);
                  }}
                  disabled={isPending}
                >
                  <Save className="size-4" />
                  {isPending ? "Salvando..." : "Confirmar"}
                </Button>
              </div>
            </section>
          )}

          {action === "respond" && (
            <section className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                Registrar Resposta
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Resposta *
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  placeholder="Digite a resposta ao cidadão..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAction("view");
                    setDescricao("");
                  }}
                >
                  <X className="size-4" /> Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (descricao.trim()) {
                      onResponder(item.id, descricao.trim());
                      handleOpenChange(false);
                    }
                  }}
                  disabled={!descricao.trim() || isPending}
                >
                  <Send className="size-4" />
                  {isPending ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

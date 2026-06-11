import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, History, Loader2, MoreVertical, Plus, Pencil, Printer, Search, Trash2, X } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { ActionSheet } from "@/components/shared/ActionSheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Mensalidade, Aluno, FormaPagamento } from "@/lib/mock-data";
import { brl, fmtDate, maskDate } from "@/lib/format";
import { toast } from "sonner";
import { fetchAlunos } from "@/lib/api/alunos";
import { fetchMensalidades, createMensalidade, updateMensalidade, deleteMensalidade } from "@/lib/api/mensalidades";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

const formaPagamentoLabel: Record<string, string> = {
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
};

function Financeiro() {
  const [data, setData] = useState<Mensalidade[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mensalidade | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    alunoId: "",
    mesReferencia: "",
    valor: 0,
    dataVencimento: "",
    formaPagamento: "nenhuma",
  });

  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const [pagamentoId, setPagamentoId] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState("");
  const [reciboMensalidade, setReciboMensalidade] = useState<Mensalidade | null>(null);

  const carregar = async () => {
    try {
      const [m, a] = await Promise.all([fetchMensalidades(), fetchAlunos()]);
      setData(m);
      setAlunos(a);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (m) =>
          (!q ||
            (m.alunoNome || "").toLowerCase().includes(q.toLowerCase()) ||
            m.mesReferencia.includes(q)) &&
          (statusFilter === "all" || m.status === statusFilter),
      ),
    [data, q, statusFilter],
  );

  const totals = useMemo(
    () => ({
      pago: filtered.filter((m) => m.status === "pago").reduce((s, m) => s + m.valor, 0),
      pendente: filtered
        .filter((m) => m.status === "pendente" || m.status === "atrasado")
        .reduce((s, m) => s + m.valor, 0),
      vencido: filtered.filter((m) => m.status === "atrasado").reduce((s, m) => s + m.valor, 0),
    }),
    [filtered],
  );

  const mesCorrente = () => {
    const hoje = new Date();
    const mes = hoje.toLocaleDateString("pt-BR", { month: "long" });
    return mes.charAt(0).toUpperCase() + mes.slice(1) + "/" + hoje.getFullYear();
  };

  const abrirForm = (mode: "create" | "edit", mensalidade?: Mensalidade) => {
    setFormMode(mode);
    if (mode === "edit" && mensalidade) {
      setFormData({
        alunoId: mensalidade.alunoId,
        mesReferencia: mensalidade.mesReferencia,
        valor: mensalidade.valor,
        dataVencimento: mensalidade.dataVencimento,
        formaPagamento: mensalidade.formaPagamento ?? "nenhuma",
      });
    } else {
      setFormData({ alunoId: "", mesReferencia: mesCorrente(), valor: 0, dataVencimento: "", formaPagamento: "nenhuma" });
    }
    setFormOpen(true);
  };

  const aoSelecionarAluno = (alunoId: string) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) return;
    const hoje = new Date();
    const mesNum = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(aluno.diaVencimento || 10).padStart(2, "0");
    setFormData((f) => ({
      ...f,
      alunoId,
      valor: aluno.valorMensalidade,
      dataVencimento: `${dia}/${mesNum}/${hoje.getFullYear()}`,
    }));
  };

  const toIsoDate = (ddmmaaa: string) => {
    const partes = ddmmaaa.split("/");
    if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return ddmmaaa;
  };

  const salvarForm = async () => {
    try {
      const dataVencimento = toIsoDate(formData.dataVencimento);
      const formaPg = formData.formaPagamento === "nenhuma" ? null : formData.formaPagamento;
      if (formMode === "create") {
        await createMensalidade({
          alunoId: formData.alunoId,
          mesReferencia: formData.mesReferencia,
          valor: formData.valor,
          dataVencimento,
          status: "pendente",
          formaPagamento: formaPg as FormaPagamento | null,
        });
        toast.success("Mensalidade criada!");
      } else {
        await updateMensalidade(selectedMensalidade!.id, {
          alunoId: formData.alunoId,
          mesReferencia: formData.mesReferencia,
          valor: formData.valor,
          dataVencimento,
          formaPagamento: formaPg as FormaPagamento | null,
        });
        toast.success("Mensalidade atualizada!");
      }
      setFormOpen(false);
      setSelectedMensalidade(null);
      await carregar();
    } catch {
      toast.error("Erro ao salvar mensalidade");
    }
  };

  const confirmarPagamento = async () => {
    try {
      await updateMensalidade(pagamentoId, {
        status: "pago",
        dataPagamento: new Date().toISOString().split("T")[0],
        formaPagamento: (pagamentoForma || null) as FormaPagamento | null,
      });
      toast.success("Pagamento registrado!");
      setPagamentoOpen(false);
      setSelectedMensalidade(null);
      await carregar();
      const updated = data.find((m) => m.id === pagamentoId);
      if (updated) setReciboMensalidade(updated);
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMensalidade(deleteTarget.id);
      toast.success("Mensalidade excluída");
      setDeleteTarget(null);
      setSelectedMensalidade(null);
      await carregar();
    } catch {
      toast.error("Erro ao excluir mensalidade");
    }
  };

  const gerarPdf = (m: Mensalidade) => {
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - ${m.alunoNome}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 60px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 24px; margin-bottom: 4px; }
          .header p { font-size: 14px; color: #555; }
          .info { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
          .row { display: flex; justify-content: space-between; align-items: baseline; }
          .row .label { color: #555; font-size: 14px; }
          .row .value { font-size: 14px; font-weight: 600; text-align: right; max-width: 55%; }
          .highlight { background: #e6f7e6; border: 1px solid #b7e6b7; border-radius: 8px; padding: 20px; text-align: center; margin-top: 20px; }
          .highlight p { font-size: 14px; color: #2e7d32; font-weight: 600; }
          .highlight small { font-size: 12px; color: #666; }
          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 16px; }
          @media print { body { padding: 40px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bombeiro Paranã</h1>
          <p>Colegio Militar 2 de Julho Unidade XII - Paranã</p>
        </div>
        <div class="info">
          <div class="row"><span class="label">Aluno:</span><span class="value">${m.alunoNome || "—"}</span></div>
          <div class="row"><span class="label">Responsável:</span><span class="value">${m.alunoResponsavel || "—"}</span></div>
          <div class="row"><span class="label">Mês referente:</span><span class="value">${m.mesReferencia}</span></div>
          <div class="row"><span class="label">Valor:</span><span class="value">${brl(m.valor)}</span></div>
          <div class="row"><span class="label">Data pagamento:</span><span class="value">${m.dataPagamento ? fmtDate(m.dataPagamento) : "—"}</span></div>
          <div class="row"><span class="label">Forma de pagamento:</span><span class="value">${m.formaPagamento ? formaPagamentoLabel[m.formaPagamento] : "—"}</span></div>
        </div>
        <div class="highlight">
          <p>Pagamento recebido com sucesso!</p>
          <small>O responsável foi informado sobre o recebimento.</small>
        </div>
        <div class="footer">Documento gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
        <script>window.print();window.close();<\/script>
      </body>
      </html>
    `);
    janela.document.close();
  };

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Mensalidades, pagamentos e histórico"
        actions={
          <Button onClick={() => abrirForm("create")}>
            <Plus className="size-4" /> Nova mensalidade
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Recebido (filtro)</p>
          <p className="text-2xl font-semibold mt-1 text-success">{brl(totals.pago)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">A receber</p>
          <p className="text-2xl font-semibold mt-1 text-warning">{brl(totals.pendente)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Vencido</p>
          <p className="text-2xl font-semibold mt-1 text-destructive">{brl(totals.vencido)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aluno ou mês..."
              className="pl-9 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Sem mensalidades" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Mês</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.alunoNome || "—"}</td>
                    <td className="px-4 py-3">{m.mesReferencia}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.dataVencimento)}</td>
                    <td className="px-4 py-3 font-medium">{brl(m.valor)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {m.formaPagamento ? (
                        <span className="capitalize">{formaPagamentoLabel[m.formaPagamento]}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedMensalidade(m)}
                        className="p-1.5 rounded hover:bg-accent"
                        title="Ações"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ActionSheet
        open={!!selectedMensalidade && !formOpen && !pagamentoOpen && !deleteTarget && !reciboMensalidade}
        onOpenChange={(open) => {
          if (!open) setSelectedMensalidade(null);
        }}
        title={
          selectedMensalidade
            ? `${selectedMensalidade.alunoNome || "—"} — ${selectedMensalidade.mesReferencia}`
            : ""
        }
        description={
          selectedMensalidade
            ? `${brl(selectedMensalidade.valor)} — ${selectedMensalidade.status.replace("_", " ")}`
            : ""
        }
        actions={
          selectedMensalidade
            ? [
                {
                  label: "Editar",
                  icon: <Pencil className="size-5" />,
                  onClick: () => abrirForm("edit", selectedMensalidade),
                },
                ...(selectedMensalidade.status !== "pago"
                  ? [
                      {
                        label: "Registrar pagamento",
                        icon: <CheckCircle2 className="size-5" />,
                        onClick: () => {
                          setPagamentoId(selectedMensalidade.id);
                          setPagamentoForma(selectedMensalidade.formaPagamento ?? "");
                          setPagamentoOpen(true);
                        },
                      },
                    ]
                  : []),
                ...(selectedMensalidade.status === "pago"
                  ? [
                      {
                        label: "Recibo",
                        icon: <FileText className="size-5" />,
                        onClick: () => setReciboMensalidade(selectedMensalidade),
                      },
                    ]
                  : []),
                {
                  label: "Excluir",
                  icon: <Trash2 className="size-5" />,
                  destructive: true,
                  onClick: () => setDeleteTarget(selectedMensalidade),
                },
              ]
            : []
        }
      />

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>{formMode === "create" ? "Nova mensalidade" : "Editar mensalidade"}</SheetTitle>
            <SheetDescription>
              {formMode === "create"
                ? "Preencha os dados para criar uma nova mensalidade"
                : "Altere os dados da mensalidade"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aluno</label>
              <Select
                value={formData.alunoId}
                onValueChange={aoSelecionarAluno}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione um aluno..." />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mês referência</label>
              <Input
                className="h-10"
                placeholder="Ex: Junho/2026"
                value={formData.mesReferencia}
                onChange={(e) => setFormData((f) => ({ ...f, mesReferencia: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="h-10"
                placeholder="0,00"
                value={formData.valor || ""}
                onChange={(e) => setFormData((f) => ({ ...f, valor: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data vencimento</label>
              <Input
                className="h-10"
                placeholder="DD/MM/AAAA"
                value={formData.dataVencimento}
                onChange={(e) => {
                  const masked = maskDate(e.target.value);
                  setFormData((f) => ({ ...f, dataVencimento: masked }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Forma de pagamento</label>
              <Select
                value={formData.formaPagamento}
                onValueChange={(v) => setFormData((f) => ({ ...f, formaPagamento: v }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem forma</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={salvarForm}>
              {formMode === "create" ? "Criar" : "Salvar"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensalidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a mensalidade de{" "}
              <strong>{deleteTarget?.alunoNome || "—"}</strong> ({deleteTarget?.mesReferencia})?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pagamentoOpen} onOpenChange={(o) => { if (!o) setPagamentoOpen(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme o registro do pagamento e informe a forma de pagamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
              Forma de pagamento
            </label>
            {(["", "pix", "debito", "credito"] as const).map((v) => (
              <label
                key={v}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  pagamentoForma === v
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
              >
                <input
                  type="radio"
                  name="formaPagamento"
                  value={v}
                  checked={pagamentoForma === v}
                  onChange={() => setPagamentoForma(v)}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-medium">
                  {v === "" ? "Sem forma" : v === "pix" ? "Pix" : v === "debito" ? "Débito" : "Crédito"}
                </span>
              </label>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarPagamento}>
              Confirmar pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!reciboMensalidade} onOpenChange={(o) => { if (!o) setReciboMensalidade(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Recibo de Pagamento</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4 space-y-4 text-sm">
            <div className="text-center border-b border-border pb-4">
              <p className="font-bold text-base">Bombeiro Paranã</p>
              <p className="text-muted-foreground">Colegio Militar 2 de Julho Unidade XII - Paranã</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aluno:</span>
                <span className="font-medium text-right max-w-[60%]">{reciboMensalidade?.alunoNome || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responsável:</span>
                <span className="font-medium text-right max-w-[60%]">{reciboMensalidade?.alunoResponsavel || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mês referente:</span>
                <span className="font-medium">{reciboMensalidade?.mesReferencia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-semibold">{reciboMensalidade ? brl(reciboMensalidade.valor) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data pagamento:</span>
                <span className="font-medium">{reciboMensalidade?.dataPagamento ? fmtDate(reciboMensalidade.dataPagamento) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de pagamento:</span>
                <span className="font-medium capitalize">{reciboMensalidade?.formaPagamento ? formaPagamentoLabel[reciboMensalidade.formaPagamento] : "—"}</span>
              </div>
            </div>
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
              <p className="text-success font-medium text-sm">
                Pagamento recebido com sucesso!
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                O responsável foi informado sobre o recebimento.
              </p>
            </div>
          </div>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setReciboMensalidade(null)}>
              Fechar
            </Button>
            {reciboMensalidade && (
              <Button onClick={() => gerarPdf(reciboMensalidade)}>
                <Printer className="size-4" /> Baixar PDF
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

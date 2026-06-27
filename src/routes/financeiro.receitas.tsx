import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { fetchRevenues, createRevenue, updateRevenue, deleteRevenue, type Revenue } from "@/lib/api/revenues";
import { fetchCategories, type FinancialCategory } from "@/lib/api/financial-categories";

export const Route = createFileRoute("/financeiro/receitas")({
  component: ReceitasPage,
});

const statusLabel: Record<string, string> = { pendente: "Pendente", recebido: "Recebido" };

function ReceitasPage() {
  const [data, setData] = useState<Revenue[]>([]);
  const [cats, setCats] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Revenue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Revenue | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ descricao: "", valor: 0, data: "", status: "pendente" as const, financial_category_id: "", observacao: "" });

  const carregar = async () => {
    try {
      const [r, c] = await Promise.all([fetchRevenues(), fetchCategories()]);
      setData(r);
      setCats(c.filter((x) => x.tipo === "receita"));
    } catch { toast.error("Erro ao carregar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const filtered = data.filter((r) => !q || r.descricao.toLowerCase().includes(q.toLowerCase()));

  const abrirForm = (item?: Revenue) => {
    if (item) {
      setForm({ descricao: item.descricao, valor: item.valor, data: item.data, status: item.status, financial_category_id: String(item.financial_category_id || ""), observacao: item.observacao || "" });
      setSelected(item);
    } else {
      setForm({ descricao: "", valor: 0, data: "", status: "pendente", financial_category_id: "", observacao: "" });
      setSelected(null);
    }
    setFormOpen(true);
  };

  const salvar = async () => {
    try {
      const payload = { ...form, valor: Number(form.valor), financial_category_id: form.financial_category_id ? Number(form.financial_category_id) : null };
      if (selected) {
        await updateRevenue(selected.id, payload);
        toast.success("Receita atualizada!");
      } else {
        await createRevenue(payload);
        toast.success("Receita criada!");
      }
      setFormOpen(false);
      setSelected(null);
      await carregar();
    } catch { toast.error("Erro ao salvar"); }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRevenue(deleteTarget.id);
      toast.success("Receita excluída");
      setDeleteTarget(null);
      await carregar();
    } catch { toast.error("Erro ao excluir"); }
  };

  const totals = { pendente: filtered.filter((r) => r.status === "pendente").reduce((s, r) => s + r.valor, 0), recebido: filtered.filter((r) => r.status === "recebido").reduce((s, r) => s + r.valor, 0) };

  return (
    <>
      <PageHeader title="Receitas" description="Outras receitas além de mensalidades" actions={<Button onClick={() => abrirForm()}><Plus className="size-4" /> Nova receita</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">Recebido</p><p className="text-2xl font-semibold mt-1 text-success">{brl(totals.recebido)}</p></div>
        <div className="bg-card border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">Pendente</p><p className="text-2xl font-semibold mt-1 text-warning">{brl(totals.pendente)}</p></div>
      </div>
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex gap-3 border-b border-border">
          <div className="relative flex-1"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-9 h-10" /></div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          : filtered.length === 0 ? <EmptyState title="Sem receitas" />
          : <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3 font-medium">Descrição</th><th className="px-4 py-3 font-medium">Valor</th><th className="px-4 py-3 font-medium">Data</th><th className="px-4 py-3 font-medium">Categoria</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 w-12"></th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.descricao}</td>
                    <td className="px-4 py-3">{brl(r.valor)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.data)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.category?.nome || "—"}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "recebido" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{statusLabel[r.status]}</span></td>
                    <td className="px-4 py-3"><button onClick={() => abrirForm(r)} className="p-1.5 rounded hover:bg-accent"><Pencil className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8"><SheetTitle>{selected ? "Editar" : "Nova"} receita</SheetTitle><SheetDescription>Preencha os dados da receita</SheetDescription></SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</label><Input className="h-10" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor (R$)</label><Input type="number" step="0.01" className="h-10" value={form.valor || ""} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) || 0 }))} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</label><Input type="date" className="h-10" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label><Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as "pendente" | "recebido" }))}><SelectTrigger className="h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="recebido">Recebido</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</label><Select value={form.financial_category_id} onValueChange={(v) => setForm((f) => ({ ...f, financial_category_id: v }))}><SelectTrigger className="h-10"><SelectValue placeholder="Sem categoria" /></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observação</label><Input className="h-10" value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} /></div>
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}><X className="size-4" /> Cancelar</Button>
            <Button onClick={salvar}>{selected ? "Salvar" : "Criar"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir receita</AlertDialogTitle><AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sim, excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}

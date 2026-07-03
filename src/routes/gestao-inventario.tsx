import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  DollarSign,
  Search,
  Plus,
  FileSpreadsheet,
  Eye,
  ArrowUpDown,
  Printer,
  MoreHorizontal,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
  Package,
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "@/components/shared/Primitives";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { brl, fmtDate, maskCurrency, parseCurrency, toDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  fetchPatrimonios,
  createPatrimonio,
  updatePatrimonio,
  deletePatrimonio,
  categoriasDisponiveis,
  localizacoesDisponiveis,
  type Patrimonio,
  type PatrimonioStatus,
  type PatrimonioCategoria,
  type PatrimonioLocalizacao,
} from "@/lib/api/patrimonio";

export const Route = createFileRoute("/gestao-inventario")({
  component: GestaoInventario,
});

const statusList: PatrimonioStatus[] = ["ativo", "em_manutencao", "baixado", "emprestado"];

const motivosBaixa = [
  "Danificado (sem conserto)",
  "Doado",
  "Vendido",
  "Roubo ou perda",
  "Obsoleto/Substituído",
  "Outro",
] as const;

function GestaoInventario() {
  const [data, setData] = useState<Patrimonio[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [locFilter, setLocFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Patrimonio | null>(null);

  const [detailsTarget, setDetailsTarget] = useState<Patrimonio | null>(null);
  const [baixaTarget, setBaixaTarget] = useState<{ item?: Patrimonio; bulkIds?: Set<string> } | null>(null);
  const [baixaMotivo, setBaixaMotivo] = useState("");

  const allSelected = data.length > 0 && selected.size === data.length;

  useEffect(() => {
    fetchPatrimonios()
      .then(setData)
      .catch(() => toast.error("Erro ao carregar inventário"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (q) {
      const term = q.toLowerCase();
      result = result.filter(
        (i) =>
          i.nome.toLowerCase().includes(term) ||
          i.tag.toLowerCase().includes(term) ||
          i.numeroSerie.toLowerCase().includes(term),
      );
    }
    if (catFilter !== "all") result = result.filter((i) => i.categoria === catFilter);
    if (locFilter !== "all") result = result.filter((i) => i.localizacao === locFilter);
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    return result;
  }, [data, q, catFilter, locFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  const kpis = useMemo(() => {
    const total = data.length;
    const valorTotal = data.reduce((s, i) => s + (Number(i.valorCompra) || 0), 0);
    return { total, valorTotal };
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [q, catFilter, locFilter, statusFilter]);

  useEffect(() => {
    setSelected(new Set());
  }, [data]);

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(paginated.map((i) => i.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((i) => ({
        Tag: i.tag,
        Nome: i.nome,
        "Nº Série": i.numeroSerie,
        Categoria: i.categoria,
        Localização: i.localizacao,
        Responsável: i.responsavel,
        Setor: i.setor,
        "Valor de Compra": i.valorCompra,
        "Data de Compra": i.dataCompra,
        "Última Auditoria": i.dataUltimaAuditoria ?? "",
        Status: i.status,
        Observação: i.observacao ?? "",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patrimônios");
    XLSX.writeFile(wb, `inventario-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Relatório exportado com sucesso!");
  };

  const handleSave = async (item: Patrimonio) => {
    try {
      if (editTarget) {
        const updated = await updatePatrimonio(item.id, item);
        setData((d) => d.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Ativo atualizado!");
        setEditTarget(null);
        setSheetOpen(false);
      } else {
        const created = await createPatrimonio(item as unknown as Omit<Patrimonio, "id">);
        setData((d) => [...d, created]);
        toast.success("Ativo cadastrado!");
        setSheetOpen(false);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Erro ao salvar ativo");
    }
  };

  const handleBaixaConfirm = async () => {
    if (!baixaTarget || !baixaMotivo) return;
    const motivo = `Motivo: ${baixaMotivo}`;
    try {
      if (baixaTarget.item) {
        const updated = await updatePatrimonio(baixaTarget.item.id, { status: "baixado" as PatrimonioStatus, observacao: motivo });
        setData((d) => d.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Ativo baixado!");
      } else if (baixaTarget.bulkIds) {
        const ids = Array.from(baixaTarget.bulkIds);
        await Promise.all(ids.map((id) => updatePatrimonio(id, { status: "baixado" as PatrimonioStatus, observacao: motivo })));
        setData((d) => d.map((a) => (ids.includes(a.id) ? { ...a, status: "baixado" as PatrimonioStatus, observacao: motivo } : a)));
        toast.success(`${ids.length} ativo(s) baixado(s)!`);
        setSelected(new Set());
      }
      setBaixaTarget(null);
      setBaixaMotivo("");
    } catch {
      toast.error("Erro ao dar baixa");
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setSheetOpen(true);
  };

  const openEdit = (item: Patrimonio) => {
    setEditTarget(item);
    setSheetOpen(true);
  };

  const statusColor = (status: PatrimonioStatus) => {
    const map: Record<PatrimonioStatus, string> = {
      ativo: "bg-success/15 text-success border-success/30",
      em_manutencao: "bg-warning/15 text-warning border-warning/30",
      baixado: "bg-destructive/15 text-destructive border-destructive/30",
      emprestado: "bg-info/15 text-info border-info/30",
    };
    return map[status];
  };

  const statusLabel: Record<PatrimonioStatus, string> = {
    ativo: "Ativo",
    em_manutencao: "Em Manutenção",
    baixado: "Baixado",
    emprestado: "Emprestado",
  };

  return (
    <>
      <PageHeader
        title="Gestão de Inventário"
        description="Controle de patrimônio e ativos da organização"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={exportToExcel}>
              <FileSpreadsheet className="size-4" /> Exportar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Cadastrar Ativo
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total de Itens"
          value={kpis.total}
          icon={<Box className="size-5" />}
          tone="default"
        />
        <StatCard
          label="Valor do Patrimônio"
          value={brl(kpis.valorTotal)}
          icon={<DollarSign className="size-5" />}
          tone="success"
        />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, tag ou nº de série..."
              className="pl-9 h-10"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categoriasDisponiveis.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locFilter} onValueChange={setLocFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as localizações</SelectItem>
              {localizacoesDisponiveis.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusList.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(q || catFilter !== "all" || locFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => { setQ(""); setCatFilter("all"); setLocFilter("all"); setStatusFilter("all"); }}
              title="Limpar filtros"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum ativo encontrado"
              description={data.length === 0 ? "Cadastre o primeiro ativo patrimonial." : "Ajuste os filtros para encontrar o ativo."}
              icon={<Package className="size-6" />}
            />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="size-4 rounded border-border accent-primary"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Código/Tag</th>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Categoria / Local</th>
                    <th className="px-4 py-3 font-medium">Responsável</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        selected.has(item.id) && "bg-primary/5",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          className="size-4 rounded border-border accent-primary"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {item.tag}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-muted grid place-items-center shrink-0 text-muted-foreground text-[10px] font-bold uppercase">
                            {item.categoria.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">{item.nome}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">S/N: {item.numeroSerie}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">
                            {item.categoria}
                          </span>
                          <span className="text-muted-foreground text-xs">{item.localizacao}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px] font-bold shrink-0">
                            {item.responsavel.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm leading-tight">{item.responsavel}</p>
                            <p className="text-[11px] text-muted-foreground">{item.setor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-medium tabular-nums">{brl(item.valorCompra)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", statusColor(item.status))}>
                          {statusLabel[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => setDetailsTarget(item)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Visualizar"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => toast.success(`Etiqueta de ${item.tag} gerada!`)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Imprimir etiqueta"
                          >
                            <Printer className="size-4" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded hover:bg-accent" title="Mais ações">
                                <MoreHorizontal className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => { setEditTarget(item); setSheetOpen(true); }}>
                                <Pencil className="size-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Transferência iniciada para ${item.responsavel}`)}>
                                <ArrowUpDown className="size-4 mr-2" /> Transferir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Histórico de ${item.tag} carregado`)}>
                                <FileSpreadsheet className="size-4 mr-2" /> Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setBaixaTarget({ item }); setBaixaMotivo(""); }}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4 mr-2" /> Dar Baixa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selected.size > 0 && (
                <div className="sticky bottom-0 left-0 right-0 bg-primary/5 border-t border-border px-4 py-2.5 flex items-center justify-between animate-in">
                  <p className="text-sm font-medium">{selected.size} selecionado(s)</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success("Funcionalidade em desenvolvimento")}>
                      <ArrowUpDown className="size-4" /> Transferir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Funcionalidade em desenvolvimento")}>
                      <Printer className="size-4" /> Etiquetas
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { setBaixaTarget({ bulkIds: selected }); setBaixaMotivo(""); }}>
                      Dar Baixa
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Exibindo {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} de {filtered.length}</span>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}/pág</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) { setSheetOpen(false); setEditTarget(null); } }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? "Editar Ativo" : "Cadastrar Novo Ativo"}</SheetTitle>
            <SheetDescription>
              {editTarget ? "Altere os dados do patrimônio." : "Preencha os dados para cadastrar um novo ativo."}
            </SheetDescription>
          </SheetHeader>
          <InventarioForm patrimonio={editTarget} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditTarget(null); }} />
        </SheetContent>
      </Sheet>

      <Sheet open={!!detailsTarget} onOpenChange={(open) => { if (!open) setDetailsTarget(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Ativo</SheetTitle>
            <SheetDescription>Informações completas do patrimônio.</SheetDescription>
          </SheetHeader>
          {detailsTarget && <InventarioDetails patrimonio={detailsTarget} onClose={() => setDetailsTarget(null)} />}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!baixaTarget} onOpenChange={(open) => { if (!open) { setBaixaTarget(null); setBaixaMotivo(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dar baixa no ativo</AlertDialogTitle>
            <AlertDialogDescription>
              {baixaTarget?.item
                ? `Informe o motivo para baixar ${baixaTarget.item.nome} (${baixaTarget.item.tag})`
                : `Informe o motivo para baixar ${baixaTarget?.bulkIds?.size ?? 0} ativo(s)`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            {motivosBaixa.map((motivo) => (
              <label
                key={motivo}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  baixaMotivo === motivo
                    ? "border-destructive bg-destructive/5 text-destructive"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="baixaMotivo"
                  value={motivo}
                  checked={baixaMotivo === motivo}
                  onChange={(e) => setBaixaMotivo(e.target.value)}
                  className="size-4 accent-destructive"
                />
                <span className="text-sm font-medium">{motivo}</span>
              </label>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBaixaConfirm} disabled={!baixaMotivo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Baixa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function generateTag(): string {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAT-${rand}`;
}

function InventarioForm({
  patrimonio,
  onSave,
  onCancel,
}: {
  patrimonio: Patrimonio | null;
  onSave: (item: Patrimonio) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    tag: patrimonio?.tag ?? generateTag(),
    nome: patrimonio?.nome ?? "",
    numeroSerie: patrimonio?.numeroSerie ?? "",
    categoria: (patrimonio?.categoria ?? "TI") as PatrimonioCategoria,
    localizacao: (patrimonio?.localizacao ?? "Sede") as PatrimonioLocalizacao,
    responsavel: patrimonio?.responsavel ?? "",
    setor: patrimonio?.setor ?? "",
    valorCompra: patrimonio?.valorCompra ? maskCurrency(String(Math.round(patrimonio.valorCompra * 100))) : "",
    valorDepreciado: patrimonio?.valorDepreciado ?? 0,
    dataCompra: toDateInput(patrimonio?.dataCompra),
    status: (patrimonio?.status ?? "ativo") as PatrimonioStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCompra = form.valorCompra ? parseCurrency(form.valorCompra) : 0;
    onSave({
      id: patrimonio?.id ?? "",
      tag: form.tag,
      nome: form.nome,
      numeroSerie: form.numeroSerie,
      categoria: form.categoria,
      localizacao: form.localizacao,
      responsavel: form.responsavel,
      setor: form.setor,
      valorCompra: parsedCompra,
      valorDepreciado: patrimonio ? form.valorDepreciado : parsedCompra,
      dataCompra: form.dataCompra,
      dataUltimaAuditoria: patrimonio?.dataUltimaAuditoria ?? null,
      status: form.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tag Patrimonial</label>
          <Input value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} placeholder="PAT-0001" disabled={!patrimonio} className="bg-muted/40" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nº de Série</label>
          <Input value={form.numeroSerie} onChange={(e) => setForm((f) => ({ ...f, numeroSerie: e.target.value }))} placeholder="SN-0001" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome do Ativo</label>
        <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Notebook Dell Latitude" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</label>
          <Select value={form.categoria} onValueChange={(v: PatrimonioCategoria) => setForm((f) => ({ ...f, categoria: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoriasDisponiveis.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Localização</label>
          <Select value={form.localizacao} onValueChange={(v: PatrimonioLocalizacao) => setForm((f) => ({ ...f, localizacao: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {localizacoesDisponiveis.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsável</label>
          <Input value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} placeholder="Maria Silva" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Setor</label>
          <Input value={form.setor} onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))} placeholder="TI" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor de Compra (R$)</label>
        <Input
          value={form.valorCompra}
          onChange={(e) => setForm((f) => ({ ...f, valorCompra: maskCurrency(e.target.value) }))}
          placeholder="R$ 0,00"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data de Compra</label>
          <Input type="date" value={form.dataCompra} onChange={(e) => setForm((f) => ({ ...f, dataCompra: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
          <Select value={form.status} onValueChange={(v: PatrimonioStatus) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
              <SelectItem value="baixado">Baixado</SelectItem>
              <SelectItem value="emprestado">Emprestado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button type="submit" className="flex-1">
          <Check className="size-4" /> {patrimonio ? "Salvar Alterações" : "Cadastrar Ativo"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function InventarioDetails({ patrimonio, onClose }: { patrimonio: Patrimonio; onClose: () => void }) {
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-xl bg-primary/10 grid place-items-center text-primary text-lg font-bold">
          {patrimonio.categoria.slice(0, 2)}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{patrimonio.nome}</h3>
          <p className="text-sm text-muted-foreground">{patrimonio.tag} · S/N: {patrimonio.numeroSerie}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Categoria</p>
          <p className="font-medium">{patrimonio.categoria}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Localização</p>
          <p className="font-medium">{patrimonio.localizacao}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Responsável</p>
          <p className="font-medium">{patrimonio.responsavel}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Setor</p>
          <p className="font-medium">{patrimonio.setor}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Valor de Compra</p>
          <p className="font-medium">{brl(patrimonio.valorCompra)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Data de Compra</p>
          <p className="font-medium">{fmtDate(patrimonio.dataCompra)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Última Auditoria</p>
          <p className="font-medium">{patrimonio.dataUltimaAuditoria ? fmtDate(patrimonio.dataUltimaAuditoria) : "Nunca auditado"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Status</p>
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1",
            patrimonio.status === "ativo" ? "bg-success/15 text-success border-success/30" :
            patrimonio.status === "em_manutencao" ? "bg-warning/15 text-warning border-warning/30" :
            patrimonio.status === "baixado" ? "bg-destructive/15 text-destructive border-destructive/30" :
            "bg-info/15 text-info border-info/30",
          )}>
            {patrimonio.status === "em_manutencao" ? "Em Manutenção" :
             patrimonio.status === "ativo" ? "Ativo" :
             patrimonio.status === "baixado" ? "Baixado" : "Emprestado"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onClose}>Fechar</Button>
      </div>
    </div>
  );
}

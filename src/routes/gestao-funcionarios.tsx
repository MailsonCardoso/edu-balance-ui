import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Search, Plus, Loader2, Pencil, Trash2, KeyRound, Eye, EyeOff } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  fetchFuncionarios,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario,
  senhaInicialDoCpf,
  maskCpf,
  maskPhone,
  type Funcionario,
  type FuncionarioRole,
} from "@/lib/api/funcionarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestao-funcionarios")({
  component: GestaoFuncionarios,
});

const roleLabel: Record<FuncionarioRole, string> = {
  admin: "Administrador",
  secretaria: "Secretaria",
};

function GestaoFuncionarios() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Funcionario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Funcionario | null>(null);
  const [resetTarget, setResetTarget] = useState<Funcionario | null>(null);

  useEffect(() => {
    fetchFuncionarios()
      .then(setData)
      .catch(() => toast.error("Erro ao carregar funcionários"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      q
        ? data.filter(
            (f) =>
              f.name.toLowerCase().includes(q.toLowerCase()) ||
              f.email.toLowerCase().includes(q.toLowerCase()) ||
              (f.cpf ?? "").includes(q.replace(/\D/g, "")),
          )
        : data,
    [data, q],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  useEffect(() => {
    setPage(1);
  }, [q]);

  const openCreate = () => {
    setEditTarget(null);
    setSheetOpen(true);
  };

  const openEdit = (item: Funcionario) => {
    setEditTarget(item);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFuncionario(deleteTarget.id);
      setData((d) => d.filter((f) => f.id !== deleteTarget.id));
      toast.success("Funcionário excluído!");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Erro ao excluir funcionário");
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    const cpf = resetTarget.cpf ?? "";
    const novaSenha = senhaInicialDoCpf(cpf);
    try {
      await updateFuncionario(resetTarget.id, {
        password: novaSenha,
        must_change_password: true,
      });
      toast.success(
        `Senha redefinida para "${novaSenha}". Ela será solicitada a trocar no próximo login.`,
      );
      setResetTarget(null);
    } catch {
      toast.error("Erro ao redefinir senha");
    }
  };

  return (
    <>
      <PageHeader
        title="Gestão de Funcionários"
        description="Cadastre funcionários com e-mail e senha e defina o perfil de acesso"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Cadastrar Funcionário
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="h-10 pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">{data.length} funcionários</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum funcionário encontrado"
              description={q ? "Tente outro termo de busca." : "Cadastre o primeiro funcionário."}
              icon={<Users className="size-6" />}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium w-[220px]">Funcionário</th>
                  <th className="px-4 py-3 font-medium w-[140px]">CPF</th>
                  <th className="px-4 py-3 font-medium w-[220px]">E-mail (usuário)</th>
                  <th className="px-4 py-3 font-medium w-[140px]">Telefone</th>
                  <th className="px-4 py-3 font-medium w-[140px]">Perfil</th>
                  <th className="px-4 py-3 font-medium text-right w-[140px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-semibold text-sm shrink-0">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{f.name}</p>
                          {currentUser?.id === f.id && (
                            <p className="text-[11px] text-muted-foreground">Você</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">
                      {f.cpf ? f.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground max-w-[220px] truncate"
                      title={f.email}
                    >
                      {f.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {f.telefone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          f.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {roleLabel[f.role] ?? f.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => setResetTarget(f)}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Redefinir senha"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
                          disabled={currentUser?.id === f.id}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-40 disabled:hover:bg-transparent"
                          title={
                            currentUser?.id === f.id
                              ? "Você não pode excluir a si mesmo"
                              : "Excluir"
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Exibindo {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} de{" "}
                {filtered.length}
              </span>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/pág
                    </SelectItem>
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

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSheetOpen(false);
            setEditTarget(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? "Editar Funcionário" : "Cadastrar Funcionário"}</SheetTitle>
            <SheetDescription>
              {editTarget
                ? "Altere os dados do funcionário."
                : "O e-mail será usado como usuário de acesso. A senha inicial são os 6 primeiros dígitos do CPF."}
            </SheetDescription>
          </SheetHeader>
          <FuncionarioForm
            funcionario={editTarget}
            onSave={async (payload, includePassword) => {
              try {
                if (editTarget) {
                  const body: Record<string, unknown> = { ...payload };
                  if (!includePassword) delete body.password;
                  const updated = await updateFuncionario(editTarget.id, body);
                  setData((d) => d.map((f) => (f.id === updated.id ? updated : f)));
                  toast.success("Funcionário atualizado!");
                } else {
                  const created = await createFuncionario(payload);
                  setData((d) => [...d, created]);
                  toast.success(
                    `Funcionário cadastrado! Senha inicial: ${senhaInicialDoCpf(created.cpf ?? "")} — alteração solicitada no 1º acesso.`,
                  );
                }
                setSheetOpen(false);
                setEditTarget(null);
              } catch (err: unknown) {
                const msg =
                  err && typeof err === "object" && "response" in err
                    ? (
                        err as {
                          response: { data?: { message?: Record<string, string[]> | string } };
                        }
                      ).response?.data?.message
                    : null;
                const detail = Array.isArray(msg) ? msg.join(", ") : msg;
                toast.error(detail || "Erro ao salvar funcionário");
              }
            }}
            onCancel={() => {
              setSheetOpen(false);
              setEditTarget(null);
            }}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Esta ação remove
              o acesso ao sistema permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!resetTarget}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir senha</AlertDialogTitle>
            <AlertDialogDescription>
              A senha de <strong>{resetTarget?.name}</strong> voltará a ser os 6 primeiros dígitos
              do CPF e será solicitada a troca no próximo login. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>Sim, redefinir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FuncionarioForm({
  funcionario,
  onSave,
  onCancel,
}: {
  funcionario: Funcionario | null;
  onSave: (
    payload: {
      name: string;
      email: string;
      cpf: string;
      telefone: string;
      role: FuncionarioRole;
      password?: string;
    },
    includePassword: boolean,
  ) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(funcionario?.name ?? "");
  const [email, setEmail] = useState(funcionario?.email ?? "");
  const [cpf, setCpf] = useState(funcionario?.cpf ?? "");
  const [telefone, setTelefone] = useState(funcionario?.telefone ?? "");
  const [role, setRole] = useState<FuncionarioRole>(funcionario?.role ?? "secretaria");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Informe o nome completo";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Informe um e-mail válido";
    if (cpf.replace(/\D/g, "").length !== 11) errs.cpf = "CPF inválido";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave(
      {
        name: name.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone.trim(),
        role,
        password: password || undefined,
      },
      false,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-6">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Nome Completo
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Maria da Silva"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            CPF
          </Label>
          <Input
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            disabled={!!funcionario}
            className={funcionario ? "bg-muted/40" : ""}
          />
          {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Telefone
          </Label>
          <Input
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          E-mail (usuário de acesso)
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="maria@escola.com.br"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Perfil
        </Label>
        <Select value={role} onValueChange={(v: FuncionarioRole) => setRole(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="secretaria">
              Secretaria — Alunos, Associados, Inventário, Notícias, Ouvidoria
            </SelectItem>
            <SelectItem value="admin">Administrador — Visualiza todas as telas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!funcionario && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          A senha inicial é automática:{" "}
          <code className="font-mono font-bold text-primary">
            {senhaInicialDoCpf(cpf) || "6 primeiros dígitos do CPF"}
          </code>
          . No primeiro acesso, o funcionário será solicitado a trocar a senha.
        </div>
      )}

      {funcionario && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nova Senha <span className="normal-case font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {password && (
            <p className="text-xs text-muted-foreground">
              A troca de senha não solicitará nova alteração no próximo login.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button type="submit" className="flex-1">
          {funcionario ? "Salvar Alterações" : "Cadastrar Funcionário"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

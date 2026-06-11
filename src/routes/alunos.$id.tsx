import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PageHeader, StatusBadge } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { turmas } from "@/lib/mock-data";
import type { Aluno } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { maskCPF, maskDate, maskPhone, fmtDate } from "@/lib/format";
import { fetchAluno, updateAluno, deleteAluno, checkCpfExists } from "@/lib/api/alunos";

export const Route = createFileRoute("/alunos/$id")({
  component: AlunoDetalhe,
});

const schema = z.object({
  nome: z.string().min(3, "Nome muito curto").max(120),
  sexo: z.enum(["masculino", "feminino"], { message: "Selecione o sexo" }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (000.000.000-00)"),
  dataNascimento: z.string().min(1, "Obrigatório"),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(3, "Endereço obrigatório").max(200),
  responsavel: z.string().min(3, "Nome do responsável obrigatório"),
  cpfResponsavel: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF do responsável inválido"),
  telefoneResponsavel: z.string().min(10, "Telefone do responsável inválido"),
  turma: z.string().min(1, "Selecione uma turma"),
  status: z.enum(["ativo", "inativo"]),
});

type FormData = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function AlunoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState<Aluno | undefined>();

  useEffect(() => {
    fetchAluno(id)
      .then(setAluno)
      .catch(() => toast.error("Erro ao carregar aluno"))
      .finally(() => setLoading(false));
  }, [id]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: aluno
      ? {
          ...aluno,
          dataNascimento: aluno.dataNascimento?.includes("/")
            ? aluno.dataNascimento
            : fmtDate(aluno.dataNascimento),
        }
      : undefined,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Aluno não encontrado</p>
        <Link to="/alunos" className="text-primary hover:underline text-sm mt-2 inline-block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateAluno(aluno.id, data);
      setAluno(updated);
      setEditing(false);
      toast.success("Aluno atualizado com sucesso!");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const msg = apiErr.response?.data?.errors?.cpf?.[0] || "Erro ao atualizar aluno";
      toast.error(msg);
    }
  };

  const remover = async () => {
    try {
      await deleteAluno(aluno.id);
      toast.success("Aluno removido");
      navigate({ to: "/alunos" });
    } catch {
      toast.error("Erro ao excluir aluno");
    }
  };

  return (
    <>
      <PageHeader
        title={aluno.nome}
        description={`${aluno.turma} · ${aluno.situacao === "em_dia" ? "Em dia" : aluno.situacao === "em_atraso" ? "Em atraso" : "Inadimplente"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/alunos">
              <Button variant="outline">
                <ArrowLeft className="size-4" /> Voltar
              </Button>
            </Link>
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditing(false);
                  }}
                >
                  <X className="size-4" /> Cancelar
                </Button>
                <Button type="submit" form="aluno-form" disabled={isSubmitting}>
                  <Save className="size-4" /> {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" /> Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="size-4" /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir <strong>{aluno.nome}</strong>? Esta ação não
                        pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={remover}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        }
      />

      <form
        id="aluno-form"
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card rounded-xl border border-border p-6 space-y-6"
      >
        <section>
          <h3 className="font-semibold mb-4">Dados do aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" error={errors.nome?.message} className="md:col-span-2">
              {editing ? (
                <Input className="h-10" {...register("nome")} />
              ) : (
                <p className="text-sm py-2.5">{aluno.nome}</p>
              )}
            </Field>
            <Field label="Sexo" error={errors.sexo?.message}>
              {editing ? (
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                  {...register("sexo")}
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              ) : (
                <p className="text-sm py-2.5">
                  {aluno.sexo === "feminino" ? "Feminino" : aluno.sexo === "masculino" ? "Masculino" : "—"}
                </p>
              )}
            </Field>
            <Field label="CPF" error={errors.cpf?.message}>
              {editing ? (
                <Input
                  className="h-10"
                  {...register("cpf")}
                  onChange={(e) => {
                    const masked = maskCPF(e.target.value);
                    e.target.value = masked;
                    setValue("cpf", masked, { shouldValidate: true });
                  }}
                  onBlur={async (e) => {
                    const cpf = e.target.value;
                    if (cpf.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
                      const exists = await checkCpfExists(cpf, aluno.id);
                      if (exists) {
                        setError("cpf", { message: "CPF já cadastrado" });
                      } else {
                        clearErrors("cpf");
                      }
                    }
                  }}
                />
              ) : (
                <p className="text-sm py-2.5">{aluno.cpf}</p>
              )}
            </Field>
            <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="DD/MM/AAAA"
                  {...register("dataNascimento")}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    e.target.value = masked;
                    setValue("dataNascimento", masked, { shouldValidate: true });
                  }}
                />
              ) : (
                <p className="text-sm py-2.5">
                  {aluno.dataNascimento ? fmtDate(aluno.dataNascimento) : ""}
                </p>
              )}
            </Field>
            <Field label="Telefone" error={errors.telefone?.message}>
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="(11) 99999-9999"
                  {...register("telefone")}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    e.target.value = masked;
                    setValue("telefone", masked, { shouldValidate: true });
                  }}
                />
              ) : (
                <p className="text-sm py-2.5">{aluno.telefone}</p>
              )}
            </Field>
            <Field label="Endereço" error={errors.endereco?.message} className="md:col-span-2">
              {editing ? (
                <Input className="h-10" {...register("endereco")} />
              ) : (
                <p className="text-sm py-2.5">{aluno.endereco}</p>
              )}
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Responsável financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do responsável" error={errors.responsavel?.message}>
              {editing ? (
                <Input className="h-10" {...register("responsavel")} />
              ) : (
                <p className="text-sm py-2.5">{aluno.responsavel}</p>
              )}
            </Field>
            <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
              {editing ? (
                <Input
                  className="h-10"
                  {...register("cpfResponsavel")}
                  onChange={(e) => {
                    const masked = maskCPF(e.target.value);
                    e.target.value = masked;
                    setValue("cpfResponsavel", masked, { shouldValidate: true });
                  }}
                />
              ) : (
                <p className="text-sm py-2.5">{aluno.cpfResponsavel}</p>
              )}
            </Field>
            <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="(11) 99999-9999"
                  {...register("telefoneResponsavel")}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    e.target.value = masked;
                    setValue("telefoneResponsavel", masked, { shouldValidate: true });
                  }}
                />
              ) : (
                <p className="text-sm py-2.5">{aluno.telefoneResponsavel}</p>
              )}
            </Field>
            <Field label="E-mail do responsável" error={errors.email?.message}>
              {editing ? (
                <Input type="email" className="h-10" placeholder="usado para login no portal" {...register("email")} />
              ) : (
                <p className="text-sm py-2.5">{aluno.email}</p>
              )}
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Matrícula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Série / Turma" error={errors.turma?.message}>
              {editing ? (
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                  {...register("turma")}
                >
                  {turmas.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm py-2.5">{aluno.turma}</p>
              )}
            </Field>
            <Field label="Status" error={errors.status?.message}>
              {editing ? (
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                  {...register("status")}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              ) : (
                <StatusBadge status={aluno.status} />
              )}
            </Field>
            <Field label="Situação financeira">
              <StatusBadge status={aluno.situacao} />
            </Field>
          </div>
        </section>
      </form>
    </>
  );
}

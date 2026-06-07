import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Pencil, Save, Trash2, X } from "lucide-react";
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
import { alunos as mockAlunos, turmas } from "@/lib/mock-data";
import type { Aluno } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { maskCPF, maskDate, maskPhone, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/alunos/$id")({
  component: AlunoDetalhe,
});

const schema = z.object({
  nome: z.string().min(3, "Nome muito curto").max(120),
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

const inputCls =
  "w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors";

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
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

  const [aluno, setAluno] = useState<Aluno | undefined>(() => mockAlunos.find((a) => a.id === id));

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
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

  if (!aluno) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Aluno não encontrado</p>
        <Link to="/alunos" className="text-primary hover:underline text-sm mt-2 inline-block">Voltar para lista</Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    setAluno({ ...aluno, ...data });
    setEditing(false);
    toast.success("Aluno atualizado com sucesso!");
  };

  const remover = () => {
    toast.success("Aluno removido");
    navigate({ to: "/alunos" });
  };

  return (
    <>
      <PageHeader
        title={aluno.nome}
        description={`${aluno.turma} · ${aluno.situacao === "em_dia" ? "Em dia" : aluno.situacao === "pendente" ? "Pendente" : "Inadimplente"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/alunos" className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input hover:bg-accent text-sm">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
            {editing ? (
              <>
                <button onClick={() => { reset(); setEditing(false) }} className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-input hover:bg-accent text-sm">
                  <X className="size-4" /> Cancelar
                </button>
                <button type="submit" form="aluno-form" disabled={isSubmitting} className="h-10 px-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60">
                  <Save className="size-4" /> {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-input hover:bg-accent text-sm">
                  <Pencil className="size-4" /> Editar
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-destructive/30 hover:bg-destructive/10 text-destructive text-sm">
                      <Trash2 className="size-4" /> Excluir
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir <strong>{aluno.nome}</strong>? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={remover} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

      <form id="aluno-form" onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <section>
          <h3 className="font-semibold mb-4">Dados do aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" error={errors.nome?.message} className="md:col-span-2">
              {editing ? <input className={inputCls} {...register("nome")} /> : <p className="text-sm py-2.5">{aluno.nome}</p>}
            </Field>
            <Field label="CPF" error={errors.cpf?.message}>
              {editing ? <input className={inputCls} {...register("cpf")} onChange={(e) => { const masked = maskCPF(e.target.value); e.target.value = masked; setValue("cpf", masked, { shouldValidate: true }) }} /> : <p className="text-sm py-2.5">{aluno.cpf}</p>}
            </Field>
            <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
              {editing ? <input className={inputCls} placeholder="DD/MM/AAAA" {...register("dataNascimento")} onChange={(e) => { const masked = maskDate(e.target.value); e.target.value = masked; setValue("dataNascimento", masked, { shouldValidate: true }) }} /> : <p className="text-sm py-2.5">{aluno.dataNascimento ? fmtDate(aluno.dataNascimento) : ""}</p>}
            </Field>
            <Field label="Telefone" error={errors.telefone?.message}>
              {editing ? <input className={inputCls} placeholder="(11) 99999-9999" {...register("telefone")} onChange={(e) => { const masked = maskPhone(e.target.value); e.target.value = masked; setValue("telefone", masked, { shouldValidate: true }) }} /> : <p className="text-sm py-2.5">{aluno.telefone}</p>}
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              {editing ? <input type="email" className={inputCls} {...register("email")} /> : <p className="text-sm py-2.5">{aluno.email}</p>}
            </Field>
            <Field label="Endereço" error={errors.endereco?.message} className="md:col-span-2">
              {editing ? <input className={inputCls} {...register("endereco")} /> : <p className="text-sm py-2.5">{aluno.endereco}</p>}
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Responsável financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do responsável" error={errors.responsavel?.message}>
              {editing ? <input className={inputCls} {...register("responsavel")} /> : <p className="text-sm py-2.5">{aluno.responsavel}</p>}
            </Field>
            <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
              {editing ? <input className={inputCls} {...register("cpfResponsavel")} onChange={(e) => { const masked = maskCPF(e.target.value); e.target.value = masked; setValue("cpfResponsavel", masked, { shouldValidate: true }) }} /> : <p className="text-sm py-2.5">{aluno.cpfResponsavel}</p>}
            </Field>
            <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
              {editing ? <input className={inputCls} placeholder="(11) 99999-9999" {...register("telefoneResponsavel")} onChange={(e) => { const masked = maskPhone(e.target.value); e.target.value = masked; setValue("telefoneResponsavel", masked, { shouldValidate: true }) }} /> : <p className="text-sm py-2.5">{aluno.telefoneResponsavel}</p>}
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Matrícula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Série / Turma" error={errors.turma?.message}>
              {editing ? (
                <select className={inputCls} {...register("turma")}>
                  {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : <p className="text-sm py-2.5">{aluno.turma}</p>}
            </Field>
            <Field label="Status" error={errors.status?.message}>
              {editing ? (
                <select className={inputCls} {...register("status")}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              ) : <StatusBadge status={aluno.status} />}
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

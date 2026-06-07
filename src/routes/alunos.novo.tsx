import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/Primitives";
import { turmas } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export const Route = createFileRoute("/alunos/novo")({
  component: NovoAluno,
});

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

const inputCls =
  "w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors";

function NovoAluno() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ativo" },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    console.log("Novo aluno:", data);
    toast.success("Aluno cadastrado com sucesso!");
    navigate({ to: "/alunos" });
  };

  return (
    <>
      <PageHeader
        title="Cadastro de aluno"
        description="Preencha os dados do aluno e do responsável financeiro"
        actions={
          <Link to="/alunos" className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input hover:bg-accent text-sm">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <section>
          <h3 className="font-semibold mb-4">Dados do aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" error={errors.nome?.message} className="md:col-span-2">
              <input className={inputCls} {...register("nome")} />
            </Field>
            <Field label="CPF" error={errors.cpf?.message}>
              <input className={inputCls} placeholder="000.000.000-00" {...register("cpf")} />
            </Field>
            <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
              <input type="date" className={inputCls} {...register("dataNascimento")} />
            </Field>
            <Field label="Telefone" error={errors.telefone?.message}>
              <input className={inputCls} placeholder="(00) 00000-0000" {...register("telefone")} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <input type="email" className={inputCls} {...register("email")} />
            </Field>
            <Field label="Endereço" error={errors.endereco?.message} className="md:col-span-2">
              <input className={inputCls} {...register("endereco")} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Responsável financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do responsável" error={errors.responsavel?.message}>
              <input className={inputCls} {...register("responsavel")} />
            </Field>
            <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
              <input className={inputCls} placeholder="000.000.000-00" {...register("cpfResponsavel")} />
            </Field>
            <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
              <input className={inputCls} {...register("telefoneResponsavel")} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Matrícula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Série / Turma" error={errors.turma?.message}>
              <select className={inputCls} {...register("turma")}>
                <option value="">Selecione...</option>
                {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select className={inputCls} {...register("status")}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Link to="/alunos" className="h-10 px-4 inline-flex items-center rounded-md border border-input hover:bg-accent text-sm">Cancelar</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="size-4" /> {isSubmitting ? "Salvando..." : "Salvar aluno"}
          </button>
        </div>
      </form>
    </>
  );
}

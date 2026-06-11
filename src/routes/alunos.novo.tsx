import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { turmas } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { maskCPF, maskCurrency, parseCurrency } from "@/lib/format";
import { createAluno } from "@/lib/api/alunos";
import { createMensalidade } from "@/lib/api/mensalidades";

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
  valorMensalidade: z.coerce.number().min(0, "Valor inválido"),
  diaVencimento: z.coerce.number().int().min(1, "Mínimo 1").max(31, "Máximo 31"),
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

function NovoAluno() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ativo", valorMensalidade: 0, diaVencimento: 10 },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const created = await createAluno({ ...data, situacao: "em_dia" });
      if (data.valorMensalidade >= 0) {
        const hoje = new Date();
        const mes = hoje.toLocaleDateString("pt-BR", { month: "long" });
        const mesRef = mes.charAt(0).toUpperCase() + mes.slice(1) + "/" + hoje.getFullYear();
        const dia = String(data.diaVencimento || 10).padStart(2, "0");
        const mesNum = String(hoje.getMonth() + 1).padStart(2, "0");
        await createMensalidade({
          alunoId: created.id,
          mesReferencia: mesRef,
          valor: data.valorMensalidade,
          dataVencimento: `${dia}/${mesNum}/${hoje.getFullYear()}`,
          status: "pendente",
        });
      }
      toast.success("Aluno cadastrado com sucesso!");
      navigate({ to: "/alunos" });
    } catch {
      toast.error("Erro ao cadastrar aluno");
    }
  };

  return (
    <>
      <PageHeader
        title="Cadastro de aluno"
        description="Preencha os dados do aluno e do responsável financeiro"
        actions={
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input hover:bg-accent text-sm"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card rounded-xl border border-border p-6 space-y-6"
      >
        <section>
          <h3 className="font-semibold mb-4">Dados do aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" error={errors.nome?.message} className="md:col-span-2">
              <Input className="h-10" {...register("nome")} />
            </Field>
            <Field label="CPF" error={errors.cpf?.message}>
              <Input
                className="h-10"
                placeholder="000.000.000-00"
                {...register("cpf")}
                onChange={(e) => {
                  const masked = maskCPF(e.target.value);
                  e.target.value = masked;
                  setValue("cpf", masked, { shouldValidate: true });
                }}
              />
            </Field>
            <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
              <Input type="date" className="h-10" {...register("dataNascimento")} />
            </Field>
            <Field label="Telefone" error={errors.telefone?.message}>
              <Input className="h-10" placeholder="(00) 00000-0000" {...register("telefone")} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input type="email" className="h-10" {...register("email")} />
            </Field>
            <Field label="Endereço" error={errors.endereco?.message} className="md:col-span-2">
              <Input className="h-10" {...register("endereco")} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Responsável financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do responsável" error={errors.responsavel?.message}>
              <Input className="h-10" {...register("responsavel")} />
            </Field>
            <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
              <Input
                className="h-10"
                placeholder="000.000.000-00"
                {...register("cpfResponsavel")}
                onChange={(e) => {
                  const masked = maskCPF(e.target.value);
                  e.target.value = masked;
                  setValue("cpfResponsavel", masked, { shouldValidate: true });
                }}
              />
            </Field>
            <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
              <Input className="h-10" {...register("telefoneResponsavel")} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-4">Matrícula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Série / Turma" error={errors.turma?.message}>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                {...register("turma")}
              >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                {...register("status")}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>

            <Field label="Valor mensalidade (R$)" error={errors.valorMensalidade?.message}>
              <Controller
                name="valorMensalidade"
                control={control}
                render={({ field }) => (
                  <Input
                    className="h-10"
                    placeholder="0,00"
                    value={field.value !== null && field.value !== undefined && !isNaN(field.value) ? maskCurrency(String(field.value)) : ""}
                    onChange={(e) => {
                      const masked = maskCurrency(e.target.value);
                      e.target.value = masked;
                      field.onChange(masked ? parseCurrency(masked) : 0);
                    }}
                  />
                )}
              />
            </Field>
            <Field label="Dia vencimento" error={errors.diaVencimento?.message}>
              <Controller
                name="diaVencimento"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    className="h-10"
                    placeholder="10"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value) || 10)}
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Link to="/alunos">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="size-4" /> {isSubmitting ? "Salvando..." : "Salvar aluno"}
          </Button>
        </div>
      </form>
    </>
  );
}

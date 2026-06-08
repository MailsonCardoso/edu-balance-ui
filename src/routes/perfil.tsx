import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/Primitives";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
});

const tabs = ["Perfil", "Alterar senha", "Configurações", "Preferências"] as const;
type Tab = (typeof tabs)[number];

const perfilSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  cargo: z.string().min(2),
});

const senhaSchema = z
  .object({
    atual: z.string().min(6, "Mínimo 6 caracteres"),
    nova: z.string().min(8, "Mínimo 8 caracteres"),
    confirmar: z.string(),
  })
  .refine((d) => d.nova === d.confirmar, { path: ["confirmar"], message: "Senhas não coincidem" });

const inputCls =
  "w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring";

function Perfil() {
  const [tab, setTab] = useState<Tab>("Perfil");

  return (
    <>
      <PageHeader title="Minha conta" description="Gerencie seus dados e preferências" />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 h-12 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === "Perfil" && <PerfilForm />}
          {tab === "Alterar senha" && <SenhaForm />}
          {tab === "Configurações" && <Configuracoes />}
          {tab === "Preferências" && <Preferencias />}
        </div>
      </div>
    </>
  );
}

function PerfilForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: "Admin Escola", email: "admin@escola.com", cargo: "Administrador" },
  });
  return (
    <form
      onSubmit={handleSubmit(() => toast.success("Perfil atualizado"))}
      className="space-y-4 max-w-xl"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nome</label>
        <input className={inputCls} {...register("nome")} />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">E-mail</label>
        <input className={inputCls} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Cargo</label>
        <input className={inputCls} {...register("cargo")} />
      </div>
      <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90">
        Salvar
      </button>
    </form>
  );
}

function SenhaForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(senhaSchema) });
  return (
    <form
      onSubmit={handleSubmit(() => {
        toast.success("Senha alterada");
        reset();
      })}
      className="space-y-4 max-w-xl"
    >
      {(["atual", "nova", "confirmar"] as const).map((k) => (
        <div key={k} className="space-y-1.5">
          <label className="text-sm font-medium capitalize">
            {k === "atual" ? "Senha atual" : k === "nova" ? "Nova senha" : "Confirmar nova senha"}
          </label>
          <input type="password" className={inputCls} {...register(k)} />
          {errors[k] && <p className="text-xs text-destructive">{errors[k]?.message as string}</p>}
        </div>
      ))}
      <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90">
        Alterar senha
      </button>
    </form>
  );
}

function Toggle({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          on ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 bg-white rounded-full transition-transform shadow",
            on ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function Configuracoes() {
  return (
    <div className="max-w-xl">
      <Toggle label="Notificações por e-mail" desc="Receba alertas de pagamentos e inadimplência" />
      <Toggle label="Notificações no navegador" desc="Push notifications no desktop" />
      <Toggle label="Autenticação em dois fatores" desc="Adicione uma camada extra de segurança" />
    </div>
  );
}

function Preferencias() {
  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Idioma</label>
        <select className={inputCls} defaultValue="pt-BR">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Fuso horário</label>
        <select className={inputCls} defaultValue="America/Sao_Paulo">
          <option>America/Sao_Paulo</option>
          <option>America/New_York</option>
        </select>
      </div>
    </div>
  );
}

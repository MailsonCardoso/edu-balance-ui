import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  lembrar: z.boolean().optional(),
});

type Data = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@escola.com", senha: "admin123", lembrar: true },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-info text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex items-center gap-2">
          <div className="size-10 rounded-lg bg-white/15 grid place-items-center backdrop-blur">
            <GraduationCap className="size-6" />
          </div>
          <span className="font-semibold text-lg">EduFinance</span>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight">
            Gestão financeira escolar simplificada
          </h2>
          <p className="mt-4 text-primary-foreground/85 max-w-md">
            Controle de mensalidades, inadimplência e relatórios em uma plataforma elegante e moderna.
          </p>
        </div>
        <p className="relative text-sm text-primary-foreground/70">© 2025 EduFinance</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-10 rounded-lg bg-primary grid place-items-center text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <span className="font-semibold text-lg">EduFinance</span>
          </div>
          <h1 className="text-2xl font-semibold">Acesse sua conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre com seu e-mail e senha</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="w-full h-11 px-3 pr-10 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
                  {...register("senha")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded accent-primary" {...register("lembrar")} />
                <span>Lembrar acesso</span>
              </label>
              <button type="button" onClick={() => toast.info("E-mail de recuperação enviado")} className="text-primary hover:underline">
                Esqueci minha senha
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Use as credenciais pré-preenchidas para um tour rápido —{" "}
            <Link to="/" className="text-primary hover:underline">ou entre no dashboard</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

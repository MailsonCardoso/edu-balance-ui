import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Role, UserFinanceiro } from "@/lib/financeiro-types";

type User = {
  email: string;
  nome: string;
  role: Role;
  token?: string;
};

type AuthContext = {
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  loginApi: (user: UserFinanceiro, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const Ctx = createContext<AuthContext | null>(null);

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ["*"],
  financeiro: [
    "manage_revenues", "manage_expenses", "view_reports",
    "view_dashboard", "view_dre", "manage_categories",
    "view_indicators", "view_cash_flow",
  ],
  secretaria: [
    "view_revenues", "create_revenues",
  ],
  direcao: [
    "view_dashboard", "view_reports", "view_dre", "view_indicators",
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("edu_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, senha: string) => {
    // Tentar login via API primeiro
    try {
      const { default: api } = await import("@/lib/api");
      const response = await api.post("/auth/login", { email, password: senha });
      const data = response.data;
      const u: User = {
        email: data.user.email,
        nome: data.user.name,
        role: data.user.role,
        token: data.token,
      };
      localStorage.setItem("edu_user", JSON.stringify(u));
      localStorage.setItem("edu_token", data.token);
      setUser(u);
      return true;
    } catch {
      // Fallback: login hardcoded (admin)
      if (email === "admin@escola.com" && senha === "admin123") {
        const u: User = { email, nome: "Administrador", role: "admin" };
        setUser(u);
        localStorage.setItem("edu_user", JSON.stringify(u));
        return true;
      }
      return false;
    }
  }, []);

  const loginApi = useCallback((userData: UserFinanceiro, token: string) => {
    const u: User = {
      email: userData.email,
      nome: userData.name,
      role: userData.role,
      token,
    };
    setUser(u);
    localStorage.setItem("edu_user", JSON.stringify(u));
    localStorage.setItem("edu_token", token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("edu_user");
    localStorage.removeItem("edu_token");
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role] || [];
      return perms.includes("*") || perms.includes(permission);
    },
    [user],
  );

  return <Ctx.Provider value={{ user, login, loginApi, logout, hasPermission }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

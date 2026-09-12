import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import api from "./api";

type User = {
  id: number;
  name: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  role: string;
  must_change_password?: boolean;
};

type AuthContext = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  changePassword: (password: string, passwordConfirmation: string) => Promise<boolean>;
  setUser: (user: User | null) => void;
};

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("edu_token");
    if (token) {
      api
        .get("/auth/me")
        .then((r) => setUser(r.data))
        .catch(() => localStorage.removeItem("edu_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("edu_token", data.token);
      setUser(data.user);
      return data.user as User;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("edu_token");
    setUser(null);
  }, []);

  const changePassword = useCallback(async (password: string, passwordConfirmation: string) => {
    try {
      const { data } = await api.put("/auth/password", {
        password,
        password_confirmation: passwordConfirmation,
      });
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, changePassword, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

const USER = { email: "admin@escola.com", senha: "admin123", nome: "Administrador" }

type User = { email: string; nome: string }

type AuthContext = {
  user: User | null
  login: (email: string, senha: string) => boolean
  logout: () => void
}

const Ctx = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("edu_user")
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((email: string, senha: string) => {
    if (email === USER.email && senha === USER.senha) {
      const u = { email: USER.email, nome: USER.nome }
      setUser(u)
      localStorage.setItem("edu_user", JSON.stringify(u))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("edu_user")
  }, [])

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth outside AuthProvider")
  return ctx
}

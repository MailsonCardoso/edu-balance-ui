import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "../components/layout/AppLayout";
import { ThemeProvider } from "../lib/theme";
import { AuthProvider, useAuth } from "../lib/auth";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    if (!user && pathname !== "/login") {
      navigate({ to: "/login", replace: true })
    }
  }, [user, pathname, navigate])

  if (!user && pathname !== "/login") return null
  return <>{children}</>
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AuthGuard>
            {isAuthRoute ? <Outlet /> : <AppLayout><Outlet /></AppLayout>}
          </AuthGuard>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

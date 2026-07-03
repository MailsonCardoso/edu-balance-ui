import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "../components/layout/AppLayout";
import { ThemeProvider } from "../lib/theme";
import { AuthProvider, useAuth } from "../lib/auth";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const sitePaths = ["/", "/transparencia", "/institucional", "/noticias", "/contato", "/ouvidoria"];
  const isSiteRoute = sitePaths.includes(pathname);
  const isAssociadoRoute = pathname.startsWith("/associado");
  const isPublicRoute = ["/login"].includes(pathname) || isSiteRoute || isAssociadoRoute;

  useEffect(() => {
    if (loading) return;
    if (isPublicRoute) return;

    if (!user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, pathname, isPublicRoute, navigate]);

  if (loading) return null;
  if (isPublicRoute) return <>{children}</>;
  if (!user) return null;
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sitePaths = ["/", "/transparencia", "/institucional", "/noticias", "/contato", "/ouvidoria"];
  const isSiteRoute = sitePaths.includes(pathname);
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/associado") || isSiteRoute;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AuthGuard>
            {isAuthRoute ? (
              <Outlet />
            ) : (
              <AppLayout>
                <Outlet />
              </AppLayout>
            )}
          </AuthGuard>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isPublicRoute = ["/login", "/responsavel"].includes(pathname) || pathname.startsWith("/site");
  const isResponsavelRoute = pathname.startsWith("/responsavel");
  const hasResponsavelData = localStorage.getItem("responsavel_data");

  useEffect(() => {
    if (isPublicRoute) return;

    if (isResponsavelRoute && !hasResponsavelData) {
      navigate({ to: "/responsavel", replace: true });
      return;
    }

    if (!user) {
      if (pathname === "/") {
        navigate({ to: "/site", replace: true });
      } else {
        navigate({ to: "/login", replace: true });
      }
    }
  }, [user, pathname, isPublicRoute, isResponsavelRoute, hasResponsavelData, navigate]);

  if (isPublicRoute) return <>{children}</>;
  if (isResponsavelRoute && !hasResponsavelData) return null;
  if (!user) return null;
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/responsavel") || pathname.startsWith("/site");

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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";

import { AppLayout } from "../components/layout/AppLayout";
import { ThemeProvider } from "../lib/theme";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {isAuthRoute ? <Outlet /> : <AppLayout><Outlet /></AppLayout>}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

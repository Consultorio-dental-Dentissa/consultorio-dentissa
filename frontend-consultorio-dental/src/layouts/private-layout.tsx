import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarApp } from "@/components/shared/sidebar.component";
import { Header } from "@/components/shared/header.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { RouteFallback } from "@/components/shared/route-fallback.component";
import { Spinner } from "@/components/ui/spinner";

export default function PrivateLayout() {
    const { isAuthenticated, user, loading, isError, errorMessage, retry } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div role="status" className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
                <Spinner className="size-8 text-brand" />
                <span className="text-[15px] font-semibold">Cargando tu sesión...</span>
            </div>
        );
    }

    // Fallo de red o del servidor al validar la sesión: no es un cierre de sesión, se permite reintentar.
    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <ErrorState message={errorMessage ?? undefined} onRetry={retry} />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <SidebarProvider>
            <SidebarApp />

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto bg-background">
                <Header />
                <main className="flex w-full flex-1 flex-col gap-6 p-4 pb-10 sm:p-8">
                    <Suspense fallback={<RouteFallback />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </SidebarProvider>
    );
}

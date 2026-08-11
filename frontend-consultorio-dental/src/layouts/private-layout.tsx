import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/auth-context-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarApp } from "@/components/shared/sidebar.component"
import { Header } from "@/components/shared/header.component"
import { Spinner } from "@/components/ui/spinner"

export default function PrivateLayout() {

    const { isAuthenticated, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        if (!loading && (!isAuthenticated || !user)) {
            navigate('/login', { replace: true });
            return;
        }


    }, [loading, isAuthenticated, user, navigate]);

    
    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-2">
                <Spinner className="size-8" /> Por favor espere...
            </div>
        );
    }
    

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="flex w-full h-screen">
            <SidebarProvider>
                <SidebarApp />

                <div className="w-full h-full overflow-y-auto flex flex-col">
                    <Header />
                    <div className="w-full mx-auto bg-neutral-100 px-7 py-7 flex-1">
                        <main className="grow">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    )
}
import { Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContextProvider"
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/MenuLateral"
import '../styles/theme.private.css';

export default function LayoutPrivado() {

    const { isAuthenticated, cerrarSesion, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const manejarCerrarSesion = () => {
        cerrarSesion();
        <Navigate to="/login" />
    }

    return (
        <div>
            
            <SidebarProvider>
                <AppSidebar 
                    logout={manejarCerrarSesion}
                />
                <main className="w-full">
                    <div className="h-16 flex items-center bg-rose-400 p-2">
                        <SidebarTrigger className="text-white"/> 
                    </div>
                    <div className="p-5 bg-white h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>

        </div>
    )
}
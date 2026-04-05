import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContextProvider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarApp } from "@/components/common/Sidebar"
import '../styles/theme.private.css';

export default function LayoutPrivado() {

    const { isAuthenticated, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate('/login');
    }

    const manejarCerrarSesion = () => {
        cerrarSesion();
        navigate('/login');
    }

    return (
        <div>

            <SidebarProvider>

                <SidebarApp
                    logout={manejarCerrarSesion}
                />

                <main className="w-full">
                    <div className="h-16 flex items-center bg-rose-400 p-2">
                        <SidebarTrigger className="text-white" />
                    </div>
                    <div className="p-5 bg-white h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>

        </div>
    )
}
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContextProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarApp } from "@/components/common/Sidebar"
import { Header } from "@/components/common/Header"
import '../styles/theme.private.css';

export default function LayoutPrivado() {

    const { isAuthenticated, usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated || !usuario) {
        navigate('/login');
        return;
    }

    const manejarCerrarSesion = () => {
        cerrarSesion();
        navigate('/login');
    }

    const username = `${usuario?.name} ${usuario?.lastname}`;
    const rol = usuario?.rol;

    console.log("usuario: ", usuario);

    console.log("username: ", username);
    console.log(rol);

    return (
        <div>

            <SidebarProvider>

                <SidebarApp
                    logout={manejarCerrarSesion}
                />

                <main className="flex-1 min-w-0">
                    <Header
                        username={username}
                        userRol={rol ? rol : ''}
                    />
                    <div className="p-5 bg-gray-50 h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>

        </div>
    )
}
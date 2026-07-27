import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/auth-context-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarApp } from "@/components/common/sidebar.component"
import { Header } from "@/components/common/header.component"
import { formatFirstLetterUppercase } from "@/utils/formatters"
import { Spinner } from "@/components/ui/spinner"
import { Role } from "@/types/enums/rol.enum"

const PATIENT_HOME_PATH = '/dashboard-paciente';

export default function PrivateLayout() {

    const { isAuthenticated, user, logOut, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        if (!loading && (!isAuthenticated || !user)) {
            navigate('/login', { replace: true });
            return;
        }

        /**
         * INDICACIÓN:
         * Un paciente solo puede ver su propio dashboard. Si intenta
         * entrar a cualquier otra ruta privada (admin/asistente), se
         * le redirige de vuelta sin importar cómo haya llegado ahí.
         */
        if (!loading && user?.role === Role.PACIENTE && location.pathname !== PATIENT_HOME_PATH) {
            navigate(PATIENT_HOME_PATH, { replace: true });
        }

    }, [loading, isAuthenticated, user, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (user.role === Role.PACIENTE && location.pathname !== PATIENT_HOME_PATH) {
        return null;
    }

    const handleLogout = () => {
        logOut();
        navigate('/login');
    }

    const username = `${user?.name} ${user?.lastname}`;
    const role = formatFirstLetterUppercase(user?.role);

    return (
        <div className="h-screen overflow-hidden">
            <SidebarProvider>
                <SidebarApp
                    logout={handleLogout}
                />

                <main className="flex-1 min-w-0 h-screen flex flex-col">
                    <Header
                        username={username}
                        userRol={role || ''}
                    />
                    <div className="bg-gray-100 px-7 py-7 overflow-y-auto flex-1">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>

        </div>
    )
}
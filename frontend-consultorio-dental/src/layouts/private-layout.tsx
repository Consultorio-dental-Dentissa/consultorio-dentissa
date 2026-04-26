import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/auth-context-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarApp } from "@/components/common/sidebar.component"
import { Header } from "@/components/common/header.component"
import { formatFirstLetterUppercase } from "@/utils/formatters"

export default function PrivateLayout() {

    const { isAuthenticated, user, logOut } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated || !user) {
        navigate('/login');
        return;
    }

    const handleLogout = () => {
        logOut();
        navigate('/login');
    }

    const username = `${user?.name} ${user?.lastname}`;
    const role = formatFirstLetterUppercase(user?.role);

    console.log("user: ", user);
    console.log("user role: ", role);

    return (
        <div className="h-screen overflow-hidden">
            <SidebarProvider>
                <SidebarApp
                    logout={handleLogout}
                />

                <main className="flex-1 min-w-0 px-3 h-screen flex flex-col pb-5">
                    <Header
                        username={username}
                        userRol={role ? role : ''}
                    />
                    <div className="px-7 py-7 bg-gray-100 rounded-2xl overflow-y-auto flex-1">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>

        </div>
    )
}
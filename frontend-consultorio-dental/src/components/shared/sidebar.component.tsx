import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar"

import { LayoutGrid, Calendar, Users, User, FileText, Tag,
         MessageSquare, Bell, LogOut, Wrench, ClipboardPlus } from "lucide-react";

import type { IconType } from "react-icons/lib"
import { useAuth } from "@/features/auth/context/auth-context-provider";
import { useNavigate } from "react-router-dom";



interface BusinessItem {
    href: string;
    label: string;
    icon: IconType;
}


const businessItems: BusinessItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/usuarios', label: 'Usuarios', icon: Users },
    { href: '/pacientes', label: 'Pacientes', icon: User },
    { href: '/citas', label: 'Citas', icon: Calendar },
    { href: '/consultas', label: 'Consultas', icon: FileText },
    { href: '/servicios', label: 'Servicios', icon: Wrench },
]


const publicityItems: BusinessItem[] = [
    { href: '/preguntas', label: 'Preguntas frecuentes', icon: MessageSquare },
    { href: '/ofertas', label: 'Ofertas', icon: Tag },
    { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
]

export function SidebarApp() {

    const navigate = useNavigate();
    const { logOut } = useAuth();

    const handleLogout = () => {
        logOut();
        navigate('/login');
    }

    return (
        <Sidebar className="">
            <SidebarHeader className="mt-1 flex flex-row justify-start items-center gap-2 p-5">
                <div className="bg-rose-300 p-2 rounded-lg">
                    <ClipboardPlus className="text-white"/>
                </div>
                <div>
                    <p className="text-md font-bold text-white">Dentissa</p>
                    <p className="text-xs font-medium text-white">Panel clinico</p>
                </div>
            </SidebarHeader>

            <SidebarContent className="text-black px-3">
                <SidebarGroup>
                    
                    <SidebarGroupLabel className="mt-0 text-white font-bold">GENERAL</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuComponent
                            items={businessItems}
                        />
                    </SidebarGroupContent>

                    <SidebarGroupLabel className="mt-0 text-white font-bold">PUBLICIDAD</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuComponent
                            items={publicityItems}
                        />
                    </SidebarGroupContent>
                        
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-5">
                <button
                    className="text-white text-sm font-medium flex items-center gap-2 p-2 rounded-md hover:bg-[#fbeeec] hover:text-rose-500"
                    onClick={handleLogout}
                >
                    <LogOut size={23} className="font-bold"/>
                    Cerrar sesión
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}




interface SidebarMenuComponentProps {
    items: BusinessItem[]
}


function SidebarMenuComponent({ items }: SidebarMenuComponentProps) {
    const currentUrl = new URL(window.location.href).pathname;

    return (
        <SidebarMenu className="flex-col gap-1">
            {items.map((item) => {
                const isActive = currentUrl === item.href;

                return (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            className={`group/link font-normal py-3 hover:bg-[#fda4af] ${
                                isActive ? 'bg-[#fbeeec] font-bold' : ''}`}
                        >
                            <a href={item.href} className="flex items-center gap-3">
                                <item.icon
                                    size={18}
                                    className={`group-hover/link:text-[#ffece9] font-bold ${
                                        isActive ? 'text-[#c0685c]' : 'text-white'}`}
                                />
                                <p
                                    className={`text-sm group-hover/link:text-[#ffece9] group-hover/link:font-bold font-bold ${
                                        isActive ? 'text-[#c0685c] font-bold' : 'text-white'}`}
                                >
                                    {item.label}
                                </p>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
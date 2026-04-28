import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar"
import { IoIosLogOut } from "react-icons/io"
import { MdDashboard, MdPeople, MdMedicalServices } from "react-icons/md"
import { FaUserMd, FaCalendarAlt, FaStethoscope } from "react-icons/fa"
import { IoNotifications } from "react-icons/io5"
import { BiSolidOffer } from "react-icons/bi"
import { FaQuestion } from "react-icons/fa"
import { FaTooth } from "react-icons/fa";
import type { IconType } from "react-icons/lib"

interface BusinessItem {
    href: string;
    label: string;
    icon: IconType;
}

const businessItems: BusinessItem[] = [
    { href: '/dashboard', label: 'Resumen', icon: MdDashboard },
    { href: '/usuarios', label: 'Usuarios', icon: MdPeople },
    { href: '/pacientes', label: 'Pacientes', icon: FaUserMd },
    { href: '/citas', label: 'Citas', icon: FaCalendarAlt },
    { href: '/consultas', label: 'Consultas', icon: FaStethoscope },
    { href: '/servicios', label: 'Servicios', icon: MdMedicalServices },
]

const publicityItems: BusinessItem[] = [
    { href: '/preguntas', label: 'Preguntas frecuentes', icon: FaQuestion },
    { href: '/ofertas', label: 'Ofertas', icon: BiSolidOffer },
    { href: '/notificaciones', label: 'Notificaciones', icon: IoNotifications },
]

interface SidebarAppProps {
    logout: () => void
}

export function SidebarApp({ logout }: SidebarAppProps) {
    return (
        <Sidebar className="border-none">
            <SidebarHeader className="mt-3 flex flex-row justify-center items-center gap-1">
                <div className="bg-white p-2 rounded-sm">
                    <FaTooth className="text-sidebar text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Dentissa</h2>
            </SidebarHeader>

            <SidebarContent className="text-black">
                <SidebarGroup>
                    <SidebarGroupLabel className="mt-5 text-white">Manejo de negocio</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuComponent
                            items={businessItems}
                        />
                    </SidebarGroupContent>

                    <SidebarGroupLabel className="mt-5 text-white">Publicidad</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuComponent
                            items={publicityItems}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <button
                    className="text-gray-500 flex items-center gap-2 p-2 rounded-md hover:bg-red-700 hover:text-white"
                    onClick={logout}
                >
                    <IoIosLogOut size={18} />
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

    const currentUrl = new URL(window.location.href).pathname.toString();
    const activeStyles = 'bg-sidebar-accent text-sidebar';

    return (
        <SidebarMenu className="flex-col gap-1">
            {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild className={`text-white font-medium py-5 active:text-sidebar active:bg-sidebar-accent hover:bg-sidebar-accent hover:text-sidebar ${currentUrl === item.href && activeStyles}`
                    }>
                        <a href={item.href} className="flex items-center gap-3">
                            <item.icon size={18} />
                            {item.label}
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}
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

const negocioItems = [
    { href: '/dashboard', label: 'Resumen', icon: MdDashboard },
    { href: '/usuarios', label: 'Usuarios', icon: MdPeople },
    { href: '/pacientes', label: 'Pacientes', icon: FaUserMd },
    { href: '/citas', label: 'Citas', icon: FaCalendarAlt },
    { href: '/consultas', label: 'Consultas', icon: FaStethoscope },
    { href: '/servicios', label: 'Servicios', icon: MdMedicalServices },
]

const publicidadItems = [
    { href: '/preguntas', label: 'Preguntas frecuentes', icon: FaQuestion },
    { href: '/ofertas', label: 'Ofertas', icon: BiSolidOffer },
    { href: '/notificaciones', label: 'Notificaciones', icon: IoNotifications },
]

interface SidebarAppProps {
    logout: () => void
}

export function SidebarApp({logout}: SidebarAppProps) {
    return (
        <Sidebar className="border-none px-5">
            <SidebarHeader className="flex items-center gap-0">
                <h2 className="text-lg font-bold mt-5 text-black">Dentissa</h2>
                <h3 className="text-white">Panel de control</h3>
            </SidebarHeader>

            <SidebarContent  className="text-gray-400">
                <SidebarGroup>
                    <SidebarGroupLabel className="mt-5">Manejo de negocio</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {negocioItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild className="py-5 hover:text-white active:text-white font-medium">
                                        <a href={item.href} className="flex items-center gap-3">
                                            <item.icon size={18} />
                                            {item.label}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                    <SidebarGroupLabel className="mt-5">Publicidad</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {publicidadItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild className="py-5 hover:text-white font-medium active:text-white">
                                        <a href={item.href} className="flex items-center gap-3">
                                            <item.icon size={18} />
                                            {item.label}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
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
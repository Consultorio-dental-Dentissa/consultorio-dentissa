import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Wordmark } from "@/components/shared/brand-logo.component";
import { LogoutIcon } from "@/components/shared/nav-icons.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/use-notifications";
import { getHomeRoute, getNavItems, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

const ITEM =
    "flex w-full items-center gap-3 rounded-lg px-3 py-[11px] text-[15px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-white/60";

/**
 * Barra lateral de docs/DISEÑO-FINAL: 240px, fondo rosa #fc7186, padding 24x16, "Dentissa" blanco 24/800,
 * ítems de 15px con gap 12 y radio 8. Activo: fondo blanco, texto #e0566c/800 e icono #fc7186. Inactivo: blanco/600,
 * hover rgba(255,255,255,.16). "Cerrar sesión" al pie. El menú depende del rol (ver config/navigation.ts).
 */
export function SidebarApp() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user, logOut } = useAuth();
    const unread = useUnreadNotificationsCount(!!user);

    if (!user) return null;

    const items = getNavItems(user.role);
    const unreadCount = unread.data ?? 0;

    const renderItem = (item: NavItem) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const showBadge = item.badge === "notifications" && unreadCount > 0;

        return (
            <li key={`${item.href}-${item.label}`}>
                <Link
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                        ITEM,
                        isActive ? "bg-white font-extrabold text-brand" : "font-semibold text-white hover:bg-white/16",
                    )}
                >
                    <item.icon className={isActive ? "text-primary" : undefined} />
                    <span>{item.label}</span>
                    {showBadge && (
                        <span
                            className={cn(
                                "ml-auto rounded-full px-2 py-px text-[12.5px] font-extrabold",
                                isActive ? "bg-primary text-white" : "bg-white text-brand",
                            )}
                        >
                            <span aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>
                            <span className="sr-only">{unreadCount} sin leer</span>
                        </span>
                    )}
                </Link>
            </li>
        );
    };

    const handleLogout = async () => {
        await logOut();
        navigate("/login", { replace: true });
    };

    return (
        <Sidebar className="border-r-0">
            <SidebarHeader className="px-4 pt-6 pb-0">
                <Link
                    to={getHomeRoute(user.role)}
                    aria-label="Dentissa, ir al inicio"
                    className="block rounded-lg px-3 pb-[30px] text-2xl outline-none focus-visible:ring-3 focus-visible:ring-white/60"
                >
                    <Wordmark light />
                </Link>
            </SidebarHeader>

            <SidebarContent className="gap-0 px-4">
                <nav aria-label="Navegación principal">
                    <ul className="flex flex-col gap-1">{items.map(renderItem)}</ul>
                </nav>
            </SidebarContent>

            <SidebarFooter className="px-4 pt-0 pb-6">
                <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(ITEM, "font-bold text-white hover:bg-white/16")}
                >
                    <LogoutIcon />
                    <span>Cerrar sesión</span>
                </button>
            </SidebarFooter>
        </Sidebar>
    );
}

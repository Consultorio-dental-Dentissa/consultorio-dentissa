import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/use-notifications";
import { BREADCRUMB_LABELS, PATIENT_BREADCRUMB_LABELS, getHomeRoute } from "@/config/navigation";
import { Role } from "@/features/users/types/rol.enum";

const MENU_ITEM =
    "flex cursor-pointer items-center rounded-md px-3 py-2.5 text-[14.5px] font-semibold outline-none data-highlighted:bg-background";

/**
 * Migas de pan de docs/DISEÑO-FINAL: "Inicio" (#6b7280/600, enlace) › sección actual (#1f2328/800). En el Panel solo
 * aparece "Inicio" en negrita.
 */
function Breadcrumbs({ homeRoute, isPatient }: { homeRoute: string; isPatient: boolean }) {
    const { pathname } = useLocation();
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = segments
        .map((segment, index) => ({
            segment,
            label: (isPatient ? PATIENT_BREADCRUMB_LABELS[segment] : undefined) ?? BREADCRUMB_LABELS[segment] ?? (/^\d+$/.test(segment) ? "Perfil" : segment),
            href: `/${segments.slice(0, index + 1).join("/")}`,
        }))
        // El Panel es el "Inicio" del administrador: no se repite como migaja.
        .filter((crumb) => crumb.href !== homeRoute || crumb.segment !== "dashboard");
    const atHome = crumbs.length === 0;

    return (
        <nav aria-label="Ruta de navegación" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-2 text-[15px]">
                {/* En móvil solo se muestra la sección actual para no chocar con el nombre del usuario. */}
                <li className={atHome ? undefined : "hidden sm:block"}>
                    {atHome ? (
                        <span aria-current="page" className="font-extrabold text-foreground">Inicio</span>
                    ) : (
                        <Link to={homeRoute} className="font-semibold text-ink-4 hover:text-foreground">Inicio</Link>
                    )}
                </li>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <li key={crumb.href} className={`min-w-0 items-center gap-2 ${isLast ? "flex" : "hidden sm:flex"}`}>
                            <ChevronRight className="hidden size-[15px] shrink-0 text-ink-5 sm:block" strokeWidth={2.2} aria-hidden="true" />
                            {isLast ? (
                                <span aria-current="page" className="truncate font-extrabold text-foreground">{crumb.label}</span>
                            ) : (
                                <Link to={crumb.href} className="font-semibold text-ink-4 hover:text-foreground">{crumb.label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/**
 * Barra superior de docs/DISEÑO-FINAL: 68px, blanca, borde inferior #e5e7eb, padding 0 32px. Migas de pan a la
 * izquierda; a la derecha el nombre del usuario (15px/700) con menú desplegable de 200px que se abre al pasar el
 * cursor con mouse (y también con clic, toque o teclado; en táctil se mantiene abierto hasta tocar de nuevo): Ver perfil · Notificaciones · Cerrar sesión. No lleva campana ni avatar.
 * "Ver perfil" lleva a /mi-perfil para todos los roles (Paciente: "Mi perfil"; Administrador y Asistente: "Perfil de usuario").
 */
export function Header() {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const unread = useUnreadNotificationsCount(!!user);
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<number | undefined>(undefined);

    if (!user) return null;

    const unreadCount = unread.data ?? 0;
    // El abrir/cerrar al pasar el cursor es solo para mouse. En pantallas táctiles el dedo dispara "pointerenter" al
    // tocar y "pointerleave" al levantarlo, lo que cerraba el menú al instante: allí solo abre y cierra el toque.
    const showOnHover = (event: React.PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
    };
    const hideOnLeave = (event: React.PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => setOpen(false), 150);
    };
    const handleLogout = async () => {
        await logOut();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-surface px-4 sm:px-8">
            <SidebarTrigger className="md:hidden" aria-label="Abrir o cerrar el menú" />
            <Breadcrumbs homeRoute={getHomeRoute(user.role)} isPatient={user.role === Role.PACIENTE} />

            <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
                <div className="relative ml-auto max-w-[55%] shrink-0 py-2 sm:max-w-[320px]" onPointerEnter={showOnHover} onPointerLeave={hideOnLeave}>
                    <DropdownMenu.Trigger className="group flex max-w-full cursor-pointer items-center gap-2.5 rounded-md text-[15px] font-bold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/30">
                        <span className="min-w-0 truncate">{user.name} {user.lastname}</span>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-primary px-2 py-px text-[12.5px] font-extrabold text-white">
                                <span aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>
                                <span className="sr-only">{unreadCount} notificaciones sin leer</span>
                            </span>
                        )}
                        <ChevronDown
                            className="size-4 text-ink-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            strokeWidth={2.2}
                            aria-hidden="true"
                        />
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            align="end"
                            sideOffset={8}
                            onPointerEnter={showOnHover}
                            onPointerLeave={hideOnLeave}
                            className="z-50 w-[200px] rounded-[10px] border border-line bg-surface p-1.5 shadow-raised"
                        >
                            <DropdownMenu.Item asChild>
                                <Link to="/mi-perfil" className={`${MENU_ITEM} text-foreground`}>Ver perfil</Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                                <Link to="/notificaciones" className={`${MENU_ITEM} text-foreground`}>
                                    Notificaciones
                                    {unreadCount > 0 && (
                                        <span className="ml-auto rounded-full bg-primary px-2 py-px text-[12.5px] font-extrabold text-white">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="my-1 h-px bg-line" />
                            <DropdownMenu.Item
                                onSelect={handleLogout}
                                className={`${MENU_ITEM} text-brand data-highlighted:bg-brand-soft`}
                            >
                                Cerrar sesión
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </div>
            </DropdownMenu.Root>
        </header>
    );
}

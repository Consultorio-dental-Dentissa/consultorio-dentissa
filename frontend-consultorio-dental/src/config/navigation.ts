import { Role } from "@/features/users/types/rol.enum";
import {
    AuditIcon, BellIcon, CalendarIcon, ConsultationIcon, FaqIcon, HomeIcon, OfferIcon, PatientIcon, ToothIcon,
    UsersIcon, type NavIcon,
} from "@/components/shared/nav-icons.component";

export interface NavItem {
    href: string;
    label: string;
    icon: NavIcon;
    roles: readonly string[];
    /** Muestra el contador de notificaciones sin leer. */
    badge?: "notifications";
}

/**
 * Menú lateral por rol, tal como lo muestran las maquetas de docs/DISEÑO-FINAL:
 *  - ADMINISTRADOR: Panel, Citas, Pacientes, Usuarios, Servicios, Consultas, Ofertas, Preguntas frecuentes, Notificaciones.
 *  - ASISTENTE: Citas, Pacientes, Notificaciones.
 *  - PACIENTE: Mis citas, Mi perfil (las notificaciones se abren desde el menú de usuario).
 * Auditoría no tiene maqueta pero es una pantalla real del administrador: se mantiene al final.
 * Las rutas /ofertas y /preguntas-frecuentes son páginas públicas, por eso la gestión usa /gestionar-*.
 */
export const NAV_ITEMS: readonly NavItem[] = [
    { href: "/dashboard", label: "Panel", icon: HomeIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/citas", label: "Citas", icon: CalendarIcon, roles: [Role.ADMINISTRADOR, Role.ASISTENTE] },
    { href: "/citas", label: "Mis citas", icon: CalendarIcon, roles: [Role.PACIENTE] },
    { href: "/pacientes", label: "Pacientes", icon: PatientIcon, roles: [Role.ADMINISTRADOR, Role.ASISTENTE] },
    { href: "/mi-perfil", label: "Mi perfil", icon: PatientIcon, roles: [Role.PACIENTE] },
    { href: "/usuarios", label: "Usuarios", icon: UsersIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/servicios", label: "Servicios", icon: ToothIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/consultas", label: "Consultas", icon: ConsultationIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/gestionar-ofertas", label: "Ofertas", icon: OfferIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/gestionar-preguntas", label: "Preguntas frecuentes", icon: FaqIcon, roles: [Role.ADMINISTRADOR] },
    { href: "/notificaciones", label: "Notificaciones", icon: BellIcon, roles: [Role.ADMINISTRADOR, Role.ASISTENTE], badge: "notifications" },
    { href: "/auditoria", label: "Auditoría", icon: AuditIcon, roles: [Role.ADMINISTRADOR] },
];

/** Ítems de la barra lateral del rol (el Paciente no muestra Notificaciones ahí: está en el menú de usuario). */
export function getNavItems(role: string): NavItem[] {
    return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Rutas que el rol puede abrir (para respetar `from` tras iniciar sesión). Incluye rutas que no están en la
 * barra lateral pero sí son accesibles, como /notificaciones para el Paciente.
 */
export function canVisitRoute(role: string, pathname: string): boolean {
    // Rutas accesibles desde el menú de usuario (no están en la barra lateral).
    const extra = role === Role.PACIENTE ? ["/notificaciones"] : ["/mi-perfil"];
    return [...getNavItems(role).map((item) => item.href), ...extra].some(
        (href) => pathname === href || pathname.startsWith(`${href}/`),
    );
}

/** Pantalla de inicio tras iniciar sesión según el rol. */
export function getHomeRoute(role: string): string {
    return role === Role.ADMINISTRADOR ? "/dashboard" : "/citas";
}

/** Etiquetas de las rutas privadas para las migas de pan de la barra superior. */
export const BREADCRUMB_LABELS: Record<string, string> = {
    dashboard: "Panel",
    citas: "Citas",
    pacientes: "Pacientes",
    usuarios: "Usuarios",
    servicios: "Servicios",
    "mi-perfil": "Perfil",
    consultas: "Consultas",
    "gestionar-ofertas": "Ofertas",
    "gestionar-preguntas": "Preguntas frecuentes",
    notificaciones: "Notificaciones",
    auditoria: "Auditoría",
};

/** Etiquetas que cambian para el paciente (docs/DISEÑO-FINAL: "Mis citas" y "Mi perfil"). */
export const PATIENT_BREADCRUMB_LABELS: Record<string, string> = {
    citas: "Mis citas",
    "mi-perfil": "Mi perfil",
};

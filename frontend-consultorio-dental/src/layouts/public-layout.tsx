import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, MessageCircle, X, type LucideProps } from "lucide-react";
import { Wordmark } from "@/components/shared/brand-logo.component";
import { RouteFallback } from "@/components/shared/route-fallback.component";
import { PwaInstallButton } from "@/components/shared/pwa-install-button.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getHomeRoute } from "@/config/navigation";
import { clinicContent } from "@/config/clinic-content";
import { publicStyles } from "@/features/public/public-styles";
import { cn } from "@/lib/utils";

/**
 * Enlaces de la barra pública. La maqueta (Sitio Web) muestra Sobre nosotros, Servicios, Preguntas frecuentes y
 * Contacto; "Ofertas" se conserva porque RF-018 exige la vista pública de ofertas (la maqueta no la dibuja).
 */
const NAV_LINKS = [
    { to: "/sobre-nosotros", label: "Sobre nosotros" },
    { to: "/nuestros-servicios", label: "Servicios" },
    { to: "/ofertas", label: "Ofertas" },
    { to: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
    { to: "/contacto", label: "Contacto" },
];

/** lucide-react ya no incluye logos de marca: iconos mínimos propios (mismo trazo que la maqueta). */
function FacebookIcon(props: LucideProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...(props as object)}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
        </svg>
    );
}

function InstagramIcon(props: LucideProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...(props as object)}>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" />
        </svg>
    );
}

const SOCIAL_ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, whatsapp: MessageCircle } as const;

/** Barra de docs/DISEÑO-FINAL (Sitio Web): sticky, 76px, blanca, borde inferior #eceef1, padding 0 64px, gap 40. */
function Header() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            "text-base font-semibold transition-colors hover:text-foreground",
            isActive ? "text-foreground" : "text-ink-3",
        );

    return (
        <header className="relative z-40 shrink-0 border-b border-line-soft bg-surface">
            <nav
                aria-label="Navegación pública"
                className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:gap-10 lg:px-16"
            >
                <Link to="/" className="text-[26px] outline-none focus-visible:ring-3 focus-visible:ring-ring/30" aria-label="Dentissa, ir al inicio">
                    <Wordmark />
                </Link>

                <ul className="hidden items-center gap-[30px] lg:flex">
                    {NAV_LINKS.map((link) => (
                        <li key={link.to}>
                            <NavLink to={link.to} className={linkClass}>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="ml-auto flex items-center gap-3">
                    <PwaInstallButton className="hidden sm:flex" />
                    {user ? (
                        <Link
                            to={getHomeRoute(user.role)}
                            className={cn("flex h-[46px] items-center rounded-[9px] px-[22px] text-[15.5px] font-bold", publicStyles.primaryButton)}
                        >
                            Ir a mi panel
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hidden h-[46px] items-center rounded-[9px] border border-input px-[22px] text-[15.5px] font-bold text-foreground transition-[box-shadow,border-color] duration-[250ms] hover:border-primary hover:shadow-glow sm:flex"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to="/registrate"
                                className={cn("hidden h-[46px] items-center rounded-[9px] px-[22px] text-[15.5px] font-bold sm:flex", publicStyles.primaryButton)}
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                    <button
                        type="button"
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={open}
                        aria-controls="public-mobile-menu"
                        onClick={() => setOpen((value) => !value)}
                        className="flex size-11 items-center justify-center rounded-[9px] border border-input bg-surface text-ink-3 lg:hidden"
                    >
                        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {open && (
                <div
                    id="public-mobile-menu"
                    className="absolute inset-x-0 top-full border-b border-line-soft bg-surface px-5 py-3 shadow-raised sm:px-8 lg:hidden"
                >
                    <ul className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <li key={link.to}>
                                <NavLink to={link.to} onClick={() => setOpen(false)} className={(state) => cn(linkClass(state), "block rounded-lg px-3 py-2.5 hover:bg-background")}>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <PwaInstallButton className="mt-3 w-full sm:hidden" />
                    {!user && (
                        <div className="mt-3 flex gap-3 border-t border-line-soft pt-3 sm:hidden">
                            <Link
                                to="/login"
                                className="flex h-[46px] flex-1 items-center justify-center rounded-[9px] border border-input text-[15.5px] font-bold text-foreground"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to="/registrate"
                                className="flex h-[46px] flex-1 items-center justify-center rounded-[9px] bg-primary text-[15.5px] font-bold text-white"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

/** Pie de docs/DISEÑO-FINAL: wordmark 20/800 a la izquierda y "© año Dentissa · Aviso de privacidad" 14.5px #6b7280 a la derecha. */
function Footer() {
    const socials = clinicContent.socials.filter((social) => social.href);

    return (
        <footer className="border-t border-line-soft bg-surface">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
                <Wordmark className="text-xl" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <span className="text-[14.5px] text-ink-4">
                        © {new Date().getFullYear()} Dentissa · Aviso de privacidad
                    </span>
                    {socials.length > 0 && (
                        <div className="flex gap-2.5">
                            {socials.map((social) => {
                                const Icon = SOCIAL_ICONS[social.id];
                                return (
                                    <a
                                        key={social.id}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="flex size-9 items-center justify-center rounded-[9px] border border-line text-ink-4 transition hover:border-primary hover:text-brand"
                                    >
                                        <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}

export default function PublicLayout() {
    const { pathname, hash } = useLocation();
    const scrollRef = useRef<HTMLElement>(null);

    // Navegación entre páginas: vuelve arriba, o va a la sección indicada por el hash (#servicios).
    useEffect(() => {
        if (hash) {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
            }
        }
        scrollRef.current?.scrollTo({ top: 0 });
    }, [pathname, hash]);

    return (
        <div className="flex h-full flex-col bg-surface text-foreground">
            <Header />
            <main ref={scrollRef} className="min-h-0 flex-1 scroll-smooth overflow-y-auto">
                <Suspense fallback={<RouteFallback />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </main>
        </div>
    );
}

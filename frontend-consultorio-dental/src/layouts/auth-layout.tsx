import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { RouteFallback } from "@/components/shared/route-fallback.component";
import { Wordmark } from "@/components/shared/brand-logo.component";

/**
 * Pantallas de acceso de docs/DISEÑO-FINAL (Iniciar sesión / Registrarse): fondo #f4f5f7 con una banda rosa #fc7186 de
 * 340px arriba, "Dentissa" blanco 26/800 a la izquierda y "← Volver al sitio" a la derecha (padding 32x64), la tarjeta
 * blanca centrada (la dibuja `AuthCard`) y el pie "© año Dentissa · Aviso de privacidad". Scroll propio.
 */
export default function AuthLayout() {
    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="relative flex min-h-full flex-col overflow-hidden">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[340px] bg-primary" />

                <header className="relative flex items-center justify-between gap-4 px-5 py-8 sm:px-10 lg:px-16">
                    <Link to="/" aria-label="Dentissa, ir al sitio" className="text-[26px] outline-none focus-visible:ring-3 focus-visible:ring-white/60">
                        <Wordmark light />
                    </Link>
                    <Link
                        to="/"
                        className="rounded text-[15.5px] font-bold text-white outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-white/60"
                    >
                        ← Volver al sitio
                    </Link>
                </header>

                <main className="relative flex flex-1 flex-col items-center px-4 pt-6 pb-[60px]">
                    <Suspense fallback={<div className="w-full max-w-md p-8"><RouteFallback /></div>}>
                        <Outlet />
                    </Suspense>
                    <p className="mt-7 text-center text-sm text-ink-4">
                        © {new Date().getFullYear()} Dentissa · Aviso de privacidad
                    </p>
                </main>
            </div>
        </div>
    );
}

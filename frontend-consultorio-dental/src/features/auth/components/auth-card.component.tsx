import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
    /** Rótulo pequeño sobre el título (opcional). */
    eyebrow?: string;
    title: string;
    description?: string;
    children: ReactNode;
    /** Texto al pie de la tarjeta ("¿Aún no tienes cuenta? Crear cuenta"), tras un divisor. */
    footer?: ReactNode;
    /** `login` = tarjeta de 480px; `register` = tarjeta de 600px. */
    variant?: "login" | "register";
}

/**
 * Contenido de las pantallas de acceso de docs/DISEÑO-FINAL, sobre la banda rosa que dibuja `AuthLayout`:
 * título blanco 38/800 + subtítulo 17.5px, y tarjeta blanca (radio 18, padding 40x44, sombra
 * 0 18px 50px rgba(17,24,39,.10)) de 480px (600px en el registro).
 */
export function AuthCard({ eyebrow, title, description, children, footer, variant = "login" }: AuthCardProps) {
    return (
        <>
            <div className="text-center text-white">
                {eyebrow && <p className="mb-2 text-[15px] font-bold opacity-95">{eyebrow}</p>}
                <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[38px]">{title}</h1>
                {description && <p className="mx-auto mt-2.5 max-w-xl text-base opacity-95 sm:text-[17.5px]">{description}</p>}
            </div>

            <div
                className={cn(
                    "mt-9 w-full rounded-[18px] bg-surface px-6 py-8 shadow-auth sm:px-11 sm:py-10",
                    variant === "register" ? "max-w-[600px]" : "max-w-[480px]",
                )}
            >
                {children}
                {footer && (
                    <>
                        <div className="mt-[30px] mb-6 h-px bg-line-soft" />
                        <div className="text-center text-[15.5px] text-ink-3">{footer}</div>
                    </>
                )}
            </div>
        </>
    );
}

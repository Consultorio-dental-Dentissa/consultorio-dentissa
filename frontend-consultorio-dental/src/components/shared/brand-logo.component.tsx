import { cn } from "@/lib/utils";

/**
 * Marca de Dentissa en docs/DISEÑO-FINAL: solo texto, "Dentissa" 800 con tracking -0.02em.
 * `light` = blanco (sobre la barra lateral o la banda rosa); si no, "Denti" + "ssa" en rosa (#fc7186).
 */
export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
    return (
        <span className={cn("font-extrabold tracking-[-0.02em]", light ? "text-white" : "text-foreground", className)}>
            Denti<span className={light ? undefined : "text-primary"}>ssa</span>
        </span>
    );
}

/**
 * Icono de muela sobre cuadro rosa suave. Ya no es el logotipo (las maquetas usan solo texto): se conserva
 * como marcador de posición cuando un servicio u oferta no tiene imagen.
 */
export function BrandMark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn("flex shrink-0 items-center justify-center bg-brand-soft", className)}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fc7186"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("size-[19px]", iconClassName)}
            >
                <path d="M12 5.5C10 2.5 4 3 4 8c0 4 2 6 3 9 .6 1.8 1.2 4 2 4s1-2 1.5-4 .8-3 1.5-3 1 1 1.5 3 .7 4 1.5 4 1.4-2.2 2-4c1-3 3-5 3-9 0-5-6-5.5-8-2.5Z" />
            </svg>
        </span>
    );
}

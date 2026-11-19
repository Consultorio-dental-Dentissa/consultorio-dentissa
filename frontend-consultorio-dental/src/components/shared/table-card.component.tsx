import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Contenedor de listados de docs/DISEÑO-FINAL: fondo blanco, borde #e5e7eb, radio 10, sin sombra. */
export function TableCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("overflow-hidden rounded-[10px] border border-line bg-surface", className)}>
            {children}
        </div>
    );
}

interface TableToolbarProps {
    children: ReactNode;
    /** Texto de conteo a la derecha ("338 pacientes"). */
    count?: string;
}

/** Barra superior del listado: buscador + filtros (44px, gap 12), padding 18x20 y línea inferior #e5e7eb. */
export function TableToolbar({ children, count }: TableToolbarProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-line px-5 py-[18px] lg:flex-row lg:items-center">
            {children}
            {count && <p className="text-[14.5px] font-semibold text-ink-4 lg:ml-auto" aria-live="polite">{count}</p>}
        </div>
    );
}

import { totalPages } from "@/utils/query";
import { cn } from "@/lib/utils";

interface PaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    /** Sustantivo plural para el texto "Mostrando 8 de 338 pacientes". */
    noun?: string;
}

const BUTTON =
    "h-[38px] rounded-lg border border-input bg-surface px-4 text-[14.5px] font-bold text-ink-3 transition-colors outline-none hover:bg-field focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Paginación de servidor de docs/DISEÑO-FINAL: "Mostrando N de T <sustantivo>" a la izquierda (14.5px #6b7280)
 * y botones "Anterior" / "Siguiente" de 38px a la derecha. Muestra "Página X de Y" solo a lectores de pantalla.
 */
export function Pagination({ page, limit, total, onPageChange, disabled, noun }: PaginationProps) {
    if (total === 0) return null;

    const pages = totalPages(total, limit);
    const shown = Math.min(page * limit, total) - (page - 1) * limit;

    return (
        <nav
            aria-label="Paginación"
            className="flex flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row"
        >
            <p className="text-[14.5px] text-ink-4" aria-live="polite">
                Mostrando {shown} de {total}{noun ? ` ${noun}` : ""}
                <span className="sr-only">. Página {page} de {pages}</span>
            </p>
            <div className="flex gap-2">
                <button
                    type="button"
                    className={cn(BUTTON)}
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || page <= 1}
                >
                    Anterior
                </button>
                <button
                    type="button"
                    className={cn(BUTTON)}
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || page >= pages}
                >
                    Siguiente
                </button>
            </div>
        </nav>
    );
}

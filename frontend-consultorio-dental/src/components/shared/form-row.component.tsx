import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormRowProps {
    label: string;
    /** Icono gris #9aa0a8 de 19px a la izquierda de la etiqueta. */
    icon?: LucideIcon;
    /** `top` alinea la etiqueta arriba (campos multilínea o de imágenes); por defecto se centra con el control. */
    align?: "center" | "top";
    /**
     * Id del control asociado. Sin `htmlFor` (valores de solo lectura o grupos de controles) la etiqueta no es un
     * `<label>` huérfano: el contenido se expone como grupo etiquetado con `aria-labelledby`.
     */
    htmlFor?: string;
    /** Pinta el asterisco de campo obligatorio (el control debe llevar `aria-required`). */
    required?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Fila de formulario de docs/DISEÑO-FINAL (Citas, Servicios, Ofertas, Consultas, Perfil): etiqueta con icono en una
 * columna de 150px (15px/600 #6b7280) y el control a la derecha; separación de 16px. En móvil se apila.
 */
export function FormRow({ label, icon: Icon, align = "center", htmlFor, required, children, className }: FormRowProps) {
    const labelId = useId();
    const labelClass = cn(
        "flex items-center gap-[11px] text-[15px] font-semibold text-ink-4",
        align === "top" && "sm:pt-3",
    );
    const content = (
        <>
            {Icon && <Icon className="size-[19px] shrink-0 text-ink-5" strokeWidth={1.9} aria-hidden="true" />}
            {label}
            {required && <span aria-hidden="true" className="-ml-1.5 text-destructive">*</span>}
        </>
    );

    return (
        <div
            className={cn(
                "grid gap-2 sm:grid-cols-[150px_1fr] sm:gap-4",
                align === "center" ? "sm:items-center" : "sm:items-start",
                className,
            )}
        >
            {htmlFor ? (
                <label htmlFor={htmlFor} className={labelClass}>{content}</label>
            ) : (
                <span id={labelId} className={labelClass}>{content}</span>
            )}
            <div className="min-w-0" {...(htmlFor ? {} : { role: "group", "aria-labelledby": labelId })}>
                {children}
            </div>
        </div>
    );
}

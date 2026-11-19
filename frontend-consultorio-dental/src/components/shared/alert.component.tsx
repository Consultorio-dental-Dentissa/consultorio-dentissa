import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
    variant?: "error" | "info" | "warning" | "success";
    title?: string;
    children: ReactNode;
    className?: string;
}

/**
 * Mensajes de docs/DISEÑO-FINAL. error/success/warning: franja de color suave, 15px (error #fdecec/#b91c1c,
 * éxito #e9f9ef/#15803d). info: aviso blanco con borde #e5e7eb, icono rosa y texto #374151 (Mis citas).
 */
const STYLES = {
    error: "rounded-[9px] bg-danger-soft px-4 py-3.5 font-semibold text-danger-strong",
    success: "rounded-[9px] bg-success-soft px-4 py-3.5 font-bold text-success",
    warning: "rounded-[9px] bg-warning-soft px-4 py-3.5 font-semibold text-warning",
    info: "items-center rounded-[10px] border border-line bg-surface px-[18px] py-3.5 text-ink-2",
} as const;

/** Mensaje en línea (p. ej. error 409 de horario dentro de un formulario). */
export function Alert({ variant = "error", title, children, className }: AlertProps) {
    return (
        <div
            role={variant === "error" ? "alert" : "status"}
            className={cn("flex gap-3 text-[15px]", STYLES[variant], className)}
        >
            {variant === "info" && <Info className="size-5 shrink-0 text-primary" strokeWidth={1.9} aria-hidden="true" />}
            <div>
                {title && <p className="font-extrabold">{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    );
}

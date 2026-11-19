import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    onClose: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg";
    /** Se conserva por compatibilidad: las cabeceras de modal de docs/DISEÑO-FINAL no llevan icono. */
    icon?: LucideIcon;
    /** Rótulo en mayúsculas sobre el título (detalle de citas); sustituye a la descripción. */
    eyebrow?: string;
    /** Contenido junto al título (p. ej. el badge de estatus de la cita). */
    headerExtra?: ReactNode;
}

const SIZES = { sm: "sm:max-w-[440px]", md: "sm:max-w-[620px]", lg: "sm:max-w-[680px]" } as const;

/**
 * Modal estándar de docs/DISEÑO-FINAL: 620px (680 con imágenes), radio 16, sombra 0 20px 50px, cabecera de
 * 24x32 con título 21/800 y cierre de 36px, cuerpo 28x32 y pie `.form-footer` (borde #eceef1, botones a la derecha).
 * Foco atrapado y Escape vía Radix.
 */
export function Modal({ open, onClose, title, description, children, size = "md", eyebrow, headerExtra }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={cn("gap-0 p-0", SIZES[size])} showCloseButton={false}>
                <div className="flex items-center gap-3 border-b border-line-soft px-8 py-6">
                    <div className="min-w-0 flex-1">
                        {eyebrow && <p className="mb-1 text-sm font-bold tracking-[0.05em] text-ink-4 uppercase">{eyebrow}</p>}
                        <div className="flex flex-wrap items-center gap-3">
                            <DialogTitle>{title}</DialogTitle>
                            {headerExtra}
                        </div>
                        {description && !eyebrow ? (
                            <DialogDescription className="mt-0.5 text-sm text-ink-4">{description}</DialogDescription>
                        ) : (
                            <DialogDescription className="sr-only">{title}</DialogDescription>
                        )}
                    </div>
                    <DialogClose
                        aria-label="Cerrar"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-4 transition-colors outline-none hover:bg-fill focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                        <X className="size-5" strokeWidth={2.2} aria-hidden="true" />
                    </DialogClose>
                </div>
                <div className="px-8 pt-7 pb-7">{children}</div>
            </DialogContent>
        </Dialog>
    );
}

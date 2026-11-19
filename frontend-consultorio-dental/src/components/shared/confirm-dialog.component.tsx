import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
}

/**
 * Confirmación de docs/DISEÑO-FINAL ("¿Eliminar este usuario?"): 440px, radio 14, título 21/800, texto
 * 15.5px #4b5563 y dos botones de 44px a la derecha. `destructive` pinta el botón de confirmar en rojo #ef4444
 * (como "Sí, cancelar cita"); sin él usa el rosa primario (como "Sí, eliminar" de las maquetas).
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    destructive = false,
    loading = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(value) => !loading && onOpenChange(value)}>
            <DialogContent className="gap-0 rounded-[14px] p-7 sm:max-w-[440px]" showCloseButton={false}>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="mt-2.5">{description}</DialogDescription>
                <div className="mt-[26px] flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <Spinner />} {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

/** Estado de error de una consulta: mismo formato que el vacío, título en tono de peligro y opción de reintentar. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div role="alert" className="flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center">
            <p className="text-[17px] font-extrabold text-danger-strong">No pudimos cargar la información</p>
            <p className="max-w-md text-[15px] text-ink-4">
                {message ?? "Ocurrió un problema inesperado. Inténtalo de nuevo."}
            </p>
            {onRetry && (
                <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                    <RotateCw /> Reintentar
                </Button>
            )}
        </div>
    );
}

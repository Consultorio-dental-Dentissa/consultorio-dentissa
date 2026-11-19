import { Download, ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsultationImage } from "@/features/consultations/hooks/use-consultations";

interface ConsultationImageProps {
    path: string;
    alt: string;
    onDelete?: () => void;
    disabled?: boolean;
}

/**
 * Imagen clínica privada: se descarga con credenciales (nunca por URL pública),
 * con estados de carga y error, y acciones de descargar y eliminar.
 */
export function ConsultationImage({ path, alt, onDelete, disabled }: ConsultationImageProps) {
    const query = useConsultationImage(path);

    return (
        <div className="overflow-hidden rounded-[9px] border border-line bg-surface">
            <div className="aspect-4/3 w-full bg-[#f4f4f5]">
                {query.isPending && <Skeleton className="size-full rounded-none" aria-busy="true" />}
                {query.isError && (
                    <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <span role="img" aria-label={`${alt} (no disponible)`} className="flex">
                            <ImageOff className="size-5" aria-hidden="true" />
                        </span>
                        <button
                            type="button"
                            onClick={() => query.refetch()}
                            className="text-xs font-bold text-brand underline-offset-2 hover:underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}
                {query.data && <img src={query.data} alt={alt} className="size-full object-cover" />}
            </div>
            {(query.data || onDelete) && (
                <div className="flex items-center justify-end gap-1 p-1.5">
                    {query.data && (
                        <Button variant="ghost" size="icon-sm" asChild>
                            <a href={query.data} download={`consulta-imagen-${path.split("/").pop()}`} aria-label={`Descargar ${alt}`} title="Descargar">
                                <Download />
                            </a>
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="dangerOutline" size="icon-sm" disabled={disabled}
                            onClick={onDelete} aria-label={`Eliminar ${alt}`} title="Eliminar"
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

import { ImageOff, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useOfferImage } from "@/features/offers/hooks/use-offers";

interface OfferImageProps {
    path: string | null;
    alt: string;
    className?: string;
    /** Miniatura: respaldo solo con icono. */
    compact?: boolean;
}

/** Imagen de oferta (vista previa de administración con credenciales), con carga, error y vacío. */
export function OfferImage({ path, alt, className, compact }: OfferImageProps) {
    const query = useOfferImage(path);

    return (
        <div className={cn("relative overflow-hidden bg-fill", className)}>
            {path === null && (
                <div className="flex size-full items-center justify-center text-ink-5" role="img" aria-label={`${alt} (sin imagen)`}>
                    <Tag className={compact ? "size-5" : "size-7"} aria-hidden="true" />
                </div>
            )}
            {path !== null && query.isPending && <Skeleton className="size-full rounded-none" aria-busy="true" />}
            {path !== null && query.isError && (
                <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground" role="img" aria-label={`${alt} (no disponible)`}>
                    <ImageOff className={compact ? "size-5" : "size-6"} aria-hidden="true" />
                    {!compact && <span className="text-xs">Imagen no disponible</span>}
                </div>
            )}
            {path !== null && query.data && <img src={query.data} alt={alt} className="size-full object-cover" />}
        </div>
    );
}

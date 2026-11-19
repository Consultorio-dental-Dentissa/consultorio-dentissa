import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceImageProps {
    src: string;
    alt: string;
    className?: string;
    /** Miniatura: el respaldo muestra solo el icono. */
    compact?: boolean;
}

/** Imagen de servicio con respaldo visual si el archivo no se puede cargar. */
export function ServiceImage({ src, alt, className, compact }: ServiceImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (failedSrc === src) {
        return (
            <div
                role="img"
                aria-label={`${alt} (no disponible)`}
                className={cn("flex flex-col items-center justify-center gap-1 bg-surface-muted text-muted-foreground", className)}
            >
                <ImageOff className={compact ? "size-5" : "size-6"} aria-hidden="true" />
                {!compact && <span className="text-xs">Imagen no disponible</span>}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={cn("object-cover", className)}
            onError={() => setFailedSrc(src)}
        />
    );
}

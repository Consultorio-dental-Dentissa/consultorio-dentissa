import { useState } from "react";
import type { Service } from "@/features/services/types/service.model";
import { PhotoBlock } from "@/features/public/components/public-ui";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import { cn } from "@/lib/utils";

/** Tarjeta de servicio de la maqueta: imagen 230px, nombre 21/800, descripción, duración y precio. */
export function ServiceCard({ service, className }: { service: Service; className?: string }) {
    const [failed, setFailed] = useState(false);
    const image = failed ? undefined : service.images[0];

    return (
        <article className={cn("flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-surface", className)}>
            <div className="h-[230px] shrink-0 bg-background">
                {image ? (
                    <img
                        src={image.url}
                        alt={`Imagen del servicio ${service.name}`}
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="size-full object-cover"
                    />
                ) : (
                    <PhotoBlock alt="" className="size-full rounded-none" />
                )}
            </div>
            <div className="flex flex-1 flex-col px-[26px] pt-6 pb-[26px]">
                <h3 className="text-[21px] font-extrabold">{service.name}</h3>
                <p className="mt-2 line-clamp-3 text-base leading-[1.55] text-ink-3">{service.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-[15px] font-semibold text-ink-4">{formatTotalMinutesToHours(service.durationMinutes)}</span>
                    <span className="text-xl font-extrabold">{formatCurrency(service.price)}</span>
                </div>
            </div>
        </article>
    );
}

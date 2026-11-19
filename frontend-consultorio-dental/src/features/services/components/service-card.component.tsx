import { Images, Pencil } from "lucide-react";
import { ActiveBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import type { Service } from "@/features/services/types/service.model";

interface ServiceCardProps {
    service: Service;
    canManage: boolean;
    onToggleStatus: (service: Service) => void;
    onManageImages: (service: Service) => void;
    onEdit: (service: Service) => void;
}

/** Versión en tarjeta de una fila del catálogo de servicios para pantallas pequeñas. */
export function ServiceCard({ service, canManage, onToggleStatus, onManageImages, onEdit }: ServiceCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[15.5px] font-bold">{service.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-4">{service.description}</p>
                </div>
                {!canManage && <ActiveBadge active={service.status} />}
            </div>
            <p className="flex items-center gap-3 text-[15px] text-ink-2">
                <span>{formatTotalMinutesToHours(service.durationMinutes)}</span>
                <span aria-hidden="true" className="text-ink-5">·</span>
                <span className="font-extrabold text-foreground">{formatCurrency(service.price)}</span>
            </p>
            {canManage && (
                <div className="flex items-center justify-between gap-2 border-t border-line-row pt-3">
                    <span className="flex items-center gap-3">
                        <Switch
                            checked={service.status}
                            onCheckedChange={() => onToggleStatus(service)}
                            aria-label={`${service.status ? "Desactivar" : "Activar"} ${service.name}`}
                        />
                        <span className={service.status ? "text-[14.5px] font-semibold text-success" : "text-[14.5px] text-ink-4"}>
                            {service.status ? "Activo" : "Inactivo"}
                        </span>
                    </span>
                    <span className="flex gap-2">
                        <Button
                            variant="secondary" size="icon-sm" onClick={() => onManageImages(service)}
                            aria-label={`Administrar imágenes de ${service.name}`} title="Imágenes"
                        >
                            <Images />
                        </Button>
                        <Button
                            variant="secondary" size="icon-sm" onClick={() => onEdit(service)}
                            aria-label={`Editar ${service.name}`} title="Editar"
                        >
                            <Pencil />
                        </Button>
                    </span>
                </div>
            )}
        </div>
    );
}

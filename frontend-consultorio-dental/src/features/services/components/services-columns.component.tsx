import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Images, Pencil } from "lucide-react";
import { ActiveBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ServiceImage } from "@/features/services/components/service-image.component";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import type { Service } from "@/features/services/types/service.model";

interface ServicesColumnsOptions {
    /** Solo el ADMIN gestiona servicios; el resto los ve en modo lectura. */
    canManage: boolean;
    onToggleStatus: (service: Service) => void;
    onManageImages: (service: Service) => void;
    onEdit: (service: Service) => void;
}

/** Columnas del catálogo (docs/DISEÑO: miniatura, Servicio, Duración, Precio, Estatus, Acciones). */
export function getServicesColumns({ canManage, onToggleStatus, onManageImages, onEdit }: ServicesColumnsOptions): ColumnDef<Service>[] {
    const columns: ColumnDef<Service>[] = [
        {
            id: "service",
            header: "Servicio",
            cell: ({ row }) => {
                const cover = row.original.images[0];
                return (
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-[52px] w-16 shrink-0 overflow-hidden rounded-lg bg-fill">
                            {cover ? (
                                <ServiceImage
                                    src={cover.url}
                                    alt={`Imagen de ${row.original.name}`}
                                    className="size-full"
                                    compact
                                />
                            ) : (
                                <ImageIcon className="absolute inset-0 m-auto size-5 text-ink-5" aria-label="Sin imágenes" role="img" />
                            )}
                            <span
                                aria-label={`${row.original.images.length} imágenes`}
                                className="absolute right-0.5 bottom-0.5 rounded bg-[rgba(31,35,40,.7)] px-1 text-[10px] leading-[14px] font-bold text-white"
                            >
                                {row.original.images.length}
                            </span>
                        </div>
                        <div className="max-w-[360px] min-w-0 pr-4">
                            <p className="truncate text-[15.5px] font-bold">{row.original.name}</p>
                            <p className="truncate text-sm text-ink-4">{row.original.description}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "duration",
            header: "Duración",
            cell: ({ row }) => (
                <span className="text-[15px] text-ink-2">{formatTotalMinutesToHours(row.original.durationMinutes)}</span>
            ),
        },
        {
            id: "price",
            header: "Precio",
            cell: ({ row }) => <span className="text-[15px] font-extrabold">{formatCurrency(row.original.price)}</span>,
        },
        {
            id: "status",
            header: "Estatus",
            cell: ({ row }) =>
                canManage ? (
                    <span className="flex items-center gap-3">
                        <Switch
                            checked={row.original.status}
                            onCheckedChange={() => onToggleStatus(row.original)}
                            aria-label={`${row.original.status ? "Desactivar" : "Activar"} ${row.original.name}`}
                        />
                        <span className={row.original.status ? "text-[14.5px] font-semibold text-success" : "text-[14.5px] text-ink-4"}>
                            {row.original.status ? "Activo" : "Inactivo"}
                        </span>
                    </span>
                ) : (
                    <ActiveBadge active={row.original.status} />
                ),
        },
    ];

    if (canManage) {
        columns.push({
            id: "actions",
            header: () => <span className="block text-right">Acciones</span>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => onManageImages(row.original)}
                        aria-label={`Administrar imágenes de ${row.original.name}`}
                        title="Imágenes"
                    >
                        <Images />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => onEdit(row.original)}
                        aria-label={`Editar ${row.original.name}`}
                        title="Editar"
                    >
                        <Pencil />
                    </Button>
                </div>
            ),
        });
    }

    return columns;
}

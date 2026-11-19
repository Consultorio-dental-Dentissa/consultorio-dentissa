import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OfferImage } from "@/features/offers/components/offer-image.component";
import { addDays, clinicTodayKey, formatKeyShort } from "@/utils/clinic-time";
import type { Offer, OfferValidity } from "@/features/offers/types/offer.model";

interface OffersColumnsOptions {
    onToggleStatus: (offer: Offer) => void;
    onEdit: (offer: Offer) => void;
    onDelete: (offer: Offer) => void;
}

export function getOfferValidity(offer: Pick<Offer, "start_date" | "end_date">, today = clinicTodayKey()): OfferValidity {
    if (today < offer.start_date) return "upcoming";
    if (today > offer.end_date) return "expired";
    return "current";
}

const VALIDITY: Record<OfferValidity, { label: string; variant: "success" | "warning" | "base" }> = {
    current: { label: "Vigente", variant: "success" },
    upcoming: { label: "Programada", variant: "warning" },
    expired: { label: "Vencida", variant: "base" },
};

export function formatOfferRange(offer: Pick<Offer, "start_date" | "end_date">): string {
    return `${formatKeyShort(offer.start_date)} ${offer.start_date.slice(0, 4)} – ${formatKeyShort(offer.end_date)} ${offer.end_date.slice(0, 4)}`;
}

/** Columnas del listado de ofertas (mismo lenguaje que Servicios: miniatura, texto, estado y acciones). */
export function getOffersColumns({ onToggleStatus, onEdit, onDelete }: OffersColumnsOptions): ColumnDef<Offer>[] {
    return [
        {
            id: "thumb",
            meta: { className: "w-[88px] pr-0" },
            header: () => <span className="sr-only">Imagen</span>,
            cell: ({ row }) => (
                <OfferImage
                    path={row.original.image_path}
                    alt={`Imagen de ${row.original.name}`}
                    compact
                    className="h-[52px] w-16 rounded-lg"
                />
            ),
        },
        {
            id: "offer",
            header: "Oferta",
            cell: ({ row }) => (
                <div className="max-w-[340px] min-w-0 pr-4">
                    <p className="truncate text-[15.5px] font-bold">{row.original.name}</p>
                    <p className="truncate text-sm text-ink-4">{row.original.description}</p>
                </div>
            ),
        },
        {
            id: "validity",
            header: "Vigencia",
            cell: ({ row }) => {
                const state = getOfferValidity(row.original);
                // "Por vencer": vigente y termina en 7 días o menos (se deriva de las fechas).
                const today = clinicTodayKey();
                const ending = state === "current" && row.original.end_date <= addDays(today, 7);
                const validity = ending ? { label: "Por vencer", variant: "warning" as const } : VALIDITY[state];
                return (
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-[15px] whitespace-nowrap text-ink-2">{formatOfferRange(row.original)}</span>
                        <Badge variant={validity.variant}>{validity.label}</Badge>
                    </div>
                );
            },
        },
        {
            id: "services",
            header: "Servicios",
            cell: ({ row }) => (
                <span className="text-[15px] text-ink-2">
                    {row.original.services.length === 0
                        ? "Sin servicios"
                        : `${row.original.services.length} ${row.original.services.length === 1 ? "servicio" : "servicios"}`}
                </span>
            ),
        },
        {
            id: "status",
            header: "Publicada",
            cell: ({ row }) => (
                <Switch
                    checked={row.original.status}
                    onCheckedChange={() => onToggleStatus(row.original)}
                    aria-label={`${row.original.status ? "Desactivar" : "Activar"} la oferta ${row.original.name}`}
                />
            ),
        },
        {
            id: "actions",
            header: () => <span className="block text-right">Acciones</span>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="icon-sm" onClick={() => onEdit(row.original)} aria-label={`Editar la oferta ${row.original.name}`} title="Editar">
                        <Pencil />
                    </Button>
                    <Button variant="destructive" size="icon-sm" onClick={() => onDelete(row.original)} aria-label={`Eliminar la oferta ${row.original.name}`} title="Eliminar">
                        <Trash2 />
                    </Button>
                </div>
            ),
        },
    ];
}

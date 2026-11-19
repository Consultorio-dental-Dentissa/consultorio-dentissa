import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationThumb } from "@/features/consultations/components/consultation-thumb.component";
import { formatClinicShortDate, formatClinicTime } from "@/utils/clinic-time";
import type { Consultation } from "@/features/consultations/types/consultation.model";

const MAX_THUMBS = 3;

/** Columnas de Consultas.dc.html: paciente, servicio, fecha y hora, imágenes (miniaturas solapadas) y editar. */
export function getConsultationColumns(onView: (consultation: Consultation) => void): ColumnDef<Consultation>[] {
    return [
        {
            id: "patient",
            header: "Paciente",
            cell: ({ row }) => (
                <span className="text-[15.5px] font-bold">{row.original.patient.name} {row.original.patient.lastname}</span>
            ),
        },
        {
            id: "service",
            header: "Servicio",
            cell: ({ row }) => <span className="text-[15px] text-ink-2">{row.original.service_name}</span>,
        },
        {
            id: "date",
            header: "Fecha",
            cell: ({ row }) => (
                <div>
                    <p className="text-[15px] font-bold">{formatClinicShortDate(row.original.scheduled_at)}</p>
                    <p className="text-sm text-ink-4">{formatClinicTime(row.original.scheduled_at)}</p>
                </div>
            ),
        },
        {
            id: "images",
            header: "Imágenes",
            cell: ({ row }) => {
                const images = row.original.images;
                if (images.length === 0) return <span className="text-sm text-ink-5">Sin imágenes</span>;
                return (
                    <span
                        className="flex items-center"
                        role="img"
                        aria-label={`${images.length} ${images.length === 1 ? "imagen" : "imágenes"}`}
                    >
                        {images.slice(0, MAX_THUMBS).map((image, index) => (
                            <ConsultationThumb key={image.id} image={image} alt={`Imagen ${index + 1} de la consulta`} />
                        ))}
                        {images.length > MAX_THUMBS && (
                            <span className="-ml-2.5 flex size-[34px] items-center justify-center rounded-full border-2 border-surface bg-foreground text-xs font-extrabold text-white">
                                +{images.length - MAX_THUMBS}
                            </span>
                        )}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <span className="block text-right">Acciones</span>,
            meta: { className: "w-[110px]" },
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="secondary" size="icon-sm" onClick={() => onView(row.original)}
                        aria-label={`Ver o editar la consulta de ${row.original.patient.name} ${row.original.patient.lastname}`}
                        title="Ver / editar"
                    >
                        <Pencil />
                    </Button>
                </div>
            ),
        },
    ];
}

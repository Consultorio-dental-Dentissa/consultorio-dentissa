import { Images, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatClinicShortDate, formatClinicTime } from "@/utils/clinic-time";
import type { Consultation } from "@/features/consultations/types/consultation.model";

/** Versión en tarjeta de una fila de consultas para pantallas pequeñas. */
export function ConsultationCard({ consultation, onView }: { consultation: Consultation; onView: (consultation: Consultation) => void }) {
    const fullName = `${consultation.patient.name} ${consultation.patient.lastname}`;
    const count = consultation.images.length;

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="min-w-0">
                <p className="truncate text-[15.5px] font-bold">{fullName}</p>
                <p className="mt-0.5 truncate text-[15px] text-ink-2">{consultation.service_name}</p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line-row pt-3">
                <div>
                    <p className="text-[15px] font-bold">
                        {formatClinicShortDate(consultation.scheduled_at)}
                        <span className="ml-2 text-sm font-normal text-ink-4">{formatClinicTime(consultation.scheduled_at)}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-4">
                        <Images className="size-4" aria-hidden="true" />
                        {count === 0 ? "Sin imágenes" : `${count} ${count === 1 ? "imagen" : "imágenes"}`}
                    </p>
                </div>
                <Button
                    variant="secondary" size="icon-sm" onClick={() => onView(consultation)}
                    aria-label={`Ver o editar la consulta de ${fullName}`} title="Ver / editar"
                >
                    <Pencil />
                </Button>
            </div>
        </div>
    );
}

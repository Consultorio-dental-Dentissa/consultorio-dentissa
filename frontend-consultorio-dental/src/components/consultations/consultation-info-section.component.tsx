import type { Consultation } from "@/types/models/consultation";
import { formatDate } from "@/utils/formatters";
import { Separator } from "../ui/separator";
import { Stethoscope, CalendarDays } from "lucide-react";
import { Button } from "../ui/button";

interface ConsultationInfoSectionProps {
    consultation: Consultation;
    onEdit: () => void;
}

export function ConsultationInfoSection({ consultation, onEdit }: ConsultationInfoSectionProps) {

    const fullName = `${consultation.patient.name} ${consultation.patient.lastname}`;

    return (
        <div className="space-y-6">

            {/* Encabezado: paciente */}
            <div className="space-y-1 flex items-center justify-between">

                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Paciente
                </p>
                <p className="text-lg font-semibold leading-tight text-stone-900">
                    {fullName}
                </p>
                </div>
                
                <div>
                    <Button type="button" variant="secondary" onClick={onEdit}>Modificar consulta</Button>
                </div>
            </div>

            <Separator />

            {/* Servicio y fecha */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-stone-100 bg-stone-50/70 p-4">

                <div className="flex items-start gap-2.5">
                    <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">Servicio</p>
                        <p className="text-sm font-medium text-stone-900">
                            {consultation.service.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">Fecha de la consulta</p>
                        <p className="text-sm font-medium text-stone-900">
                            {formatDate(consultation.created_at)}
                        </p>
                    </div>
                </div>

            </div>

            <Separator />

            {/* Notas */}
            <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Notas
                </p>
                <p className="text-sm leading-relaxed text-stone-700">
                    {consultation.notes}
                </p>
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Observaciones
                </p>
                <p className="text-sm leading-relaxed text-stone-700">
                    {consultation.observations}
                </p>
            </div>
        </div>
    )
}

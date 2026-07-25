import type { Appointment } from "@/types/models/appointment";
import { formatDate } from "@/utils/formatters";
import { Separator } from "../ui/separator";
import { CalendarDays, Stethoscope, Clock } from "lucide-react";
import { StatusSpan } from "../common/span.component";

interface AppointmentInfoSecctionProps {
    appointment: Appointment;
}

export function AppointmentInfoSecction({ appointment }: AppointmentInfoSecctionProps) {

    const fullName = `${appointment.patient.name} ${appointment.patient.lastname}`;

    return (
        <div className="space-y-6">

            {/* Encabezado: paciente + estatus */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Paciente
                    </p>
                    <p className="text-lg font-semibold leading-tight text-stone-900">
                        {fullName}
                    </p>
                </div>
                <StatusSpan status={appointment.status} />
            </div>

            <Separator />

            {/* Servicio */}
            <div className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Servicio
                    </p>
                    <p className="text-sm font-medium text-stone-900">
                        {appointment.service.name}
                    </p>
                </div>
            </div>

            {/* Detalles: fecha, hora, duración */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-stone-100 bg-stone-50/70 p-4">

                <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">Fecha</p>
                        <p className="text-sm font-medium text-stone-900">
                            {formatDate(appointment.scheduled_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">Hora</p>
                        <p className="text-sm font-medium text-stone-900">
                            {`${appointment.scheduled_at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${appointment.scheduled_at_end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                        </p>
                    </div>
                </div>

                <div className="space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">Duración</p>
                    <p className="text-sm font-medium text-stone-900">
                        {appointment.durationMinutes} min
                    </p>
                </div>

            </div>

            <Separator />

            {/* Notas */}
            <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Notas
                </p>
                <p className="text-sm leading-relaxed text-stone-700">
                    {appointment.notes || "Sin notas registradas"}
                </p>
            </div>
        </div>

    )
}
import { CalendarClock, Check, CheckCheck, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { getAppointmentActions, hasAnyAction } from "@/features/appointments/types/appointment.permissions";
import { Role } from "@/features/users/types/rol.enum";
import { formatDateTime, formatTotalMinutesToHours } from "@/utils/formatters";
import type { Appointment } from "@/features/appointments/types/appointment.model";

interface AppointmentCardProps {
    appointment: Appointment;
    role: string;
    /** Instante actual (ms) de `useNow`, para decidir qué acciones se ofrecen. */
    now: number;
    onView: (appointment: Appointment) => void;
    onConfirm: (appointment: Appointment) => void;
    onComplete: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment) => void;
    onEdit: (appointment: Appointment) => void;
}

/** Versión en tarjeta de una fila de citas para pantallas pequeñas. */
export function AppointmentCard({
    appointment, role, now, onView, onConfirm, onComplete, onCancel, onReschedule, onEdit,
}: AppointmentCardProps) {
    const actions = getAppointmentActions(role, appointment, new Date(now));

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
                <button
                    type="button"
                    onClick={() => onView(appointment)}
                    className="min-w-0 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                    <span className="block text-[15px] font-bold">{formatDateTime(appointment.scheduled_at)}</span>
                    <span className="block text-sm text-muted-foreground">
                        {appointment.service.name} · {formatTotalMinutesToHours(appointment.durationMinutes)}
                    </span>
                    {role !== Role.PACIENTE && (
                        <span className="mt-1 block text-sm font-medium">
                            {appointment.patient.name} {appointment.patient.lastname}
                        </span>
                    )}
                </button>
                <AppointmentStatusBadge status={appointment.status} />
            </div>

            {hasAnyAction(actions) && (
                <div className="flex flex-wrap gap-2 border-t border-border/70 pt-3">
                    {actions.confirm && (
                        <Button variant="secondary" size="sm" onClick={() => onConfirm(appointment)}>
                            <Check /> Confirmar
                        </Button>
                    )}
                    {actions.complete && (
                        <Button variant="secondary" size="sm" onClick={() => onComplete(appointment)}>
                            <CheckCheck /> Completar
                        </Button>
                    )}
                    {actions.edit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                            <Pencil /> Editar
                        </Button>
                    )}
                    {actions.reschedule && (
                        <Button variant="outline" size="sm" onClick={() => onReschedule(appointment)}>
                            <CalendarClock /> Reprogramar
                        </Button>
                    )}
                    {actions.cancel && (
                        <Button variant="dangerOutline" size="sm" onClick={() => onCancel(appointment)}>
                            <X /> Cancelar
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

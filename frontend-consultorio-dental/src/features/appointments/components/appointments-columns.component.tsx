import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Check, CheckCheck, Pencil, X } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { Role } from "@/features/users/types/rol.enum";
import { formatDateTime, formatTime, formatTotalMinutesToHours } from "@/utils/formatters";
import type { Appointment } from "@/features/appointments/types/appointment.model";

interface AppointmentColumnsOptions {
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

export function getAppointmentColumns(options: AppointmentColumnsOptions): ColumnDef<Appointment>[] {
    const { role, now, onView, onConfirm, onComplete, onCancel, onReschedule, onEdit } = options;

    const columns: ColumnDef<Appointment>[] = [
        {
            id: "schedule",
            header: "Fecha y hora",
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => onView(row.original)}
                    className="rounded-md text-left outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label={`Ver detalle de la cita del ${formatDateTime(row.original.scheduled_at)}`}
                >
                    <span className="block text-[15.5px] font-bold">{formatDateTime(row.original.scheduled_at)}</span>
                    <span className="block text-sm text-ink-4">
                        hasta {formatTime(row.original.scheduled_at_end)}
                    </span>
                </button>
            ),
        },
    ];

    if (role !== Role.PACIENTE) {
        columns.push({
            id: "patient",
            header: "Paciente",
            cell: ({ row }) => (
                <span className="text-[15.5px] font-bold">
                    {row.original.patient.name} {row.original.patient.lastname}
                </span>
            ),
        });
    }

    columns.push(
        {
            id: "service",
            header: "Servicio",
            cell: ({ row }) => (
                <div>
                    <span className="block text-[15px] text-ink-2">{row.original.service.name}</span>
                    <span className="block text-sm text-ink-4">
                        {formatTotalMinutesToHours(row.original.durationMinutes)}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Estatus",
            cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            header: () => <span className="block text-right">Acciones</span>,
            cell: ({ row }) => {
                const appointment = row.original;
                const actions = getAppointmentActions(role, appointment, new Date(now));
                const label = `${appointment.service.name}, ${formatDateTime(appointment.scheduled_at)}`;

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        {actions.confirm && (
                            <Button
                                variant="outline" size="icon-sm"
                                onClick={() => onConfirm(appointment)}
                                title="Confirmar" aria-label={`Confirmar cita: ${label}`}
                            >
                                <Check />
                            </Button>
                        )}
                        {actions.complete && (
                            <Button
                                variant="outline" size="icon-sm"
                                onClick={() => onComplete(appointment)}
                                title="Marcar como completada" aria-label={`Completar cita: ${label}`}
                            >
                                <CheckCheck />
                            </Button>
                        )}
                        {actions.edit && (
                            <Button
                                variant="outline" size="icon-sm"
                                onClick={() => onEdit(appointment)}
                                title="Editar" aria-label={`Editar cita: ${label}`}
                            >
                                <Pencil />
                            </Button>
                        )}
                        {actions.reschedule && (
                            <Button
                                variant="outline" size="icon-sm"
                                onClick={() => onReschedule(appointment)}
                                title="Reprogramar" aria-label={`Reprogramar cita: ${label}`}
                            >
                                <CalendarClock />
                            </Button>
                        )}
                        {actions.cancel && (
                            <Button
                                variant="dangerOutline" size="icon-sm"
                                onClick={() => onCancel(appointment)}
                                title="Cancelar" aria-label={`Cancelar cita: ${label}`}
                            >
                                <X />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    );

    return columns;
}

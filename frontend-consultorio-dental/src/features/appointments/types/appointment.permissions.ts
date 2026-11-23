import { Role } from "@/features/users/types/rol.enum";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import type { Appointment } from "@/features/appointments/types/appointment.model";

export interface AppointmentActions {
    confirm: boolean;
    complete: boolean;
    cancel: boolean;
    reschedule: boolean;
    /** Editar servicio y notas (la fecha se cambia con "Reprogramar"). */
    edit: boolean;
}

const OPEN_STATUSES: string[] = [
    STATUS_APPOINTMENT.PENDIENTE,
    STATUS_APPOINTMENT.CONFIRMADA,
    STATUS_APPOINTMENT.REPROGRAMADA,
];

const PENDING_LIKE: string[] = [STATUS_APPOINTMENT.PENDIENTE, STATUS_APPOINTMENT.REPROGRAMADA];

/**
 * Qué acciones se OFRECEN en la UI según rol y estado. Es solo ayuda de
 * usabilidad: el backend valida cada transición y puede responder 409/403.
 *
 * - Editar (servicio y notas): mismos roles/estados que reprogramar.
 * - ADMIN: confirmar (cita pendiente, aunque ya haya pasado), completar
 *   (confirmada y ya iniciada), cancelar y reprogramar citas abiertas.
 * - ASISTENTE: cancelar y reprogramar; nunca confirma ni completa.
 * - PACIENTE: cancelar/reprogramar solo sus citas PENDIENTE/REPROGRAMADA futuras.
 */
export function getAppointmentActions(
    role: string,
    appointment: { status: string; scheduled_at: Appointment["scheduled_at"] },
    now: Date = new Date(),
): AppointmentActions {
    const isFuture = appointment.scheduled_at.getTime() > now.getTime();
    const started = !isFuture;

    if (role === Role.ADMINISTRADOR) {
        return {
            // Sin límite de fecha: una cita pendiente olvidada se puede confirmar aunque ya haya pasado.
            confirm: PENDING_LIKE.includes(appointment.status),
            complete: appointment.status === STATUS_APPOINTMENT.CONFIRMADA && started,
            cancel: OPEN_STATUSES.includes(appointment.status),
            reschedule: OPEN_STATUSES.includes(appointment.status),
            edit: OPEN_STATUSES.includes(appointment.status),
        };
    }

    if (role === Role.ASISTENTE) {
        return {
            confirm: false,
            complete: false,
            cancel: OPEN_STATUSES.includes(appointment.status),
            reschedule: OPEN_STATUSES.includes(appointment.status),
            edit: OPEN_STATUSES.includes(appointment.status),
        };
    }

    if (role === Role.PACIENTE) {
        const allowed = PENDING_LIKE.includes(appointment.status) && isFuture;
        return { confirm: false, complete: false, cancel: allowed, reschedule: allowed, edit: allowed };
    }

    return { confirm: false, complete: false, cancel: false, reschedule: false, edit: false };
}

export function hasAnyAction(actions: AppointmentActions): boolean {
    return actions.confirm || actions.complete || actions.cancel || actions.reschedule || actions.edit;
}

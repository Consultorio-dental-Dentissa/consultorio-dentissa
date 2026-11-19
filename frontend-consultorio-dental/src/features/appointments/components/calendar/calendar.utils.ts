import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { addDays, clinicDayKey, clinicHourMinute, startOfMonth, startOfWeek } from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

export type CalendarView = "day" | "week" | "month";

/**
 * Colores por estado de Citas.dc.html (DISEÑO-NUEVO): `box` = fondo + borde de la tarjeta,
 * `text` = nombre/servicio, `sub` = hora, `solid` = punto/icono de color pleno.
 */
export const EVENT_STYLES: Record<string, { box: string; text: string; sub: string; solid: string }> = {
    [STATUS_APPOINTMENT.PENDIENTE]: { box: "bg-event-pending border-event-pending", text: "text-event-pending-fg", sub: "text-event-pending-fg", solid: "bg-neutral-dot" },
    [STATUS_APPOINTMENT.CONFIRMADA]: { box: "bg-event-confirmed border-event-confirmed", text: "text-event-confirmed-fg", sub: "text-event-confirmed-fg", solid: "bg-success-dot" },
    [STATUS_APPOINTMENT.COMPLETADA]: { box: "bg-event-completed border-event-completed", text: "text-event-completed-fg", sub: "text-event-completed-fg", solid: "bg-info-dot" },
    [STATUS_APPOINTMENT.REPROGRAMADA]: { box: "bg-event-rescheduled border-event-rescheduled", text: "text-event-rescheduled-fg", sub: "text-event-rescheduled-fg", solid: "bg-warning-dot" },
    [STATUS_APPOINTMENT.CANCELADA]: { box: "bg-event-canceled border-event-canceled", text: "text-event-canceled-fg", sub: "text-event-canceled-fg", solid: "bg-danger-dot" },
};

/** Agrupa las citas por día de la zona del consultorio, ya ordenadas por hora. */
export function groupByDay(appointments: Appointment[]): Map<string, Appointment[]> {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
        const key = clinicDayKey(appointment.scheduled_at);
        const list = map.get(key);
        if (list) list.push(appointment);
        else map.set(key, [appointment]);
    }
    for (const list of map.values()) {
        list.sort((a, b) => a.scheduled_at.getTime() - b.scheduled_at.getTime());
    }
    return map;
}

export function fullPatientName(appointment: Appointment): string {
    return `${appointment.patient.name} ${appointment.patient.lastname}`.trim();
}

export const DEFAULT_FIRST_HOUR = 8;
export const DEFAULT_LAST_HOUR = 19;
/** Alto en px de una hora en la rejilla (Citas.dc.html). */
export const HOUR_HEIGHT = 60;

/** Horas (filas) a mostrar: de 8:00 a 19:00, ampliadas si hay citas fuera de ese horario. */
export function hourRows(appointments: Appointment[]): number[] {
    let first = DEFAULT_FIRST_HOUR;
    let last = DEFAULT_LAST_HOUR - 1;
    for (const appointment of appointments) {
        const start = clinicHourMinute(appointment.scheduled_at);
        const end = clinicHourMinute(appointment.scheduled_at_end);
        first = Math.min(first, start.hour);
        // Una cita que termina pasada la hora en punto ocupa también esa fila (máx. 23:00).
        const endRow = Math.min(23, end.minute > 0 ? end.hour : end.hour - 1);
        last = Math.max(last, start.hour, endRow);
    }
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

export const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

/** "9:00" (sin cero a la izquierda), como la maqueta. */
export function shortTime(date: Date): string {
    const { hour, minute } = clinicHourMinute(date);
    return `${hour}:${String(minute).padStart(2, "0")}`;
}

/** "9:00 – 9:30". */
export const timeRange = (appointment: Appointment) =>
    `${shortTime(appointment.scheduled_at)} – ${shortTime(appointment.scheduled_at_end)}`;

/** Rango (6 semanas completas, lunes a domingo) que dibuja el mini calendario de un mes. */
export function miniCalendarRange(month: string) {
    const from = startOfWeek(startOfMonth(month));
    return { from, to: addDays(from, 41) };
}

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Role } from "@/features/users/types/rol.enum";
import { EVENT_STYLES, fullPatientName, timeRange } from "@/features/appointments/components/calendar/calendar.utils";
import { formatClinicTime } from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

interface CalendarEventProps {
    appointment: Appointment;
    role: string;
    onSelect: (appointment: Appointment) => void;
    /** Versión de una línea para la vista mensual. */
    compact?: boolean;
    /** Muestra la línea del servicio (citas de una hora o más, o agenda móvil). */
    showService?: boolean;
    className?: string;
    style?: CSSProperties;
}

/** Tarjeta de cita del calendario: fondo, borde y texto por estado (Citas.dc.html). */
export function CalendarEvent({ appointment, role, onSelect, compact, showService = true, className, style }: CalendarEventProps) {
    const colors = EVENT_STYLES[appointment.status] ?? EVENT_STYLES.PENDIENTE;
    const isPatient = role === Role.PACIENTE;
    const title = isPatient ? appointment.service.name : fullPatientName(appointment);
    const label = `${isPatient ? "" : `${fullPatientName(appointment)}, `}${appointment.service.name}, ${formatClinicTime(appointment.scheduled_at)}, ${appointment.status.toLowerCase()}`;

    if (compact) {
        return (
            <button
                type="button"
                onClick={() => onSelect(appointment)}
                aria-label={label}
                title={label}
                className={cn(
                    "block w-full truncate rounded-md border px-1.5 py-[3px] text-left text-xs leading-tight font-bold outline-none transition hover:shadow-[0_6px_16px_-8px_rgba(0,0,0,.25)] focus-visible:ring-3 focus-visible:ring-ring/50",
                    colors.box, colors.text, className,
                )}
            >
                {title}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => onSelect(appointment)}
            aria-label={label}
            title={label}
            style={style}
            className={cn(
                "block w-full overflow-hidden rounded-lg border px-2.5 py-[5px] text-left leading-tight outline-none transition-shadow hover:shadow-[0_6px_16px_-8px_rgba(0,0,0,.25)] focus-visible:ring-3 focus-visible:ring-ring/50",
                colors.box, className,
            )}
        >
            <span className={cn("block truncate text-[13.5px] font-extrabold", colors.text)}>{title}</span>
            {showService && !isPatient && (
                <span className={cn("mt-0.5 block truncate text-[12.5px] font-semibold opacity-85", colors.sub)}>{appointment.service.name}</span>
            )}
            <span className={cn("mt-0.5 block text-xs font-semibold opacity-75", colors.sub)}>{timeRange(appointment)}</span>
        </button>
    );
}

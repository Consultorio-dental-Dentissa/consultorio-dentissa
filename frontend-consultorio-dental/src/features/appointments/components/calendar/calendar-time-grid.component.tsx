import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/features/appointments/components/calendar/calendar-event.component";
import { groupByDay, HOUR_HEIGHT, hourLabel, hourRows } from "@/features/appointments/components/calendar/calendar.utils";
import {
    clinicDateTimeToDate, clinicHourMinute, dayNumber, formatKeyLong, formatKeyWeekdayShort, weekdayIndex,
} from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

interface CalendarTimeGridProps {
    days: string[];
    appointments: Appointment[];
    todayKey: string;
    /** Instante actual (ms) para atenuar horarios que ya pasaron y dibujar la línea de "ahora". */
    now: number;
    role: string;
    isFetching?: boolean;
    onSelect: (appointment: Appointment) => void;
    /** Pulsar un hueco libre: agenda en ese día y hora (el backend valida disponibilidad). */
    onCreate: (day: string, time: string) => void;
}

const ROW_LINES =
    "repeating-linear-gradient(to bottom, transparent 0, transparent 59px, #f1f2f4 59px, #f1f2f4 60px)";

/** Rejilla horaria de Citas.dc.html: columna de horas de 60px + una columna por día con citas posicionadas por hora. */
export function CalendarTimeGrid({ days, appointments, todayKey, now, role, isFetching, onSelect, onCreate }: CalendarTimeGridProps) {
    const byDay = groupByDay(appointments);
    const rows = hourRows(appointments);
    const firstHour = rows[0];
    const bodyHeight = rows.length * HOUR_HEIGHT;
    // Los huecos de agendar entran en el orden de tabulación solo para el día activo (hoy o el primero visible).
    const activeDay = days.includes(todayKey) ? todayKey : days[0];
    const template = { gridTemplateColumns: `66px repeat(${days.length}, minmax(0, 1fr))` };

    const nowParts = clinicHourMinute(new Date(now));
    const nowOffset = (nowParts.hour + nowParts.minute / 60 - firstHour) * HOUR_HEIGHT;
    const showNow = days.includes(todayKey) && nowOffset >= 0 && nowOffset <= bodyHeight;
    const nowText = `${nowParts.hour}:${String(nowParts.minute).padStart(2, "0")}`;

    return (
        <div role="table" aria-label="Calendario de citas" aria-busy={isFetching} className={cn(isFetching && "opacity-70 transition-opacity")}>
            <div role="row" className="grid border-b border-line-soft pt-1.5 pb-3.5" style={template}>
                <div role="presentation" />
                {days.map((day) => {
                    const isToday = day === todayKey;
                    return (
                        <div key={day} role="columnheader" aria-label={formatKeyLong(day)} className="flex flex-col items-center gap-1.5">
                            <span className={cn("text-[13.5px] font-bold", isToday ? "text-foreground" : "text-ink-5")}>
                                {formatKeyWeekdayShort(day)}
                            </span>
                            <span
                                className={cn(
                                    "flex size-9 items-center justify-center rounded-[9px] text-[17px] font-extrabold",
                                    isToday ? "bg-primary text-white" : "text-ink-2",
                                )}
                            >
                                {dayNumber(day)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div role="row" className="grid pb-2.5" style={template}>
                <div role="presentation" className="relative">
                    {rows.map((hour) => (
                        <div
                            key={hour}
                            role="rowheader"
                            className="-translate-y-2 pr-3 text-right text-[13px] font-semibold text-ink-5"
                            style={{ height: HOUR_HEIGHT }}
                        >
                            {hour}:00
                        </div>
                    ))}
                    {showNow && (
                        <div
                            aria-hidden="true"
                            className="absolute right-1.5 rounded-[5px] bg-now px-1.5 py-0.5 text-[11px] font-extrabold text-white"
                            style={{ top: nowOffset - 8 }}
                        >
                            {nowText}
                        </div>
                    )}
                </div>

                {days.map((day) => {
                    const events = byDay.get(day) ?? [];
                    const isToday = day === todayKey;

                    return (
                        <div
                            key={day}
                            role="cell"
                            className={cn("relative border-l border-fill", weekdayIndex(day) === 6 && days.length > 1 && "bg-[#fafafa]")}
                            style={{ height: bodyHeight, backgroundImage: ROW_LINES }}
                        >
                            {rows.map((hour) => {
                                const slot = hourLabel(hour);
                                const isPast = clinicDateTimeToDate(day, slot).getTime() + 3_600_000 <= now;
                                if (isPast) return null;
                                return (
                                    <button
                                        key={hour}
                                        type="button"
                                        tabIndex={day === activeDay ? 0 : -1}
                                        onClick={() => onCreate(day, slot)}
                                        aria-label={`Agendar cita el ${formatKeyLong(day)} a las ${slot}`}
                                        className="absolute inset-x-0 flex items-end justify-end p-1 text-brand opacity-0 outline-none transition-opacity hover:bg-brand-soft/60 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
                                        style={{ top: (hour - firstHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                                    >
                                        <Plus className="size-3.5" aria-hidden="true" />
                                    </button>
                                );
                            })}

                            {events.map((appointment) => {
                                const start = clinicHourMinute(appointment.scheduled_at);
                                const hours = appointment.durationMinutes / 60;
                                return (
                                    <CalendarEvent
                                        key={appointment.id}
                                        appointment={appointment}
                                        role={role}
                                        onSelect={onSelect}
                                        showService={hours >= 1}
                                        className="absolute right-[5px] left-[5px] z-10 w-auto"
                                        style={{
                                            top: (start.hour + start.minute / 60 - firstHour) * HOUR_HEIGHT + 2,
                                            height: Math.max(hours * HOUR_HEIGHT - 4, 24),
                                        }}
                                    />
                                );
                            })}

                            {isToday && showNow && (
                                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-now" style={{ top: nowOffset }}>
                                    <span className="absolute -top-[3px] -left-1 size-2 rounded-full bg-now" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

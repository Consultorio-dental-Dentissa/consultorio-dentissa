import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/features/appointments/components/calendar/calendar-event.component";
import { groupByDay } from "@/features/appointments/components/calendar/calendar.utils";
import {
    dayNumber, daysBetween, formatKeyLong, formatKeyWeekdayShort, isSameMonth,
} from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

const MAX_VISIBLE = 3;

interface CalendarMonthViewProps {
    /** Primer y último día de la rejilla (semanas completas, lunes a domingo). */
    gridStart: string;
    gridEnd: string;
    anchor: string;
    todayKey: string;
    appointments: Appointment[];
    role: string;
    isFetching?: boolean;
    onSelect: (appointment: Appointment) => void;
    onOpenDay: (day: string) => void;
}

/** Vista mensual: rejilla de semanas con hasta 3 citas por día y "+N más". */
export function CalendarMonthView({
    gridStart, gridEnd, anchor, todayKey, appointments, role, isFetching, onSelect, onOpenDay,
}: CalendarMonthViewProps) {
    const days = daysBetween(gridStart, gridEnd);
    const byDay = groupByDay(appointments);
    const weekdays = days.slice(0, 7);

    return (
        <div role="table" aria-label="Calendario mensual de citas" aria-busy={isFetching} className={cn(isFetching && "opacity-70 transition-opacity")}>
            <div role="row" className="grid grid-cols-7 border-b border-line-soft">
                {weekdays.map((day) => (
                    <div key={day} role="columnheader" className="border-r border-line-soft py-3 text-center text-[13.5px] font-bold text-ink-5 last:border-r-0">
                        {formatKeyWeekdayShort(day)}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {days.map((day) => {
                    const events = byDay.get(day) ?? [];
                    const inMonth = isSameMonth(day, anchor);
                    const isToday = day === todayKey;

                    return (
                        <div
                            key={day}
                            role="cell"
                            className={cn(
                                "min-h-[72px] border-r border-b border-line-row p-1 sm:min-h-[104px] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                                !inMonth && "bg-surface-muted",
                                
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => onOpenDay(day)}
                                aria-label={`Ver el día ${formatKeyLong(day)}${events.length ? `, ${events.length} citas` : ""}`}
                                className={cn(
                                    "mb-1 flex size-7 items-center justify-center rounded-lg text-[14px] font-extrabold outline-none hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-ring/50",
                                    isToday ? "bg-primary text-white hover:bg-primary" : inMonth ? "text-ink-2" : "text-ink-5",
                                )}
                            >
                                {dayNumber(day)}
                            </button>

                            <div className="hidden flex-col gap-0.5 sm:flex">
                                {events.slice(0, MAX_VISIBLE).map((appointment) => (
                                    <CalendarEvent key={appointment.id} appointment={appointment} role={role} onSelect={onSelect} compact />
                                ))}
                                {events.length > MAX_VISIBLE && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenDay(day)}
                                        className="rounded-md px-1.5 py-0.5 text-left text-xs font-bold text-brand outline-none hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-ring/50"
                                    >
                                        +{events.length - MAX_VISIBLE} más
                                    </button>
                                )}
                            </div>

                            {events.length > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="mx-auto mt-1 block w-fit rounded-full bg-brand-soft px-1.5 text-[10px] font-bold text-brand sm:hidden"
                                >
                                    {events.length}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

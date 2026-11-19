import { CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/features/appointments/components/calendar/calendar-event.component";
import { groupByDay } from "@/features/appointments/components/calendar/calendar.utils";
import { clinicDateTimeToDate, formatKeyLong } from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

interface CalendarAgendaProps {
    days: string[];
    appointments: Appointment[];
    todayKey: string;
    now: number;
    role: string;
    isFetching?: boolean;
    onSelect: (appointment: Appointment) => void;
    onCreate: (day: string, time: string) => void;
}

/** Agenda en lista por día: versión móvil de las vistas diaria y semanal. */
export function CalendarAgenda({ days, appointments, todayKey, now, role, isFetching, onSelect, onCreate }: CalendarAgendaProps) {
    const byDay = groupByDay(appointments);

    return (
        <ol aria-label="Agenda de citas" aria-busy={isFetching} className={cn("flex flex-col", isFetching && "opacity-70 transition-opacity")}>
            {days.map((day) => {
                const events = byDay.get(day) ?? [];
                const isToday = day === todayKey;
                const canCreate = clinicDateTimeToDate(day, "23:59").getTime() > now;

                return (
                    <li key={day} className="border-b border-line-row p-3 last:border-b-0">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h3 className={cn("text-[15px] font-extrabold", isToday && "text-brand")}>
                                {formatKeyLong(day)}{isToday && " · Hoy"}
                            </h3>
                            {canCreate && (
                                <Button variant="outline" size="sm" onClick={() => onCreate(day, "09:00")}>
                                    <CalendarPlus /> Agendar
                                </Button>
                            )}
                        </div>
                        {events.length === 0 ? (
                            <p className="text-sm font-medium text-ink-4">Sin citas este día.</p>
                        ) : (
                            <ul className="flex flex-col gap-1.5">
                                {events.map((appointment) => (
                                    <li key={appointment.id}>
                                        <CalendarEvent appointment={appointment} role={role} onSelect={onSelect} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

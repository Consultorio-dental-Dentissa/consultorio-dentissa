import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    EVENT_STYLES, fullPatientName, groupByDay, miniCalendarRange, timeRange,
} from "@/features/appointments/components/calendar/calendar.utils";
import { Role } from "@/features/users/types/rol.enum";
import {
    dayNumber, daysBetween, formatKeyMonthYear, formatKeyWeekdayLong, isSameMonth,
} from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

const MINI_DOW = ["L", "M", "M", "J", "V", "S", "D"];
const NAV =
    "flex size-[38px] items-center justify-center rounded-lg bg-fill text-ink-3 outline-none transition-colors hover:bg-fill-hover focus-visible:ring-3 focus-visible:ring-ring/50";

interface MiniCalendarProps {
    /** Cualquier día del mes visible. */
    month: string;
    todayKey: string;
    /** Día que se está inspeccionando en el calendario principal. */
    selectedDay: string;
    appointments: Appointment[];
    onPrev: () => void;
    onNext: () => void;
    onSelectDay: (day: string) => void;
}

/** Mini calendario mensual con un punto de color por cita (máx. 3) de Citas.dc.html. */
export function MiniCalendar({ month, todayKey, selectedDay, appointments, onPrev, onNext, onSelectDay }: MiniCalendarProps) {
    const range = miniCalendarRange(month);
    const days = daysBetween(range.from, range.to);
    const byDay = groupByDay(appointments);

    return (
        <section aria-label="Mini calendario">
            <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold" aria-live="polite">{formatKeyMonthYear(month)}</h2>
                <div className="flex gap-1.5">
                    <button type="button" onClick={onPrev} aria-label="Mes anterior" className={NAV}>
                        <ChevronLeft className="size-[17px] stroke-[2.3]" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={onNext} aria-label="Mes siguiente" className={NAV}>
                        <ChevronRight className="size-[17px] stroke-[2.3]" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className="mt-3.5 grid grid-cols-7 gap-y-1">
                {MINI_DOW.map((letter, index) => (
                    <div key={index} aria-hidden="true" className="pb-1.5 text-center text-[12.5px] font-bold text-ink-5">{letter}</div>
                ))}
                {days.map((day) => {
                    const inMonth = isSameMonth(day, month);
                    const isToday = day === todayKey;
                    const isSelected = day === selectedDay;
                    const events = byDay.get(day) ?? [];
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onSelectDay(day)}
                            aria-label={`${dayNumber(day)} de ${formatKeyMonthYear(day).toLowerCase()}${events.length ? `, ${events.length} ${events.length === 1 ? "cita" : "citas"}` : ""}`}
                            aria-current={isToday ? "date" : undefined}
                            aria-pressed={isSelected}
                            className="flex h-[42px] flex-col items-center gap-[3px] rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <span
                                className={cn(
                                    "flex size-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-fill",
                                    isToday ? "bg-primary font-extrabold text-white hover:bg-primary" : inMonth ? "font-bold text-ink-2" : "font-semibold text-[#c8ccd2]",
                                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                                    isSelected && !isToday && "bg-brand-soft text-brand",
                                )}
                            >
                                {dayNumber(day)}
                            </span>
                            <span className="flex gap-[3px]" aria-hidden="true">
                                {inMonth && events.slice(0, 3).map((appointment) => (
                                    <span key={appointment.id} className={cn("size-[5px] rounded-full", EVENT_STYLES[appointment.status]?.solid ?? "bg-ink-4")} />
                                ))}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

interface TodayListProps {
    todayKey: string;
    role: string;
    appointments: Appointment[];
    isLoading: boolean;
    error?: string | null;
    onRetry: () => void;
    onSelect: (appointment: Appointment) => void;
    onViewAll: () => void;
}

/** "Citas de hoy": tarjetas por estado con paciente, servicio y horario. */
export function TodayList({ todayKey, role, appointments, isLoading, error, onRetry, onSelect, onViewAll }: TodayListProps) {
    const isPatient = role === Role.PACIENTE;
    const sorted = [...appointments].sort((a, b) => a.scheduled_at.getTime() - b.scheduled_at.getTime());
    const dateLabel = `${formatKeyWeekdayLong(todayKey)} ${dayNumber(todayKey)} de ${formatKeyMonthYear(todayKey).split(" ")[0].toLowerCase()}`;

    return (
        <section aria-label="Citas de hoy" className="flex min-h-0 flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold">Citas de hoy</h2>
                <button type="button" onClick={onViewAll} className="rounded text-sm font-bold text-brand outline-none hover:text-brand-hover focus-visible:ring-3 focus-visible:ring-ring/50">
                    Ver todas
                </button>
            </div>
            <p className="-mt-1.5 text-sm font-semibold text-ink-4">
                {dateLabel}{!isLoading && !error && ` · ${sorted.length} ${sorted.length === 1 ? "cita" : "citas"}`}
            </p>

            {isLoading ? (
                <div className="flex flex-col gap-3" aria-busy="true" role="status">
                    <span className="sr-only">Cargando citas de hoy...</span>
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[60px] w-full rounded-[10px]" />)}
                </div>
            ) : error ? (
                <div role="alert" className="rounded-[10px] border border-line bg-surface-muted p-3 text-xs font-semibold text-muted-foreground">
                    No pudimos cargar las citas de hoy: {error}{" "}
                    <button type="button" onClick={onRetry} className="font-bold text-brand underline-offset-2 hover:underline">Reintentar</button>
                </div>
            ) : sorted.length === 0 ? (
                <p role="status" className="rounded-[10px] border border-dashed border-line px-3 py-5 text-center text-xs font-semibold text-ink-4">
                    No hay citas programadas para hoy.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {sorted.map((appointment) => {
                        const colors = EVENT_STYLES[appointment.status] ?? EVENT_STYLES.PENDIENTE;
                        const title = isPatient ? appointment.service.name : fullPatientName(appointment);
                        return (
                            <li key={appointment.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(appointment)}
                                    aria-label={`${title}, ${appointment.service.name}, ${timeRange(appointment)}, ${appointment.status.toLowerCase()}`}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left outline-none transition-shadow hover:shadow-[0_6px_16px_-10px_rgba(0,0,0,.3)] focus-visible:ring-3 focus-visible:ring-ring/50",
                                        colors.box,
                                    )}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-[14.5px] font-extrabold text-foreground">{title}</span>
                                            <span className={cn("shrink-0 text-[13px] font-bold", colors.text)}>{timeRange(appointment)}</span>
                                        </span>
                                        {!isPatient && (
                                            <span className={cn("mt-[3px] block truncate text-[13.5px] font-semibold", colors.text)}>{appointment.service.name}</span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

import { useMemo } from "react";
import { Clock, Lock } from "lucide-react";
import { Alert } from "@/components/shared/alert.component";
import { DateBlock } from "@/components/shared/date-block.component";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Pagination } from "@/components/shared/pagination.component";
import { SectionLabel } from "@/components/shared/section-label.component";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { timeRange } from "@/features/appointments/components/calendar/calendar.utils";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Role } from "@/features/users/types/rol.enum";
import { usePagination } from "@/hooks/use-pagination";
import { addDays, clinicDayKey, formatKeyShort, formatKeyWeekdayLong } from "@/utils/clinic-time";
import type { Appointment } from "@/features/appointments/types/appointment.model";

const UPCOMING_LIMIT = 50;
const ACTIVE: string[] = [STATUS_APPOINTMENT.PENDIENTE, STATUS_APPOINTMENT.CONFIRMADA, STATUS_APPOINTMENT.REPROGRAMADA];

interface MyAppointmentsListProps {
    todayKey: string;
    /** Instante actual (ms) de `useNow`. */
    now: number;
    onOpen: (appointment: Appointment) => void;
}

function AppointmentRow({ appointment, now, tone, onOpen }: { appointment: Appointment; now: number; tone: "brand" | "muted"; onOpen: (a: Appointment) => void }) {
    const key = clinicDayKey(appointment.scheduled_at);
    const [day, month] = formatKeyShort(key).split(" ");
    const actions = getAppointmentActions(Role.PACIENTE, appointment, new Date(now));
    const canModify = actions.cancel || actions.reschedule || actions.edit;
    const locked = !canModify && ACTIVE.includes(appointment.status);

    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line-row px-6 py-4 last:border-b-0 md:grid md:grid-cols-[56px_minmax(0,1fr)_200px_130px_150px] md:gap-x-6">
            <DateBlock day={day.padStart(2, "0")} month={month} tone={tone} />
            <div className="min-w-0 flex-1 md:flex-none">
                <p className="truncate text-[15.5px] font-extrabold">{appointment.service.name}</p>
                <p className="text-sm text-ink-4">{formatKeyWeekdayLong(key)}</p>
            </div>
            <p className="flex items-center gap-2 text-[15px] text-ink-2">
                <Clock className="size-4 text-ink-5" aria-hidden="true" />
                {timeRange(appointment)}
            </p>
            <div><AppointmentStatusBadge status={appointment.status} /></div>
            <div className="flex md:justify-end">
                {canModify ? (
                    <Button variant="outline" size="sm" onClick={() => onOpen(appointment)} aria-label={`Modificar cita de ${appointment.service.name}`}>
                        Modificar
                    </Button>
                ) : locked ? (
                    <span className="inline-flex items-center gap-2 text-[14.5px] text-ink-4">
                        <Lock className="size-4 text-ink-5" aria-hidden="true" /> No modificable
                    </span>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => onOpen(appointment)} aria-label={`Ver cita de ${appointment.service.name}`}>
                        Ver
                    </Button>
                )}
            </div>
        </li>
    );
}

function ListSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-6" aria-busy="true" role="status">
            <span className="sr-only">Cargando citas...</span>
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
    );
}

/** Vista de "Mis citas" de Paciente - Mis citas.dc.html: próximas citas e historial (datos de GET /appointments). */
export function MyAppointmentsList({ todayKey, now, onOpen }: MyAppointmentsListProps) {
    const history = usePagination();
    const upcomingQuery = useAppointments({ from: todayKey, sort: "asc", limit: UPCOMING_LIMIT });
    const historyQuery = useAppointments({ to: addDays(todayKey, -1), sort: "desc", page: history.page, limit: history.limit });

    // Próximas: citas abiertas que aún no terminan. El resto de las de hoy en adelante (canceladas, completadas) va al historial.
    const { upcoming, rest } = useMemo(() => {
        const items = upcomingQuery.data?.items ?? [];
        const isUpcoming = (a: Appointment) => ACTIVE.includes(a.status) && a.scheduled_at_end.getTime() >= now;
        return { upcoming: items.filter(isUpcoming), rest: items.filter((a) => !isUpcoming(a)).reverse() };
    }, [upcomingQuery.data, now]);

    // Las canceladas/completadas de hoy en adelante van en un bloque aparte (fuera de la paginación) para que el
    // total y las páginas del historial paginado cuadren con lo que se muestra.
    const recent = rest;
    const pastItems = historyQuery.data?.items ?? [];
    const card = "overflow-hidden rounded-[10px] border border-line bg-surface";

    return (
        <div className="flex flex-col gap-6">
            <Alert variant="info">
                Puedes modificar o cancelar tus citas mientras estén <strong>pendientes</strong>. Una vez que la clínica las confirma, ya no pueden modificarse.
            </Alert>

            <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3.5">
                <SectionLabel><span id="upcoming-heading">Próximas citas</span></SectionLabel>
                <div className={card}>
                    {upcomingQuery.isPending ? (
                        <ListSkeleton />
                    ) : upcomingQuery.isError ? (
                        <ErrorState message={upcomingQuery.error.message} onRetry={() => upcomingQuery.refetch()} />
                    ) : upcoming.length === 0 ? (
                        <EmptyState title="No tienes citas próximas" description="Pulsa «Agendar cita» para reservar tu siguiente visita." />
                    ) : (
                        <ul aria-label="Próximas citas">
                            {upcoming.map((a) => <AppointmentRow key={a.id} appointment={a} now={now} tone="brand" onOpen={onOpen} />)}
                        </ul>
                    )}
                </div>
                {upcomingQuery.data && upcomingQuery.data.total > UPCOMING_LIMIT && (
                    <p role="status" className="text-sm text-ink-4">
                        Se muestran las primeras {UPCOMING_LIMIT} citas desde hoy; usa la vista de calendario para ver el resto.
                    </p>
                )}
            </section>

            <section aria-labelledby="history-heading" className="flex flex-col gap-3.5">
                <SectionLabel><span id="history-heading">Historial</span></SectionLabel>
                <div className={card}>
                    {historyQuery.isPending ? (
                        <ListSkeleton />
                    ) : historyQuery.isError ? (
                        <ErrorState message={historyQuery.error.message} onRetry={() => historyQuery.refetch()} />
                    ) : recent.length === 0 && pastItems.length === 0 ? (
                        <EmptyState title="Aún no tienes citas pasadas" description="Aquí aparecerá el historial de tus citas." />
                    ) : (
                        <>
                            {recent.length > 0 && (
                                <div>
                                    <h3 className="border-b border-line-row bg-[#fafafa] px-6 py-2.5 text-[13px] font-bold text-ink-4">
                                        Canceladas o completadas recientes
                                    </h3>
                                    <ul aria-label="Canceladas o completadas recientes">
                                        {recent.map((a) => <AppointmentRow key={a.id} appointment={a} now={now} tone="muted" onOpen={onOpen} />)}
                                    </ul>
                                </div>
                            )}
                            {pastItems.length > 0 && (
                                <div>
                                    {recent.length > 0 && (
                                        <h3 className="border-y border-line-row bg-[#fafafa] px-6 py-2.5 text-[13px] font-bold text-ink-4">
                                            Citas anteriores
                                        </h3>
                                    )}
                                    <ul aria-label="Historial de citas">
                                        {pastItems.map((a) => <AppointmentRow key={a.id} appointment={a} now={now} tone="muted" onOpen={onOpen} />)}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                    {historyQuery.data && (
                        <Pagination
                            page={history.page} limit={history.limit} total={historyQuery.data.total}
                            onPageChange={history.setPage} disabled={historyQuery.isFetching} noun="citas"
                        />
                    )}
                </div>
            </section>
        </div>
    );
}

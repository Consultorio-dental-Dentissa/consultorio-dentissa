import { useMemo, useState } from "react";
import { CalendarDays, CalendarX, List } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { DateFilter } from "@/components/shared/date-filter.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
    useAppointments, useAppointmentsRange, useCompleteAppointment, useConfirmAppointment,
} from "@/features/appointments/hooks/use-appointments";
import { AppointmentCard } from "@/features/appointments/components/appointment-card.component";
import { getAppointmentColumns } from "@/features/appointments/components/appointments-columns.component";
import { CreateAppointmentModal } from "@/features/appointments/components/create-appointment-modal.component";
import { CancelAppointmentModal } from "@/features/appointments/components/cancel-appointment-modal.component";
import { EditAppointmentModal } from "@/features/appointments/components/edit-appointment-modal.component";
import { RescheduleAppointmentModal } from "@/features/appointments/components/reschedule-appointment-modal.component";
import { AppointmentDetailModal } from "@/features/appointments/components/appointment-detail-modal.component";
import { MyAppointmentsList } from "@/features/appointments/components/my-appointments-list.component";
import { CalendarToolbar } from "@/features/appointments/components/calendar/calendar-toolbar.component";
import { MiniCalendar, TodayList } from "@/features/appointments/components/calendar/calendar-side-panel.component";
import { CalendarTimeGrid } from "@/features/appointments/components/calendar/calendar-time-grid.component";
import { CalendarMonthView } from "@/features/appointments/components/calendar/calendar-month-view.component";
import { CalendarAgenda } from "@/features/appointments/components/calendar/calendar-agenda.component";
import { miniCalendarRange, type CalendarView } from "@/features/appointments/components/calendar/calendar.utils";
import { CreateConsultationModal, type ConsultationAppointment } from "@/features/consultations/components/create-consultation-modal.component";
import { ConsultationDetailModal } from "@/features/consultations/components/consultation-detail-modal.component";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Role } from "@/features/users/types/rol.enum";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNow } from "@/hooks/use-now";
import { usePagination } from "@/hooks/use-pagination";
import {
    addDays, addMonths, clinicDateTimeToDate, clinicTodayKey, daysBetween, endOfMonth,
    formatClinicShortDate, startOfMonth, startOfWeek,
} from "@/utils/clinic-time";
import type { Appointment, AppointmentDetail } from "@/features/appointments/types/appointment.model";

const STATUS_OPTIONS = [
    { data: "Todos", value: "TODOS" },
    { data: "Pendientes", value: STATUS_APPOINTMENT.PENDIENTE },
    { data: "Confirmadas", value: STATUS_APPOINTMENT.CONFIRMADA },
    { data: "Completadas", value: STATUS_APPOINTMENT.COMPLETADA },
    { data: "Canceladas", value: STATUS_APPOINTMENT.CANCELADA },
    { data: "Reprogramadas", value: STATUS_APPOINTMENT.REPROGRAMADA },
];

type Transition = { type: "confirm" | "complete"; appointment: Appointment };
type Layout = "calendar" | "list" | "cards";

/** Rango de días (zona del consultorio) que carga cada vista. El mes incluye semanas completas. */
function rangeFor(view: CalendarView, anchor: string) {
    if (view === "day") return { from: anchor, to: anchor };
    if (view === "month") {
        return { from: startOfWeek(startOfMonth(anchor)), to: addDays(startOfWeek(endOfMonth(anchor)), 6) };
    }
    const from = startOfWeek(anchor);
    return { from, to: addDays(from, 6) };
}

function CalendarSkeleton() {
    return (
        <div className="flex flex-col gap-px p-3" aria-busy="true" role="status">
            <span className="sr-only">Cargando citas...</span>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
    );
}

export default function AppointmentsPage() {
    const { user } = useAuth();
    const role = user?.role ?? "";
    const isPatient = role === Role.PACIENTE;
    const isMobile = useIsMobile();

    const [view, setView] = useState<CalendarView>("week");
    // Personal: calendario o lista. Paciente: "Mis citas" (próximas e historial, como la maqueta) o calendario.
    const [layout, setLayout] = useState<Layout>(isPatient ? "cards" : "calendar");
    const isList = layout === "list";
    const isCards = layout === "cards";
    const isCalendar = layout === "calendar";
    const [anchor, setAnchor] = useState(() => clinicTodayKey());
    // Mes que muestra el mini calendario del panel derecho (sigue al calendario principal al navegar).
    const [miniMonth, setMiniMonth] = useState(() => startOfMonth(clinicTodayKey()));
    const now = useNow();
    const todayKey = clinicTodayKey(new Date(now));

    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    // Rango de fechas: solo aplica a la lista (el calendario ya navega por fecha).
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const { page, limit, setPage, resetPage } = usePagination();

    const [createSlot, setCreateSlot] = useState<{ date?: string; time?: string } | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    const [toCancel, setToCancel] = useState<Appointment | null>(null);
    const [toReschedule, setToReschedule] = useState<Appointment | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [transition, setTransition] = useState<Transition | null>(null);
    const [consultationFor, setConsultationFor] = useState<ConsultationAppointment | null>(null);
    const [consultationId, setConsultationId] = useState<number | null>(null);

    const range = useMemo(() => rangeFor(view, anchor), [view, anchor]);
    // Estado y búsqueda se comparten entre calendario y lista.
    const sharedFilters = useMemo(() => ({ status, search: debouncedSearch }), [status, debouncedSearch]);
    const rangeQuery = useAppointmentsRange(range.from, range.to, sharedFilters, isCalendar);
    const listQuery = useAppointments(
        { page, limit, ...sharedFilters, from: from || undefined, to: to || undefined },
        isList,
    );
    const miniRange = useMemo(() => miniCalendarRange(miniMonth), [miniMonth]);
    const miniQuery = useAppointmentsRange(miniRange.from, miniRange.to, undefined, isCalendar);
    const todayQuery = useAppointmentsRange(todayKey, todayKey, undefined, !isCards);

    // Tarjetas de resumen (solo personal): totales reales del servidor leyendo `total`, sin cargar las citas.
    const weekStart = startOfWeek(todayKey);
    const weekEnd = addDays(weekStart, 6);
    const confirmedWeek = useAppointments({ limit: 1, status: STATUS_APPOINTMENT.CONFIRMADA, from: weekStart, to: weekEnd }, !isPatient);
    const pendingAll = useAppointments({ limit: 1, status: STATUS_APPOINTMENT.PENDIENTE }, !isPatient);
    const canceledWeek = useAppointments({ limit: 1, status: STATUS_APPOINTMENT.CANCELADA, from: weekStart, to: weekEnd }, !isPatient);

    const confirmMutation = useConfirmAppointment();
    const completeMutation = useCompleteAppointment();

    const handlers = useMemo(
        () => ({
            role,
            now,
            onView: (appointment: Appointment) => setDetailId(appointment.id),
            onConfirm: (appointment: Appointment) => setTransition({ type: "confirm", appointment }),
            onComplete: (appointment: Appointment) => setTransition({ type: "complete", appointment }),
            onCancel: setToCancel,
            onReschedule: setToReschedule,
            onEdit: (appointment: Appointment) => setEditId(appointment.id),
        }),
        [role, now],
    );
    const columns = useMemo(() => getAppointmentColumns(handlers), [handlers]);

    const runTransition = () => {
        if (!transition) return;
        const { type, appointment } = transition;
        const mutation = type === "confirm" ? confirmMutation : completeMutation;

        mutation.mutate(appointment.id, {
            onSuccess: () => {
                toast.success(type === "confirm" ? "Cita confirmada" : "Cita marcada como completada");
                setTransition(null);
                // Al completar se abre el perfil de la cita para poder registrar la consulta.
                if (type === "complete") setDetailId(appointment.id);
            },
            onError: (error) => {
                toast.error(error.message);
                setTransition(null);
            },
        });
    };

    // --- Navegación del calendario ---
    const goTo = (day: string) => {
        setAnchor(day);
        setMiniMonth(startOfMonth(day));
    };

    const step = (direction: 1 | -1) =>
        goTo(view === "month" ? addMonths(anchor, direction) : addDays(anchor, direction * (view === "day" ? 1 : 7)));

    const openDay = (day: string) => {
        goTo(day);
        setView("day");
    };

    const showTodayList = () => {
        setStatus("TODOS");
        setSearch("");
        setFrom(todayKey);
        setTo(todayKey);
        resetPage();
        setLayout(isPatient ? "cards" : "list");
    };

    // Un detalle abierto se cierra antes de pasar a otro diálogo (cancelar, reprogramar...).
    const fromDetail = <T,>(open: (value: T) => void) => (value: T) => {
        setDetailId(null);
        open(value);
    };

    const appointments = rangeQuery.data?.items ?? [];
    const days = daysBetween(range.from, range.to);
    const useAgenda = isMobile && view !== "month";
    const hasFilters = status !== "TODOS" || debouncedSearch !== "";
    const hasListFilters = hasFilters || from !== "" || to !== "";
    const slotInPast = (date: string, time: string) => clinicDateTimeToDate(date, time).getTime() <= Date.now();

    const createFromSlot = (date: string, time: string) => {
        if (slotInPast(date, time)) {
            toast.error("No puedes agendar una cita en un horario que ya pasó.");
            return;
        }
        setCreateSlot({ date, time });
    };

    const toggleLayout = () => {
        if (isPatient) setLayout(isCards ? "calendar" : "cards");
        else setLayout(isList ? "calendar" : "list");
    };
    const toggleLabel = isPatient
        ? (isCards ? "Ver calendario" : "Ver mis citas")
        : (isList ? "Ver calendario" : "Ver como lista");

    const searchField = (
        <SearchInput
            label="Buscar citas"
            placeholder={isPatient ? "Buscar por servicio" : "Buscar por paciente o servicio"}
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
        />
    );
    const statusField = (
        <FilterSelect label="Estatus" value={status} options={STATUS_OPTIONS} onChange={(value) => { setStatus(value); resetPage(); }} />
    );

    return (
        <>
            <PageHeader
                title={isPatient ? "Mis citas" : "Citas"}
                actions={
                    <>
                        {/* En el calendario el encabezado queda como la maqueta (mes, navegación, estatus, vista): la búsqueda vive aquí. */}
                        {isCalendar && <div className="w-full sm:w-[300px]">{searchField}</div>}
                        <Button variant="outline" onClick={toggleLayout}>
                            {(isPatient ? isCards : !isList) ? <CalendarDays /> : <List />} {toggleLabel}
                        </Button>
                        <Button onClick={() => setCreateSlot({ date: !isCalendar || anchor < todayKey ? undefined : anchor })}>
                            + Agendar cita
                        </Button>
                    </>
                }
            />

            {!isPatient && (
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                    <StatCard title="Citas de hoy" tone="brand" value={todayQuery.data?.total} isLoading={todayQuery.isPending} />
                    <StatCard title="Confirmadas esta semana" value={confirmedWeek.data?.total} isLoading={confirmedWeek.isPending} />
                    <StatCard title="Pendientes" value={pendingAll.data?.total} isLoading={pendingAll.isPending} />
                    <StatCard title="Canceladas esta semana" value={canceledWeek.data?.total} isLoading={canceledWeek.isPending} />
                </div>
            )}

            {isCards && <MyAppointmentsList todayKey={todayKey} now={now} onOpen={handlers.onView} />}

            {isList && (
                <TableCard>
                    <TableToolbar count={`${listQuery.data?.total ?? 0} citas`}>
                        {searchField}
                        {statusField}
                        <DateFilter label="Desde" value={from} max={to || undefined} onChange={(value) => { setFrom(value); resetPage(); }} />
                        <DateFilter label="Hasta" value={to} min={from || undefined} onChange={(value) => { setTo(value); resetPage(); }} />
                    </TableToolbar>
                    <DataTable
                        caption={isPatient ? "Mis citas" : "Listado de citas"}
                        columns={columns}
                        mobileCard={(appointment) => <AppointmentCard appointment={appointment} {...handlers} />}
                        data={listQuery.data?.items ?? []}
                        isLoading={listQuery.isPending}
                        isFetching={listQuery.isFetching}
                        error={listQuery.isError ? listQuery.error.message : null}
                        onRetry={() => listQuery.refetch()}
                        emptyIcon={CalendarX}
                        emptyTitle={hasListFilters ? "No hay citas con esos filtros" : "Aún no hay citas"}
                        emptyDescription={
                            hasListFilters
                                ? "Prueba cambiando el estado, las fechas o el texto de búsqueda."
                                : "Cuando se agende una cita aparecerá aquí."
                        }
                        pagination={{ page, limit, total: listQuery.data?.total ?? 0, onPageChange: setPage, noun: "citas" }}
                    />
                </TableCard>
            )}

            {isCalendar && (
                <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface lg:flex-row">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <CalendarToolbar
                            view={view}
                            anchor={anchor}
                            onViewChange={setView}
                            onPrev={() => step(-1)}
                            onNext={() => step(1)}
                            onToday={() => goTo(todayKey)}
                            filters={statusField}
                        />

                        {rangeQuery.isPending ? (
                            <CalendarSkeleton />
                        ) : rangeQuery.isError ? (
                            <ErrorState message={rangeQuery.error.message} onRetry={() => rangeQuery.refetch()} />
                        ) : (
                            <>
                                {rangeQuery.data?.truncated && (
                                    <p role="alert" className="mx-4 mb-2 rounded-lg bg-warning-soft px-3 py-2.5 text-sm font-semibold text-warning sm:mx-6">
                                        Este periodo tiene {rangeQuery.data.total} citas y solo se muestran las primeras {appointments.length}.
                                        Afina la búsqueda o el estado, o usa la vista de lista.
                                    </p>
                                )}
                                {appointments.length === 0 && (
                                    <p role="status" className="mx-4 mb-2 rounded-lg bg-surface-muted px-3 py-2.5 text-sm font-semibold text-muted-foreground sm:mx-6">
                                        {hasFilters ? "No hay citas con esos filtros en este periodo" : "No hay citas en este periodo"}{!isMobile && ". Pulsa un hueco libre del calendario para agendar una"}.
                                    </p>
                                )}
                                {useAgenda ? (
                                    <CalendarAgenda
                                        days={days} appointments={appointments} todayKey={todayKey} now={now} role={role}
                                        isFetching={rangeQuery.isFetching} onSelect={handlers.onView} onCreate={createFromSlot}
                                    />
                                ) : view === "month" ? (
                                    <CalendarMonthView
                                        gridStart={range.from} gridEnd={range.to} anchor={anchor} todayKey={todayKey}
                                        appointments={appointments} role={role} isFetching={rangeQuery.isFetching}
                                        onSelect={handlers.onView} onOpenDay={openDay}
                                    />
                                ) : (
                                    <CalendarTimeGrid
                                        days={days} appointments={appointments} todayKey={todayKey} now={now} role={role}
                                        isFetching={rangeQuery.isFetching} onSelect={handlers.onView} onCreate={createFromSlot}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <aside className="flex w-full flex-none flex-col gap-[22px] border-t border-line-soft p-[22px] lg:w-[340px] lg:border-t-0 lg:border-l">
                        <MiniCalendar
                            month={miniMonth}
                            todayKey={todayKey}
                            selectedDay={anchor}
                            appointments={miniQuery.data?.items ?? []}
                            onPrev={() => setMiniMonth((month) => addMonths(month, -1))}
                            onNext={() => setMiniMonth((month) => addMonths(month, 1))}
                            onSelectDay={goTo}
                        />
                        <div className="h-px bg-line-soft" />
                        <TodayList
                            todayKey={todayKey}
                            role={role}
                            appointments={todayQuery.data?.items ?? []}
                            isLoading={todayQuery.isPending}
                            error={todayQuery.isError ? todayQuery.error.message : null}
                            onRetry={() => todayQuery.refetch()}
                            onSelect={handlers.onView}
                            onViewAll={showTodayList}
                        />
                    </aside>
                </div>
            )}

            <CreateAppointmentModal
                open={createSlot !== null}
                onOpenChange={(open) => !open && setCreateSlot(null)}
                canPickPatient={!isPatient}
                defaultDate={createSlot?.date}
                defaultTime={createSlot?.time}
            />

            <AppointmentDetailModal
                appointmentId={detailId}
                role={role}
                onClose={() => setDetailId(null)}
                onConfirm={fromDetail<AppointmentDetail>((a) => setTransition({ type: "confirm", appointment: a }))}
                onComplete={fromDetail<AppointmentDetail>((a) => setTransition({ type: "complete", appointment: a }))}
                onCancel={fromDetail<AppointmentDetail>(setToCancel)}
                onReschedule={fromDetail<AppointmentDetail>(setToReschedule)}
                onEdit={fromDetail<AppointmentDetail>((a) => setEditId(a.id))}
                onRegisterConsultation={fromDetail<AppointmentDetail>((a) =>
                    setConsultationFor({
                        id: a.id,
                        label: `${a.patient.name} ${a.patient.lastname} · ${a.service.name} · ${formatClinicShortDate(a.scheduled_at)}`,
                    }),
                )}
                onViewConsultation={fromDetail<number>(setConsultationId)}
            />
            <CancelAppointmentModal appointment={toCancel} onClose={() => setToCancel(null)} />
            <EditAppointmentModal
                appointmentId={editId}
                role={role}
                onClose={() => setEditId(null)}
                onComplete={(a) => {
                    setEditId(null);
                    setTransition({ type: "complete", appointment: a });
                }}
            />
            <RescheduleAppointmentModal appointment={toReschedule} onClose={() => setToReschedule(null)} />

            <CreateConsultationModal
                open={consultationFor !== null}
                onOpenChange={(open) => !open && setConsultationFor(null)}
                appointment={consultationFor ?? undefined}
            />
            <ConsultationDetailModal consultationId={consultationId} onClose={() => setConsultationId(null)} />

            <ConfirmDialog
                open={transition !== null}
                onOpenChange={(open) => !open && setTransition(null)}
                title={transition?.type === "confirm" ? "¿Confirmar esta cita?" : "¿Marcar como completada?"}
                description={
                    transition?.type === "confirm"
                        ? "Se notificará al paciente que su cita fue confirmada."
                        : "La cita pasará a completada y ya no podrá modificarse."
                }
                confirmLabel={transition?.type === "confirm" ? "Confirmar cita" : "Marcar completada"}
                loading={confirmMutation.isPending || completeMutation.isPending}
                onConfirm={runTransition}
            />
        </>
    );
}

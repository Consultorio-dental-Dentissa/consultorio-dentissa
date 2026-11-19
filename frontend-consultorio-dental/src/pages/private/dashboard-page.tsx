import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, CalendarX, RotateCcw, User } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard";
import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import { useAuditLogs } from "@/features/audit/hooks/use-audit";
import { auditActionLabel } from "@/features/audit/types/audit.labels";
import { useAppointments, useAppointmentsRange, useConfirmAppointment } from "@/features/appointments/hooks/use-appointments";
import { CreateAppointmentModal } from "@/features/appointments/components/create-appointment-modal.component";
import { shortTime } from "@/features/appointments/components/calendar/calendar.utils";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Role } from "@/features/users/types/rol.enum";
import { useNow } from "@/hooks/use-now";
import { clinicHourMinute, clinicTodayKey, formatKeyLong, formatRelative, startOfMonth } from "@/utils/clinic-time";
import { formatDateTime } from "@/utils/formatters";
import type { Appointment } from "@/features/appointments/types/appointment.model";

const CARD = "overflow-hidden rounded-xl border border-line bg-surface";
const CARD_HEAD = "flex items-center justify-between border-b border-line-soft px-6 py-[18px]";
const CARD_LINK = "text-[14.5px] font-bold text-brand outline-none hover:text-brand-hover focus-visible:ring-3 focus-visible:ring-ring/50 rounded";

/** Barra lateral de cada fila de la agenda (colores de Panel.dc.html). "En curso" se deriva de la hora. */
const BAR: Record<string, string> = {
    [STATUS_APPOINTMENT.PENDIENTE]: "bg-neutral-dot",
    [STATUS_APPOINTMENT.COMPLETADA]: "bg-[#93b4f5]",
    [STATUS_APPOINTMENT.CONFIRMADA]: "bg-[#86d9a6]",
    [STATUS_APPOINTMENT.REPROGRAMADA]: "bg-warning-dot",
    [STATUS_APPOINTMENT.CANCELADA]: "bg-danger-dot",
};

function greeting(now: number): string {
    const { hour } = clinicHourMinute(new Date(now));
    return hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
}

/** Icono de la actividad reciente según la acción auditada. */
function ActivityIcon({ action }: { action: string }) {
    const cancelled = action.includes("CANCEL");
    const rescheduled = action.includes("RESCHEDULE");
    const user = action.startsWith("USER") || action.startsWith("PASSWORD");
    const Icon = cancelled ? CalendarX : rescheduled ? RotateCcw : user ? User : Calendar;
    const tone = cancelled ? "bg-danger-soft text-destructive" : rescheduled ? "bg-warning-soft text-warning" : user ? "bg-brand-soft text-brand" : "bg-info-soft text-info";
    return (
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden="true">
            <Icon className="size-[17px]" strokeWidth={1.9} />
        </span>
    );
}

/** Panel (solo ADMIN): agregados de GET /dashboard/stats, agenda de hoy, citas por confirmar y actividad reciente. */
export default function DashboardPage() {
    const { user } = useAuth();
    const now = useNow();
    const today = clinicTodayKey(new Date(now));
    const stats = useDashboardStats();
    const monthConsultations = useConsultations({ limit: 1, from: startOfMonth(today) });
    const allConsultations = useConsultations({ limit: 1 });
    const agenda = useAppointmentsRange(today, today);
    // GET /appointments solo acepta UN estatus, por lo que "Por confirmar" cuenta PENDIENTE; las citas REPROGRAMADA
    // heredadas (confirmables) no se incluyen hasta que el backend admita varios estatus.
    const toConfirm = useAppointments({ status: STATUS_APPOINTMENT.PENDIENTE, from: today, sort: "asc", limit: 5 });
    const activity = useAuditLogs({ limit: 5 });
    const confirmMutation = useConfirmAppointment();

    const [createOpen, setCreateOpen] = useState(false);
    const [confirming, setConfirming] = useState<Appointment | null>(null);

    const data = stats.data;
    const todayByStatus = data?.today.byStatus;
    const agendaItems = agenda.data?.items;

    // "En curso": cita CONFIRMADA cuyo horario contiene la hora actual (el backend no tiene ese estado).
    const isInProgress = (a: Appointment) =>
        a.status === STATUS_APPOINTMENT.CONFIRMADA && a.scheduled_at.getTime() <= now && now < a.scheduled_at_end.getTime();
    const inProgressCount = useMemo(() => (agendaItems ?? []).filter(isInProgress).length, [agendaItems, now]); // eslint-disable-line react-hooks/exhaustive-deps

    const runConfirm = () => {
        if (!confirming) return;
        confirmMutation.mutate(confirming.id, {
            onSuccess: () => {
                toast.success("Cita confirmada");
                setConfirming(null);
            },
            onError: (error) => {
                toast.error(error.message);
                setConfirming(null);
            },
        });
    };

    return (
        <>
            <PageHeader
                title={`${greeting(now)}${user?.name ? `, ${user.name}` : ""}`}
                description={formatKeyLong(today)}
                actions={<Button onClick={() => setCreateOpen(true)}>+ Agendar cita</Button>}
            />

            <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                <StatCard
                    variant="panel" title="Citas de hoy" value={data?.today.total} isLoading={stats.isPending}
                    hint={todayByStatus ? `${todayByStatus.COMPLETADA} ${todayByStatus.COMPLETADA === 1 ? "completada" : "completadas"}${inProgressCount ? `, ${inProgressCount} en curso` : ""}` : undefined}
                />
                <StatCard
                    variant="panel" tone="brand" title="Por confirmar" value={toConfirm.data?.total} isLoading={toConfirm.isPending}
                    hint="Requieren tu revisión"
                />
                <StatCard
                    variant="panel" title="Pacientes activos" value={data?.patients.active} isLoading={stats.isPending}
                    hint={data ? `de ${data.patients.total} registrados` : undefined}
                />
                <StatCard
                    variant="panel" title="Consultas del mes" value={monthConsultations.data?.total} isLoading={monthConsultations.isPending}
                    hint={allConsultations.data ? `${allConsultations.data.total} en total` : undefined}
                />
            </div>

            {stats.isError && (
                <div className={CARD}><ErrorState message={stats.error.message} onRetry={() => stats.refetch()} /></div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
                <section aria-labelledby="agenda-title" className={CARD}>
                    <div className={CARD_HEAD}>
                        <h2 id="agenda-title" className="text-[17px] font-extrabold">Agenda de hoy</h2>
                        <Link to="/citas" className={CARD_LINK}>Ver calendario</Link>
                    </div>

                    {agenda.isPending ? (
                        <div className="flex flex-col gap-3 p-6" aria-busy="true" role="status">
                            <span className="sr-only">Cargando agenda...</span>
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
                        </div>
                    ) : agenda.isError ? (
                        <ErrorState message={agenda.error.message} onRetry={() => agenda.refetch()} />
                    ) : agenda.data.items.length === 0 ? (
                        <EmptyState title="Sin citas para hoy" description="Cuando se agende una cita para hoy aparecerá aquí." />
                    ) : (
                        <ul aria-label="Citas de hoy">
                            {agenda.data.items.map((a) => {
                                const live = isInProgress(a);
                                return (
                                    <li
                                        key={a.id}
                                        className={`flex items-center gap-4 border-b border-line-row px-6 py-3.5 last:border-b-0 ${live ? "bg-brand-wash" : ""}`}
                                    >
                                        <div className="w-[60px] shrink-0">
                                            <p className={`text-[15.5px] leading-tight font-extrabold ${live ? "text-brand" : ""}`}>{shortTime(a.scheduled_at)}</p>
                                            <p className="text-sm text-ink-4">{shortTime(a.scheduled_at_end)}</p>
                                        </div>
                                        <span aria-hidden="true" className={`h-[38px] w-[3px] shrink-0 rounded-sm ${live ? "bg-primary" : BAR[a.status] ?? "bg-neutral-dot"}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[15.5px] font-extrabold">{a.patient.name} {a.patient.lastname}</p>
                                            <p className="truncate text-sm text-ink-4">{a.service.name}</p>
                                        </div>
                                        {live ? <Badge variant="inProgress">En curso</Badge> : <AppointmentStatusBadge status={a.status} />}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <div className="flex flex-col gap-6">
                    <section aria-labelledby="confirm-title" className={CARD}>
                        <div className={CARD_HEAD}>
                            <div className="flex items-center gap-2.5">
                                <h2 id="confirm-title" className="text-[17px] font-extrabold">Por confirmar</h2>
                                {!!toConfirm.data?.total && (
                                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[13px] font-extrabold text-white">
                                        {toConfirm.data.total}
                                    </span>
                                )}
                            </div>
                        </div>
                        {toConfirm.isPending ? (
                            <div className="flex flex-col gap-3 p-6" aria-busy="true" role="status">
                                <span className="sr-only">Cargando citas por confirmar...</span>
                                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
                            </div>
                        ) : toConfirm.isError ? (
                            <ErrorState message={toConfirm.error.message} onRetry={() => toConfirm.refetch()} />
                        ) : toConfirm.data.items.length === 0 ? (
                            <p className="px-6 py-8 text-center text-[15px] text-ink-4">No hay citas pendientes por confirmar.</p>
                        ) : (
                            <ul aria-label="Citas por confirmar">
                                {toConfirm.data.items.map((a) => {
                                    const canConfirm = getAppointmentActions(Role.ADMINISTRADOR, a, new Date(now)).confirm;
                                    return (
                                        <li key={a.id} className="flex items-center gap-3 border-b border-line-row px-6 py-3.5 last:border-b-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[15.5px] font-extrabold">{a.patient.name} {a.patient.lastname}</p>
                                                <p className="truncate text-sm text-ink-4">{a.service.name} · {formatDateTime(a.scheduled_at)}</p>
                                            </div>
                                            {canConfirm && (
                                                <Button
                                                    variant="success" size="sm"
                                                    onClick={() => setConfirming(a)}
                                                    aria-label={`Confirmar cita de ${a.patient.name} ${a.patient.lastname}`}
                                                >
                                                    Confirmar
                                                </Button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <section aria-labelledby="activity-title" className={CARD}>
                        <div className={CARD_HEAD}>
                            <h2 id="activity-title" className="text-[17px] font-extrabold">Actividad reciente</h2>
                            <Link to="/auditoria" className={CARD_LINK}>Ver todas</Link>
                        </div>
                        {activity.isPending ? (
                            <div className="flex flex-col gap-3 p-6" aria-busy="true" role="status">
                                <span className="sr-only">Cargando actividad...</span>
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : activity.isError ? (
                            <ErrorState message={activity.error.message} onRetry={() => activity.refetch()} />
                        ) : activity.data.items.length === 0 ? (
                            <p className="px-6 py-8 text-center text-[15px] text-ink-4">Aún no hay actividad registrada.</p>
                        ) : (
                            <ul aria-label="Actividad reciente">
                                {activity.data.items.map((log) => (
                                    <li key={log.id} className="flex gap-3.5 border-b border-line-row px-6 py-4 last:border-b-0">
                                        <ActivityIcon action={log.action} />
                                        <div className="min-w-0">
                                            <p className="text-[15px] leading-snug text-ink-2">
                                                {auditActionLabel(log.action)}
                                                {log.user && ` · ${log.user.name} ${log.user.lastname}`}
                                            </p>
                                            <p className="mt-0.5 text-sm text-ink-4">{formatRelative(log.created_at)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            <CreateAppointmentModal open={createOpen} onOpenChange={setCreateOpen} canPickPatient />

            <ConfirmDialog
                open={confirming !== null}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="¿Confirmar esta cita?"
                description="Se notificará al paciente que su cita fue confirmada."
                confirmLabel="Confirmar cita"
                loading={confirmMutation.isPending}
                onConfirm={runConfirm}
            />
        </>
    );
}

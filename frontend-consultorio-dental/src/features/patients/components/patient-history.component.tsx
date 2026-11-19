import { CalendarX, Clock, FileText, ImageOff } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { DateBlock } from "@/components/shared/date-block.component";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Pagination } from "@/components/shared/pagination.component";
import { SectionLabel } from "@/components/shared/section-label.component";
import { TableCard } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { useConsultationImage } from "@/features/consultations/hooks/use-consultations";
import {
    clinicDayKey, formatClinicLongDate, formatClinicShortDate, formatClinicTime, formatKeyShort,
} from "@/utils/clinic-time";
import type { PatientSummary } from "@/features/patients/hooks/use-patient-summary";
import type {
    PatientAppointmentHistoryItem,
    PatientConsultationHistoryItem,
} from "@/features/patients/types/patient.model";
import type { Paginated } from "@/types/pagination";

interface HistoryListProps<T> {
    query: {
        data?: Paginated<T>;
        isPending: boolean;
        isFetching: boolean;
        isError: boolean;
        error: Error | null;
        refetch: () => void;
    };
    page: number;
    onPageChange: (page: number) => void;
}

/** Día y mes abreviado ("10", "nov") en la zona del consultorio, para el bloque de fecha. */
function dayAndMonth(date: Date): { day: string; month: string } {
    const [day, month] = formatKeyShort(clinicDayKey(date)).split(" ");
    return { day: day.padStart(2, "0"), month: month ?? "" };
}

function timeRange(item: PatientAppointmentHistoryItem): string {
    return `${formatClinicTime(item.scheduled_at)} – ${formatClinicTime(item.scheduled_at_end)}`;
}

function HistorySkeleton() {
    return (
        <div className="flex flex-col gap-3.5" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
        </div>
    );
}

const CARD = "rounded-xl border border-line bg-surface";

/** Pestaña "Historial de citas" (Perfil de paciente.dc.html): "Próxima cita" destacada + listado paginado. */
export function AppointmentHistory({
    query, page, onPageChange, summary, role, onEditAppointment,
}: HistoryListProps<PatientAppointmentHistoryItem> & {
    summary: PatientSummary;
    role: string;
    onEditAppointment?: (appointmentId: number) => void;
}) {
    const next = summary.next;
    const showCounts = summary.complete && (summary.completed > 0 || summary.canceled > 0);

    return (
        <div className="flex flex-col gap-6">
            <section aria-label="Próxima cita" className="flex flex-col gap-3">
                <SectionLabel>Próxima cita</SectionLabel>
                {summary.isPending ? (
                    <Skeleton className="h-[122px] w-full rounded-xl" aria-busy="true" />
                ) : next ? (
                    <div className={`${CARD} flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-[26px] sm:py-[22px]`}>
                        <DateBlock tone="solid" {...dayAndMonth(next.scheduled_at)} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <p className="text-[19px] font-extrabold">{next.service_name}</p>
                            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-ink-3">
                                <span className="flex items-center gap-[7px]">
                                    <Clock className="size-4 text-ink-5" strokeWidth={2} aria-hidden="true" />
                                    {formatClinicLongDate(next.scheduled_at)}, {timeRange(next)}
                                </span>
                            </p>
                        </div>
                        <AppointmentStatusBadge status={next.status} />
                    </div>
                ) : (
                    <p className={`${CARD} px-[26px] py-[22px] text-[15px] text-ink-4`}>
                        {summary.isError ? "No pudimos consultar la próxima cita." : "Este paciente no tiene citas próximas."}
                    </p>
                )}
            </section>

            <section aria-label="Historial de citas" className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <SectionLabel>Historial de citas</SectionLabel>
                    {showCounts && (
                        <p className="flex gap-4 text-sm font-semibold text-ink-3">
                            <span className="flex items-center gap-[7px]">
                                <span className="size-[9px] rounded-full bg-[#2563eb]" aria-hidden="true" />
                                {summary.completed} {summary.completed === 1 ? "completada" : "completadas"}
                            </span>
                            <span className="flex items-center gap-[7px]">
                                <span className="size-[9px] rounded-full bg-[#dc2626]" aria-hidden="true" />
                                {summary.canceled} {summary.canceled === 1 ? "cancelada" : "canceladas"}
                            </span>
                        </p>
                    )}
                </div>
                <AppointmentRows query={query} page={page} onPageChange={onPageChange} nextId={next?.id} role={role} onEdit={onEditAppointment} />
            </section>
        </div>
    );
}

function AppointmentRows({
    query, page, onPageChange, nextId, role, onEdit,
}: HistoryListProps<PatientAppointmentHistoryItem> & { nextId?: number; role: string; onEdit?: (appointmentId: number) => void }) {
    if (query.isPending) return <HistorySkeleton />;
    if (query.isError) {
        return <TableCard><ErrorState message={query.error?.message} onRetry={query.refetch} /></TableCard>;
    }

    const data = query.data!;
    // La "próxima cita" no se excluye del listado (así total y paginación cuadran): solo se marca como "Próxima".
    const items = data.items;

    if (data.total === 0) {
        return (
            <TableCard>
                <EmptyState
                    icon={CalendarX}
                    title="Sin citas registradas"
                    description="Cuando se agende una cita aparecerá en este historial."
                />
            </TableCard>
        );
    }

    return (
        <TableCard className="rounded-xl">
            <ul aria-label="Historial de citas" aria-busy={query.isFetching} className={query.isFetching ? "opacity-60 transition-opacity" : undefined}>
                {items.map((item, index) => {
                    const { day, month } = dayAndMonth(item.scheduled_at);
                    return (
                        <li
                            key={item.id}
                            className={`grid items-center gap-x-5 gap-y-3 px-5 py-4 sm:px-6 md:grid-cols-[64px_1.6fr_1fr_130px_auto] ${index > 0 ? "border-t border-line-row" : ""}`}
                        >
                            <DateBlock tone="muted" day={day} month={month} />
                            <div className="flex min-w-0 flex-col gap-[3px]">
                                <span className="text-base font-extrabold">{item.service_name}</span>
                                <span className="text-sm text-ink-4">
                                    {clinicDayKey(item.scheduled_at).slice(0, 4)}
                                    {item.id === nextId && " · Próxima cita"}
                                    {item.has_consultation && " · Consulta registrada"}
                                </span>
                                {item.cancel_reason && (
                                    <span className="truncate text-sm text-danger-strong">Cancelada: {item.cancel_reason}</span>
                                )}
                            </div>
                            <span className="flex items-center gap-[7px] text-[15px] text-ink-2">
                                <Clock className="size-4 shrink-0 text-ink-5" strokeWidth={2} aria-hidden="true" />
                                {timeRange(item)}
                            </span>
                            <span><AppointmentStatusBadge status={item.status} /></span>
                            <span className="flex md:min-w-[72px] md:justify-end">
                                {onEdit && getAppointmentActions(role, item).edit && (
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => onEdit(item.id)}
                                        aria-label={`Editar la cita de ${item.service_name} del ${formatClinicShortDate(item.scheduled_at)}`}
                                    >
                                        Editar
                                    </Button>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
            <Pagination
                page={page} limit={data.limit} total={data.total}
                onPageChange={onPageChange} disabled={query.isFetching} noun="citas"
            />
        </TableCard>
    );
}

/** Miniatura circular de 34px de una imagen de consulta (se descarga con credenciales). */
function Thumb({ path, label, overlap }: { path: string; label: string; overlap: boolean }) {
    const query = useConsultationImage(path);
    return (
        <span
            className={`flex size-[34px] items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-[#eef0f2] shadow-[0_1px_3px_rgba(0,0,0,.12)] ${overlap ? "-ml-2.5" : ""}`}
        >
            {query.isPending && <Skeleton className="size-full rounded-full" />}
            {query.isError && <ImageOff className="size-4 text-ink-5" aria-label={`${label} (no disponible)`} />}
            {query.data && <img src={query.data} alt={label} className="size-full object-cover" />}
        </span>
    );
}

const MAX_THUMBS = 3;

/** Pestaña "Historial de consultas" (solo ADMIN): una tarjeta por consulta con fecha, nota y miniaturas. */
export function ConsultationHistory({
    query, page, onPageChange, onViewConsultation,
}: HistoryListProps<PatientConsultationHistoryItem> & { onViewConsultation?: (consultationId: number) => void }) {
    if (query.isPending) return <HistorySkeleton />;
    if (query.isError) {
        return <TableCard><ErrorState message={query.error?.message} onRetry={query.refetch} /></TableCard>;
    }

    const data = query.data!;

    if (data.items.length === 0) {
        return (
            <TableCard>
                <EmptyState
                    icon={FileText}
                    title="Sin consultas registradas"
                    description="Las consultas se registran después de completar una cita."
                />
            </TableCard>
        );
    }

    return (
        <div className={`flex flex-col gap-3.5 ${query.isFetching ? "opacity-60 transition-opacity" : ""}`}>
            <ul aria-label="Historial de consultas" className="flex flex-col gap-3.5">
                {data.items.map((item) => {
                    const { day, month } = dayAndMonth(item.scheduled_at);
                    const thumbs = item.images.slice(0, MAX_THUMBS);
                    const more = item.images.length - thumbs.length;
                    const imagesLabel = `${item.images_count} ${item.images_count === 1 ? "imagen" : "imágenes"}`;
                    return (
                        <li key={item.id} className={`${CARD} flex flex-col gap-4 px-5 py-5 sm:flex-row sm:gap-[22px] sm:px-[26px] sm:py-[22px]`}>
                            <DateBlock tone="brand" day={day} month={month} />
                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 flex-col gap-[3px]">
                                        <span className="text-[17px] font-extrabold">{item.service_name}</span>
                                        <span className="text-sm text-ink-4">{formatClinicShortDate(item.scheduled_at)}</span>
                                    </div>
                                    {onViewConsultation && (
                                        <Button
                                            variant="outline" size="sm" className="shrink-0"
                                            onClick={() => onViewConsultation(item.id)}
                                            aria-label={`Ver la consulta de ${item.service_name} del ${formatClinicShortDate(item.scheduled_at)}`}
                                        >
                                            Ver consulta
                                        </Button>
                                    )}
                                </div>
                                <p className="text-[15.5px] leading-[1.6] whitespace-pre-line text-ink-2">{item.description}</p>
                                {item.observations && (
                                    <p className="text-sm leading-[1.55] text-ink-4">
                                        <span className="font-bold">Observaciones: </span>
                                        {item.observations}
                                    </p>
                                )}
                                <div className="flex items-center justify-end gap-2.5">
                                    <span className="text-[13.5px] font-semibold text-ink-4">{imagesLabel}</span>
                                    {thumbs.length > 0 && (
                                        <span className="flex items-center">
                                            {thumbs.map((image, index) => (
                                                <Thumb
                                                    key={image.id} path={image.path} overlap={index > 0}
                                                    label={`Imagen ${index + 1} de la consulta de ${item.service_name}`}
                                                />
                                            ))}
                                            {more > 0 && (
                                                <span className="-ml-2.5 flex size-[34px] items-center justify-center rounded-full border-2 border-surface bg-foreground text-xs font-extrabold text-white">
                                                    +{more}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <TableCard>
                <Pagination
                    page={page} limit={data.limit} total={data.total}
                    onPageChange={onPageChange} disabled={query.isFetching} noun="consultas"
                />
            </TableCard>
        </div>
    );
}

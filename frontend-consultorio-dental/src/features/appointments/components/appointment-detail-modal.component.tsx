import {
    AlignLeft, CalendarClock, Check, CheckCheck, ClipboardList, Clock, Pencil, Stethoscope, Tag, User, X,
    type LucideIcon,
} from "lucide-react";
import { FormRow } from "@/components/shared/form-row.component";
import { Modal } from "@/components/shared/modal.component";
import { AppointmentStatusBadge } from "@/components/shared/status-badge.component";
import { Alert } from "@/components/shared/alert.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointment } from "@/features/appointments/hooks/use-appointments";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { useConsultationOfAppointment } from "@/features/consultations/hooks/use-consultations";
import { useNow } from "@/hooks/use-now";
import { Role } from "@/features/users/types/rol.enum";
import { clinicDayKey, formatClinicLongDate, formatClinicTime } from "@/utils/clinic-time";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import type { AppointmentDetail } from "@/features/appointments/types/appointment.model";

interface AppointmentDetailModalProps {
    appointmentId: number | null;
    role: string;
    onClose: () => void;
    onConfirm?: (appointment: AppointmentDetail) => void;
    onComplete?: (appointment: AppointmentDetail) => void;
    onCancel?: (appointment: AppointmentDetail) => void;
    onReschedule?: (appointment: AppointmentDetail) => void;
    onEdit?: (appointment: AppointmentDetail) => void;
    /** Solo ADMIN, cita COMPLETADA: abre el formulario de consulta ligado a la cita. */
    onRegisterConsultation?: (appointment: AppointmentDetail) => void;
    onViewConsultation?: (consultationId: number) => void;
}

/** Fila de solo lectura de la maqueta: etiqueta con icono + valor en campo gris #f5f6f7 de 46px. */
function DetailRow({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <FormRow label={label} icon={icon}>
            <div className="flex min-h-[46px] items-center rounded-[9px] bg-field px-3.5 text-[15px] font-bold break-words text-foreground">{value}</div>
        </FormRow>
    );
}

/** Detalle de la cita (Citas.dc.html) con las acciones que el rol puede realizar sobre ella. */
export function AppointmentDetailModal({
    appointmentId, role, onClose, onConfirm, onComplete, onCancel, onReschedule, onEdit, onRegisterConsultation, onViewConsultation,
}: AppointmentDetailModalProps) {
    const now = useNow();
    const query = useAppointment(appointmentId);
    const appointment = query.data;
    const isAdmin = role === Role.ADMINISTRADOR;
    const isCompleted = appointment?.status === STATUS_APPOINTMENT.COMPLETADA;

    const consultationQuery = useConsultationOfAppointment(
        appointment?.id ?? null,
        appointment?.patient_id ?? null,
        appointment ? clinicDayKey(appointment.scheduled_at) : null,
        isAdmin && isCompleted,
    );

    const actions = appointment ? getAppointmentActions(role, appointment, new Date(now)) : null;

    return (
        <Modal
            open={appointmentId !== null}
            onClose={(open) => !open && onClose()}
            title="Cita"
            headerExtra={appointment ? <AppointmentStatusBadge status={appointment.status} size="lg" /> : undefined}
            size="lg"
        >
            {query.isPending && (
                <div className="flex flex-col gap-3" aria-busy="true">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            )}

            {query.isError && <ErrorState message={query.error.message} onRetry={() => query.refetch()} />}

            {appointment && actions && (
                <div className="flex flex-col gap-[18px]">
                    {role !== Role.PACIENTE && (
                        <DetailRow icon={User} label="Paciente" value={`${appointment.patient.name} ${appointment.patient.lastname}`} />
                    )}
                    <DetailRow icon={Stethoscope} label="Servicio" value={appointment.service.name} />
                    <DetailRow icon={CalendarClock} label="Fecha" value={formatClinicLongDate(appointment.scheduled_at)} />
                    <DetailRow
                        icon={Clock} label="Horario"
                        value={`${formatClinicTime(appointment.scheduled_at)} – ${formatClinicTime(appointment.scheduled_at_end)} (${formatTotalMinutesToHours(appointment.durationMinutes)})`}
                    />
                    <DetailRow icon={Tag} label="Precio" value={formatCurrency(appointment.service_price)} />
                    <div className="h-px bg-line-soft" />
                    <FormRow label="Notas" icon={AlignLeft} align="top">
                        <p className="min-h-[46px] rounded-[9px] bg-field px-3.5 py-3 text-[15px] leading-normal whitespace-pre-line text-ink-2">
                            {appointment.notes || "Sin notas."}
                        </p>
                    </FormRow>

                    {appointment.reason && appointment.status === STATUS_APPOINTMENT.REPROGRAMADA && (
                        <Alert variant="warning" title="Motivo de la reprogramación" >{appointment.reason}</Alert>
                    )}
                    {appointment.cancel_reason && (
                        <Alert variant="warning" title="Motivo de la cancelación" >{appointment.cancel_reason}</Alert>
                    )}

                    {isAdmin && isCompleted && consultationQuery.isError && (
                        <Alert >No pudimos comprobar si la cita ya tiene consulta: {consultationQuery.error.message}</Alert>
                    )}

                    <div className="form-footer flex-wrap">
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        {actions.cancel && onCancel && (
                            <Button variant="dangerOutline" onClick={() => onCancel(appointment)}><X /> Cancelar cita</Button>
                        )}
                        {actions.edit && onEdit && (
                            <Button variant="outline" onClick={() => onEdit(appointment)}><Pencil /> Editar</Button>
                        )}
                        {actions.reschedule && onReschedule && (
                            <Button variant="outline" onClick={() => onReschedule(appointment)}><CalendarClock /> Reprogramar</Button>
                        )}
                        {actions.confirm && onConfirm && (
                            <Button onClick={() => onConfirm(appointment)}><Check /> Confirmar</Button>
                        )}
                        {actions.complete && onComplete && (
                            <Button onClick={() => onComplete(appointment)}><CheckCheck /> Marcar completada</Button>
                        )}
                        {isAdmin && isCompleted && consultationQuery.data && onViewConsultation && (
                            <Button onClick={() => onViewConsultation(consultationQuery.data!.id)}>
                                <ClipboardList /> Ver consulta
                            </Button>
                        )}
                        {isAdmin && isCompleted && consultationQuery.data === null && onRegisterConsultation && (
                            <Button onClick={() => onRegisterConsultation(appointment)}>
                                <ClipboardList /> Registrar consulta
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}

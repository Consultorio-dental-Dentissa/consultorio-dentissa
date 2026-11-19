import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { AppointmentDetailModal } from "@/features/appointments/components/appointment-detail-modal.component";
import { CancelAppointmentModal } from "@/features/appointments/components/cancel-appointment-modal.component";
import { EditAppointmentModal } from "@/features/appointments/components/edit-appointment-modal.component";
import { RescheduleAppointmentModal } from "@/features/appointments/components/reschedule-appointment-modal.component";
import { useCompleteAppointment, useConfirmAppointment } from "@/features/appointments/hooks/use-appointments";
import { ConsultationDetailModal } from "@/features/consultations/components/consultation-detail-modal.component";
import { CreateConsultationModal, type ConsultationAppointment } from "@/features/consultations/components/create-consultation-modal.component";
import { formatClinicShortDate } from "@/utils/clinic-time";
import type { Appointment, AppointmentDetail } from "@/features/appointments/types/appointment.model";

type Transition = { type: "confirm" | "complete"; appointment: Appointment };

interface AppointmentWorkflowProps {
    /** Cita abierta en el detalle; null = cerrado. */
    appointmentId: number | null;
    role: string;
    onClose: () => void;
}

/**
 * Mismo detalle de cita que el calendario (AppointmentDetailModal) con todas sus acciones:
 * confirmar, completar, editar, reprogramar, cancelar y registrar/ver la consulta.
 * Los permisos finales los valida el backend.
 */
export function AppointmentWorkflow({ appointmentId, role, onClose }: AppointmentWorkflowProps) {
    const [toCancel, setToCancel] = useState<Appointment | null>(null);
    const [toReschedule, setToReschedule] = useState<Appointment | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [transition, setTransition] = useState<Transition | null>(null);
    const [consultationFor, setConsultationFor] = useState<ConsultationAppointment | null>(null);
    const [consultationId, setConsultationId] = useState<number | null>(null);

    const confirmMutation = useConfirmAppointment();
    const completeMutation = useCompleteAppointment();

    // El detalle se oculta mientras se atiende una acción y se vuelve a mostrar al terminarla.
    const [hidden, setHidden] = useState(false);

    const fromDetail = <T,>(open: (value: T) => void) => (value: T) => {
        setHidden(true);
        open(value);
    };

    const closeAll = () => {
        setHidden(false);
        onClose();
    };

    const runTransition = () => {
        if (!transition) return;
        const { type, appointment } = transition;
        const mutation = type === "confirm" ? confirmMutation : completeMutation;

        mutation.mutate(appointment.id, {
            onSuccess: () => {
                toast.success(type === "confirm" ? "Cita confirmada" : "Cita marcada como completada");
                setTransition(null);
                // Al completar se vuelve al detalle para poder registrar la consulta.
                setHidden(false);
            },
            onError: (error) => {
                toast.error(error.message);
                setTransition(null);
                setHidden(false);
            },
        });
    };

    const reveal = () => setHidden(false);

    return (
        <>
            <AppointmentDetailModal
                appointmentId={hidden ? null : appointmentId}
                role={role}
                onClose={closeAll}
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
            <CancelAppointmentModal appointment={toCancel} onClose={() => { setToCancel(null); reveal(); }} />
            <EditAppointmentModal
                appointmentId={editId}
                role={role}
                onClose={() => { setEditId(null); reveal(); }}
                onComplete={(a) => {
                    setEditId(null);
                    setTransition({ type: "complete", appointment: a });
                }}
            />
            <RescheduleAppointmentModal appointment={toReschedule} onClose={() => { setToReschedule(null); reveal(); }} />
            <CreateConsultationModal
                open={consultationFor !== null}
                onOpenChange={(open) => { if (!open) { setConsultationFor(null); reveal(); } }}
                appointment={consultationFor ?? undefined}
            />
            <ConsultationDetailModal consultationId={consultationId} onClose={() => { setConsultationId(null); reveal(); }} />
            <ConfirmDialog
                open={transition !== null}
                onOpenChange={(open) => { if (!open) { setTransition(null); reveal(); } }}
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

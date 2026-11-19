import { CalendarX } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Modal } from "@/components/shared/modal.component";
import { TextareaForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCancelAppointment } from "@/features/appointments/hooks/use-appointments";
import type { Appointment } from "@/features/appointments/types/appointment.model";
import { formatDateTime } from "@/utils/formatters";

const schema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, "Indica el motivo de la cancelación")
        .max(500, "El motivo debe tener máximo 500 caracteres"),
});

type CancelInput = z.infer<typeof schema>;

interface CancelAppointmentModalProps {
    appointment: Appointment | null;
    onClose: () => void;
}

export function CancelAppointmentModal({ appointment, onClose }: CancelAppointmentModalProps) {
    return (
        <Modal
            icon={CalendarX}
            open={appointment !== null}
            onClose={(open) => !open && onClose()}
            title="Cancelar cita"
            description={
                appointment
                    ? `${appointment.service.name} · ${formatDateTime(appointment.scheduled_at)} — esta acción no se puede deshacer.`
                    : undefined
            }
            size="sm"
        >
            {appointment && <CancelForm appointment={appointment} onClose={onClose} />}
        </Modal>
    );
}

function CancelForm({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
    const mutation = useCancelAppointment();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CancelInput>({ resolver: zodResolver(schema) });

    const onSubmit = ({ reason }: CancelInput) => {
        setFormError(null);

        mutation.mutate(
            { id: appointment.id, reason },
            {
                onSuccess: () => {
                    toast.success("La cita fue cancelada");
                    onClose();
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <TextareaForm
                label="Motivo de la cancelación" required maxLength={500}
                registration={register("reason")} error={errors.reason?.message}
            />

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                    Volver
                </Button>
                <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Cancelar cita
                </Button>
            </div>
        </form>
    );
}

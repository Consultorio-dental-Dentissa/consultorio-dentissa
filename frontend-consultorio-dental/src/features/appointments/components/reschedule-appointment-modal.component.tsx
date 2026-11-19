import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Modal } from "@/components/shared/modal.component";
import { InputForm, TextareaForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRescheduleAppointment } from "@/features/appointments/hooks/use-appointments";
import {
    combineDateTime, refineFutureSchedule, scheduleFields,
} from "@/features/appointments/components/appointment-schedule";
import type { Appointment } from "@/features/appointments/types/appointment.model";
import { ApiError } from "@/services/api";
import { formatDateTime } from "@/utils/formatters";
import { clinicTodayKey } from "@/utils/clinic-time";

const schema = z
    .object({
        ...scheduleFields,
        reason: z
            .string()
            .trim()
            .min(1, "Indica el motivo de la reprogramación")
            .max(500, "El motivo debe tener máximo 500 caracteres"),
    })
    .superRefine(refineFutureSchedule);

type RescheduleInput = z.infer<typeof schema>;

interface RescheduleAppointmentModalProps {
    appointment: Appointment | null;
    onClose: () => void;
}

export function RescheduleAppointmentModal({ appointment, onClose }: RescheduleAppointmentModalProps) {
    return (
        <Modal
            icon={CalendarClock}
            open={appointment !== null}
            onClose={(open) => !open && onClose()}
            title="Reprogramar cita"
            description={
                appointment
                    ? `${appointment.service.name} · actualmente ${formatDateTime(appointment.scheduled_at)}.`
                    : undefined
            }
        >
            {appointment && <RescheduleForm appointment={appointment} onClose={onClose} />}
        </Modal>
    );
}

function RescheduleForm({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
    const mutation = useRescheduleAppointment();
    const [formError, setFormError] = useState<{ message: string; conflict: boolean } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RescheduleInput>({ resolver: zodResolver(schema) });

    const onSubmit = (data: RescheduleInput) => {
        setFormError(null);

        mutation.mutate(
            {
                id: appointment.id,
                scheduled_at: combineDateTime(data.date, data.time).toISOString(),
                reason: data.reason,
            },
            {
                onSuccess: () => {
                    toast.success("La cita fue reprogramada");
                    onClose();
                },
                onError: (error) =>
                    setFormError({
                        message: error.message,
                        conflict: error instanceof ApiError && error.code === "conflict",
                    }),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {formError && (
                <Alert title={formError.conflict ? "Horario no disponible" : undefined}>
                    {formError.message}
                </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                    label="Nueva fecha" required type="date" min={clinicTodayKey()}
                    registration={register("date")} error={errors.date?.message}
                />
                <InputForm
                    label="Nueva hora" required type="time"
                    registration={register("time")} error={errors.time?.message}
                />
            </div>

            <TextareaForm
                label="Motivo de la reprogramación" required maxLength={500}
                registration={register("reason")} error={errors.reason?.message}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                    Volver
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Reprogramar
                </Button>
            </div>
        </form>
    );
}

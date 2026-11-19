import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCheck, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/shared/modal.component";
import { SelectForm, TextareaForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAppointment, useUpdateAppointment } from "@/features/appointments/hooks/use-appointments";
import { getAppointmentActions } from "@/features/appointments/types/appointment.permissions";
import { useActiveServices } from "@/features/services/hooks/use-services";
import { ApiError } from "@/services/api";
import { formatClinicLongDate, formatClinicTime } from "@/utils/clinic-time";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import type { AppointmentDetail } from "@/features/appointments/types/appointment.model";
import type { UpdateAppointmentDto } from "@/features/appointments/types/create-appointment.dto";

const schema = z.object({
    service_id: z.string().min(1, "Selecciona un servicio"),
    notes: z
        .string()
        .trim()
        .min(1, "Describe brevemente el motivo de la cita")
        .max(300, "Las notas deben tener máximo 300 caracteres"),
});

type EditInput = z.infer<typeof schema>;

interface EditAppointmentModalProps {
    appointmentId: number | null;
    role: string;
    onClose: () => void;
    /** Si se pasa, ofrece "Marcar completada" cuando la cita lo permite (ADMIN, confirmada y ya iniciada). */
    onComplete?: (appointment: AppointmentDetail) => void;
}

/** Edición de servicio y notas de una cita. La fecha se cambia con "Reprogramar". */
export function EditAppointmentModal({ appointmentId, role, onClose, onComplete }: EditAppointmentModalProps) {
    const query = useAppointment(appointmentId);
    const appointment = query.data;

    return (
        <Modal
            icon={Pencil}
            open={appointmentId !== null}
            onClose={(open) => !open && onClose()}
            title="Editar cita"
            description={
                appointment
                    ? `${formatClinicLongDate(appointment.scheduled_at)} · ${formatClinicTime(appointment.scheduled_at)} (para cambiar la fecha usa "Reprogramar")`
                    : "Cambia el servicio o las notas de la cita"
            }
        >
            {query.isPending && appointmentId !== null && (
                <div className="flex flex-col gap-3" aria-busy="true">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            {query.isError && <ErrorState message={query.error.message} onRetry={() => query.refetch()} />}
            {appointment && <EditForm key={appointment.id} appointment={appointment} role={role} onClose={onClose} onComplete={onComplete} />}
        </Modal>
    );
}

function EditForm({ appointment, role, onClose, onComplete }: {
    appointment: AppointmentDetail; role: string; onClose: () => void; onComplete?: (appointment: AppointmentDetail) => void;
}) {
    const mutation = useUpdateAppointment();
    const servicesQuery = useActiveServices();
    const [formError, setFormError] = useState<{ message: string; conflict: boolean } | null>(null);

    // Si el estado de la cita ya no permite editar (cambió desde otra sesión), lo avisamos.
    const actions = getAppointmentActions(role, appointment);
    const canEdit = actions.edit;
    const canComplete = actions.complete && !!onComplete;

    const initial: EditInput = { service_id: String(appointment.service_id), notes: appointment.notes };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EditInput>({ resolver: zodResolver(schema), defaultValues: initial });

    // El servicio actual puede estar inactivo: se incluye para que siga seleccionable.
    const activeServices = servicesQuery.data ?? [];
    const options = activeServices.map((s) => ({ data: s.name, value: s.id }));
    if (!activeServices.some((s) => s.id === appointment.service_id)) {
        options.unshift({ data: appointment.service.name, value: appointment.service_id });
    }

    const serviceIdValue = useWatch({ control, name: "service_id" });
    const selectedService = activeServices.find((s) => String(s.id) === serviceIdValue);

    const onSubmit = (data: EditInput) => {
        setFormError(null);

        const changes: UpdateAppointmentDto = {};
        if (data.service_id !== initial.service_id) changes.service_id = Number(data.service_id);
        if (data.notes !== initial.notes.trim()) changes.notes = data.notes;

        if (Object.keys(changes).length === 0) {
            toast("No hay cambios para guardar");
            return;
        }

        mutation.mutate(
            { id: appointment.id, ...changes },
            {
                onSuccess: () => {
                    toast.success("Cita actualizada correctamente");
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
            {!canEdit && <Alert variant="warning">Esta cita ya no puede editarse en su estado actual.</Alert>}
            {formError && (
                <Alert title={formError.conflict ? "Horario no disponible" : undefined}>{formError.message}</Alert>
            )}
            {servicesQuery.isError && <Alert>No pudimos cargar los servicios: {servicesQuery.error.message}</Alert>}

            <Controller
                control={control}
                name="service_id"
                render={({ field }) => (
                    <SelectForm
                        label="Servicio" required
                        placeholder={servicesQuery.isPending ? "Cargando servicios..." : "Selecciona un servicio"}
                        data={options}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.service_id?.message}
                        hint={
                            selectedService
                                ? `${formatTotalMinutesToHours(selectedService.durationMinutes)} · ${formatCurrency(selectedService.price)}`
                                : undefined
                        }
                    />
                )}
            />

            <TextareaForm
                label="Motivo o notas" required maxLength={300}
                registration={register("notes")} error={errors.notes?.message}
            />

            <div className="form-footer">
                {canComplete && (
                    <Button
                        type="button" variant="secondary"
                        className="sm:mr-auto"
                        onClick={() => onComplete?.(appointment)}
                        disabled={mutation.isPending}
                    >
                        <CheckCheck /> Marcar completada
                    </Button>
                )}
                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending || !canEdit}>
                    {mutation.isPending && <Spinner />} Guardar cambios
                </Button>
            </div>
        </form>
    );
}

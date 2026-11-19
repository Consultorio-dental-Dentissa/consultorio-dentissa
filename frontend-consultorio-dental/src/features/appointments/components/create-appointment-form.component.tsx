import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { InputForm, SelectForm, TextareaForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PatientPicker, type PickedPatient } from "@/features/patients/components/patient-picker.component";
import { useCreateAppointment } from "@/features/appointments/hooks/use-appointments";
import { useActiveServices } from "@/features/services/hooks/use-services";
import {
    combineDateTime, refineFutureSchedule, scheduleFields,
} from "@/features/appointments/components/appointment-schedule";
import { ApiError } from "@/services/api";
import { formatCurrency, formatTotalMinutesToHours } from "@/utils/formatters";
import { clinicTodayKey } from "@/utils/clinic-time";

const baseSchema = z.object({
    ...scheduleFields,
    service_id: z.string().min(1, "Selecciona un servicio"),
    notes: z
        .string()
        .trim()
        .min(1, "Describe brevemente el motivo de la cita")
        .max(300, "Las notas deben tener máximo 300 caracteres"),
    patient: z.object({ id: z.number(), name: z.string(), lastname: z.string() }).nullable(),
});

type FormInput = z.infer<typeof baseSchema>;

interface CreateAppointmentFormProps {
    /** ADMIN/ASISTENTE eligen paciente; el PACIENTE agenda solo para sí mismo. */
    canPickPatient: boolean;
    defaultPatient?: PickedPatient;
    /** Fecha (AAAA-MM-DD) y hora (HH:mm) sugeridas, p. ej. al pulsar un hueco del calendario. */
    defaultDate?: string;
    defaultTime?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateAppointmentForm({
    canPickPatient, defaultPatient, defaultDate, defaultTime, onSuccess, onCancel,
}: CreateAppointmentFormProps) {
    const createMutation = useCreateAppointment();
    const servicesQuery = useActiveServices();
    const [formError, setFormError] = useState<{ message: string; conflict: boolean } | null>(null);

    const schema = baseSchema.superRefine((data, ctx) => {
        refineFutureSchedule(data, ctx);
        if (canPickPatient && !data.patient) {
            ctx.addIssue({ code: "custom", path: ["patient"], message: "Selecciona un paciente" });
        }
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: { patient: defaultPatient ?? null, notes: "", date: defaultDate ?? "", time: defaultTime ?? "" },
    });

    const serviceIdValue = useWatch({ control, name: "service_id" });
    const services = servicesQuery.data ?? [];
    const selectedService = services.find((s) => String(s.id) === serviceIdValue);

    const onSubmit = (data: FormInput) => {
        setFormError(null);

        createMutation.mutate(
            {
                scheduled_at: combineDateTime(data.date, data.time).toISOString(),
                notes: data.notes,
                service_id: Number(data.service_id),
                patient_id: canPickPatient ? data.patient?.id : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Cita agendada correctamente");
                    onSuccess();
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

            {servicesQuery.isError && (
                <Alert>No pudimos cargar los servicios: {servicesQuery.error.message}</Alert>
            )}

            {canPickPatient && (
                <Controller
                    control={control}
                    name="patient"
                    render={({ field }) => (
                        <PatientPicker value={field.value} onChange={field.onChange} error={errors.patient?.message} />
                    )}
                />
            )}

            <Controller
                control={control}
                name="service_id"
                render={({ field }) => (
                    <SelectForm
                        label="Servicio" required
                        placeholder={servicesQuery.isPending ? "Cargando servicios..." : "Selecciona un servicio"}
                        data={services.map((s) => ({ data: s.name, value: s.id }))}
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

            <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                    label="Fecha" required type="date" min={clinicTodayKey()}
                    registration={register("date")} error={errors.date?.message}
                />
                <InputForm
                    label="Hora" required type="time"
                    registration={register("time")} error={errors.time?.message}
                />
            </div>

            <TextareaForm
                label="Motivo o notas" required maxLength={300}
                placeholder="Cuéntanos brevemente el motivo de la cita"
                registration={register("notes")} error={errors.notes?.message}
            />

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={createMutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Spinner />} Agendar cita
                </Button>
            </div>
        </form>
    );
}

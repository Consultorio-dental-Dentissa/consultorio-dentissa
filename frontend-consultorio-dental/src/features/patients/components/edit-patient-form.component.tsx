import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { CalendarDays, CircleCheck, Mail, MapPin, Phone, TriangleAlert, User } from "lucide-react";
import { Alert } from "@/components/shared/alert.component";
import { FormRow } from "@/components/shared/form-row.component";
import { FormRowInput } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useUpdatePatient } from "@/features/patients/hooks/use-patients";
import {
    birthDateSchema, emailSchema, normalizePhone, phoneSchema, requiredText,
} from "@/utils/validation";
import { toDateInputValue } from "@/utils/formatters";
import type { Patient } from "@/features/patients/types/patient.model";
import type { UpdatePatientDto } from "@/features/patients/types/update-patient.dto";

/**
 * Teléfono de emergencia y dirección son obligatorios solo si el paciente ya los tiene; si están vacíos (registro
 * sin esos datos) pueden quedar vacíos y no se envían, para poder guardar el resto de los campos.
 */
function buildSchema(hasEmergencyPhone: boolean, hasAddress: boolean) {
    return z.object({
        name: requiredText("El nombre"),
        lastname: requiredText("El apellido"),
        email: emailSchema,
        phone: phoneSchema("El teléfono"),
        emergency_phone: hasEmergencyPhone
            ? phoneSchema("El teléfono de emergencia")
            : z.union([z.literal(""), phoneSchema("El teléfono de emergencia")]),
        address: hasAddress ? requiredText("La dirección", 300) : z.union([z.literal(""), requiredText("La dirección", 300)]),
        birth_date: birthDateSchema,
        status: z.boolean(),
    });
}

type EditInput = z.infer<ReturnType<typeof buildSchema>>;

interface EditPatientFormProps {
    patient: Patient;
    onSuccess: () => void;
    onCancel: () => void;
}

/** "Editar paciente" (Perfil de paciente.dc.html): campos en fila con icono y estatus con interruptor. Solo ADMIN. */
export function EditPatientForm({ patient, onSuccess, onCancel }: EditPatientFormProps) {
    const mutation = useUpdatePatient(patient.id);
    const [formError, setFormError] = useState<string | null>(null);

    const initial: EditInput = {
        name: patient.name,
        lastname: patient.lastname,
        email: patient.email,
        phone: patient.phone,
        emergency_phone: patient.emergency_phone ?? "",
        address: patient.address ?? "",
        birth_date: patient.birth_date ? toDateInputValue(patient.birth_date) : "",
        status: patient.status,
    };

    const schema = useMemo(
        () => buildSchema(!!patient.emergency_phone, !!patient.address),
        [patient.emergency_phone, patient.address],
    );

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EditInput>({ resolver: zodResolver(schema), defaultValues: initial });

    const isPending = mutation.isPending;

    const onSubmit = (data: EditInput) => {
        setFormError(null);

        // Solo se envían los campos que cambiaron (PATCH parcial)
        const changes: UpdatePatientDto = {};
        if (data.name !== initial.name) changes.name = data.name;
        if (data.lastname !== initial.lastname) changes.lastname = data.lastname;
        if (data.email.toLowerCase() !== initial.email.toLowerCase()) changes.email = data.email;
        if (normalizePhone(data.phone) !== normalizePhone(initial.phone)) changes.phone = normalizePhone(data.phone);
        if (normalizePhone(data.emergency_phone) !== normalizePhone(initial.emergency_phone)) {
            changes.emergency_phone = normalizePhone(data.emergency_phone);
        }
        if (data.address !== initial.address) changes.address = data.address;
        if (data.birth_date !== initial.birth_date) changes.birth_date = data.birth_date;

        // El estatus viaja en el mismo PATCH: el backend lo aplica de forma atómica con los demás campos.
        if (data.status !== initial.status && patient.user_id !== null) changes.status = data.status;

        if (Object.keys(changes).length === 0) {
            toast("No hay cambios para guardar");
            return;
        }

        mutation.mutate(changes, {
            onSuccess: () => {
                toast.success("Datos del paciente actualizados");
                onSuccess();
            },
            onError: (error) => setFormError(error.message || "No se pudo guardar el paciente."),
        });
    };

    const status = useWatch({ control, name: "status" });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <FormRowInput label="Nombre(s)" icon={User} registration={register("name")} error={errors.name?.message} autoComplete="off" />
            <FormRowInput label="Apellidos" icon={User} registration={register("lastname")} error={errors.lastname?.message} autoComplete="off" />
            <FormRowInput
                label="Nacimiento" icon={CalendarDays} type="date" max={toDateInputValue(new Date())}
                registration={register("birth_date")} error={errors.birth_date?.message}
            />
            <FormRowInput
                label="Teléfono" icon={Phone} type="tel" inputMode="tel"
                registration={register("phone")} error={errors.phone?.message}
            />
            <FormRowInput
                label="Emergencia" icon={TriangleAlert} type="tel" inputMode="tel"
                registration={register("emergency_phone")} error={errors.emergency_phone?.message}
            />
            <FormRowInput
                label="Correo" icon={Mail} type="email"
                registration={register("email")} error={errors.email?.message}
            />
            <FormRowInput label="Dirección" icon={MapPin} registration={register("address")} error={errors.address?.message} />

            <FormRow label="Estatus" icon={CircleCheck}>
                <div className="flex items-center gap-3">
                    <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={patient.user_id === null}
                                aria-label="Paciente activo"
                            />
                        )}
                    />
                    <span className="text-[15px] text-ink-2">{status ? "Activo" : "Inactivo"}</span>
                </div>
                {!status && (
                    <p className="mt-1.5 text-[13.5px] text-ink-4">
                        Un paciente inactivo no podrá iniciar sesión ni agendar citas hasta que se vuelva a activar.
                    </p>
                )}
            </FormRow>

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner />} Guardar cambios
                </Button>
            </div>
        </form>
    );
}

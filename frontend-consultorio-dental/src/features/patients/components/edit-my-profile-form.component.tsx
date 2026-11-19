import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { CalendarDays, KeyRound, Mail, MapPin, Phone, TriangleAlert, User } from "lucide-react";
import { Alert } from "@/components/shared/alert.component";
import { FormRowInput } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateMyProfile } from "@/features/patients/hooks/use-patients";
import { emailSchema, normalizePhone, phoneSchema } from "@/utils/validation";
import { formatDate } from "@/utils/formatters";
import type { Patient } from "@/features/patients/types/patient.model";
import type { UpdateMyProfileDto } from "@/features/patients/types/update-patient.dto";

/** El teléfono de emergencia solo es obligatorio si el paciente ya lo tiene; si no, puede quedar vacío. */
function buildSchema(hasEmergencyPhone: boolean) {
    return z.object({
        email: emailSchema,
        phone: phoneSchema("El teléfono"),
        emergency_phone: hasEmergencyPhone
            ? phoneSchema("El teléfono de emergencia")
            : z.union([z.literal(""), phoneSchema("El teléfono de emergencia")]),
        current_password: z.string().optional(),
    });
}

type ProfileInput = z.infer<ReturnType<typeof buildSchema>>;

interface EditMyProfileFormProps {
    patient: Patient;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * "Modificar datos" del paciente (Paciente - Mi perfil.dc.html). El backend solo permite cambiar correo, teléfono y
 * teléfono de emergencia (PATCH /patients/me); el resto se muestra en solo lectura. Cambiar el correo exige la
 * contraseña actual.
 */
export function EditMyProfileForm({ patient, onSuccess, onCancel }: EditMyProfileFormProps) {
    const mutation = useUpdateMyProfile();
    const [formError, setFormError] = useState<string | null>(null);

    const initial = {
        email: patient.email,
        phone: patient.phone,
        emergency_phone: patient.emergency_phone ?? "",
    };

    const schema = useMemo(() => buildSchema(!!patient.emergency_phone), [patient.emergency_phone]);

    const {
        register,
        handleSubmit,
        control,
        setError,
        reset,
        formState: { errors },
    } = useForm<ProfileInput>({
        resolver: zodResolver(schema),
        defaultValues: { ...initial, current_password: "" },
    });

    const watchedEmail = useWatch({ control, name: "email" });
    const emailChanged = watchedEmail?.trim().toLowerCase() !== initial.email.toLowerCase();

    const onSubmit = (data: ProfileInput) => {
        setFormError(null);

        const changes: UpdateMyProfileDto = {};
        if (data.email.trim().toLowerCase() !== initial.email.toLowerCase()) changes.email = data.email.trim();
        if (normalizePhone(data.phone) !== normalizePhone(initial.phone)) changes.phone = normalizePhone(data.phone);
        if (normalizePhone(data.emergency_phone) !== normalizePhone(initial.emergency_phone)) {
            changes.emergency_phone = normalizePhone(data.emergency_phone);
        }

        if (Object.keys(changes).length === 0) {
            toast("No hay cambios para guardar");
            return;
        }

        if (changes.email) {
            if (!data.current_password) {
                setError("current_password", { message: "Ingresa tu contraseña actual para cambiar el correo" });
                return;
            }
            changes.current_password = data.current_password;
        }

        mutation.mutate(changes, {
            onSuccess: (updated) => {
                toast.success(
                    changes.email
                        ? "Correo actualizado. Si se cierra tu sesión, inicia de nuevo con el nuevo correo."
                        : "Tus datos fueron actualizados",
                    { duration: changes.email ? 7000 : 4000 },
                );
                reset({
                    email: updated.email,
                    phone: updated.phone,
                    emergency_phone: updated.emergency_phone ?? "",
                    current_password: "",
                });
                onSuccess?.();
            },
            onError: (error) => setFormError(error.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <p className="text-[13.5px] text-ink-4">
                Tu nombre, fecha de nacimiento y dirección solo puede modificarlos el consultorio.
            </p>

            <FormRowInput label="Nombre" icon={User} readOnlyValue={patient.name} />
            <FormRowInput label="Apellido" icon={User} readOnlyValue={patient.lastname} />
            <FormRowInput
                label="Nacimiento" icon={CalendarDays}
                readOnlyValue={patient.birth_date ? formatDate(patient.birth_date) : "—"}
            />
            <FormRowInput
                label="Teléfono" icon={Phone} type="tel" inputMode="tel" autoComplete="tel"
                registration={register("phone")} error={errors.phone?.message}
            />
            <FormRowInput
                label="Emergencia" icon={TriangleAlert} type="tel" inputMode="tel"
                registration={register("emergency_phone")} error={errors.emergency_phone?.message}
            />
            <FormRowInput
                label="Correo" icon={Mail} type="email" autoComplete="email"
                registration={register("email")} error={errors.email?.message}
            />
            {emailChanged && (
                <FormRowInput
                    label="Contraseña actual" icon={KeyRound} type="password" autoComplete="current-password"
                    hint="Por seguridad, para cambiar tu correo confirma tu contraseña actual."
                    registration={register("current_password")} error={errors.current_password?.message}
                />
            )}
            <FormRowInput label="Dirección" icon={MapPin} readOnlyValue={patient.address ?? "—"} />

            <div className="form-footer">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Modificar
                </Button>
            </div>
        </form>
    );
}

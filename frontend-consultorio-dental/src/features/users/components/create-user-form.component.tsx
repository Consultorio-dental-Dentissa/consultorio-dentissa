import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { InputForm, SelectForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUser } from "@/features/users/hooks/use-users";
import { createUserSchema, type UserFormData } from "@/features/users/components/user.schema";
import { Role } from "@/features/users/types/rol.enum";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import { normalizePhone, PASSWORD_MIN_LENGTH } from "@/utils/validation";
import { toDateInputValue } from "@/utils/formatters";

const ROLE_OPTIONS = [
    { data: "Administrador", value: Role.ADMINISTRADOR },
    { data: "Asistente", value: Role.ASISTENTE },
    { data: "Paciente", value: Role.PACIENTE },
];

interface CreateUserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    /** Fija el rol (p. ej. "Nuevo paciente" desde Pacientes): oculta el selector de rol. */
    fixedRole?: Role;
    submitLabel?: string;
    successMessage?: string;
}

export function CreateUserForm({
    onSuccess, onCancel, fixedRole, submitLabel = "Crear usuario", successMessage = "Usuario creado correctamente",
}: CreateUserFormProps) {
    const createUserMutation = useCreateUser();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: fixedRole ?? Role.ASISTENTE },
    });

    const isPatient = useWatch({ control, name: "role" }) === Role.PACIENTE;

    const onSubmit = (data: UserFormData) => {
        setFormError(null);

        const payload: CreateUserDto = {
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            phone: normalizePhone(data.phone),
            password: data.password,
            role: data.role,
            patient: isPatient
                ? {
                    address: data.address ?? "",
                    birth_date: data.birth_date ?? "",
                    emergency_phone: normalizePhone(data.emergency_phone ?? ""),
                }
                : undefined,
        };

        createUserMutation.mutate(payload, {
            onSuccess: () => {
                toast.success(successMessage);
                onSuccess();
            },
            onError: (error) => setFormError(error.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
                <InputForm label="Nombre" required registration={register("name")} error={errors.name?.message} />
                <InputForm label="Apellido" required registration={register("lastname")} error={errors.lastname?.message} />
            </div>

            <InputForm
                label="Correo electrónico" required type="email"
                registration={register("email")} error={errors.email?.message}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                    label="Teléfono" required type="tel" inputMode="tel"
                    registration={register("phone")} error={errors.phone?.message}
                />
                {!fixedRole && (
                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <SelectForm
                                label="Rol" required
                                data={ROLE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.role?.message}
                            />
                        )}
                    />
                )}
            </div>

            <InputForm
                label="Contraseña" required type="password" autoComplete="new-password"
                hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
                registration={register("password")} error={errors.password?.message}
            />

            {isPatient && (
                <fieldset className="flex flex-col gap-4 border-t border-dashed border-input pt-4">
                    <legend className="pr-2 text-xs font-bold tracking-[0.04em] text-ink-4 uppercase">Datos obligatorios para pacientes</legend>
                    <InputForm label="Dirección" required registration={register("address")} error={errors.address?.message} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputForm
                            label="Fecha de nacimiento" required type="date" max={toDateInputValue(new Date())}
                            registration={register("birth_date")} error={errors.birth_date?.message}
                        />
                        <InputForm
                            label="Teléfono de emergencia" required type="tel" inputMode="tel"
                            registration={register("emergency_phone")} error={errors.emergency_phone?.message}
                        />
                    </div>
                </fieldset>
            )}

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={createUserMutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending && <Spinner />} {submitLabel}
                </Button>
            </div>
        </form>
    );
}

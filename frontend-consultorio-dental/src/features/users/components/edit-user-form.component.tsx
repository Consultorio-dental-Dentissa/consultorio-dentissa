import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { InputForm, SelectForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUpdateUser } from "@/features/users/hooks/use-users";
import { Role } from "@/features/users/types/rol.enum";
import type { User } from "@/features/users/types/user.model";
import type { UpdateUserDto } from "@/features/users/types/update-user.dto";
import { emailSchema, normalizePhone, phoneSchema, requiredText } from "@/utils/validation";

const schema = z.object({
    name: requiredText("El nombre"),
    lastname: requiredText("El apellido"),
    email: emailSchema,
    phone: phoneSchema("El teléfono"),
    role: z.string().min(1, "Selecciona un rol"),
    current_password: z.string().optional(),
});

type EditInput = z.infer<typeof schema>;

const STAFF_ROLE_OPTIONS = [
    { data: "Administrador", value: Role.ADMINISTRADOR },
    { data: "Asistente", value: Role.ASISTENTE },
];
const PATIENT_ROLE_OPTIONS = [{ data: "Paciente", value: Role.PACIENTE }];

interface EditUserFormProps {
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
    const mutation = useUpdateUser(user.id);
    const [formError, setFormError] = useState<string | null>(null);
    const { user: currentUser, logOut } = useAuth();
    const navigate = useNavigate();
    const isPatient = user.role === Role.PACIENTE;
    // El administrador no puede cambiar su propio rol (el backend también lo rechaza).
    const isSelf = currentUser?.id === user.id;

    const initial: EditInput = {
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<EditInput>({ resolver: zodResolver(schema), defaultValues: { ...initial, current_password: "" } });

    const watchedEmail = useWatch({ control, name: "email" });
    const selfEmailChanged = isSelf && watchedEmail?.trim().toLowerCase() !== initial.email.toLowerCase();

    const onSubmit = (data: EditInput) => {
        setFormError(null);

        // PATCH parcial: solo los campos modificados
        const changes: UpdateUserDto = {};
        if (data.name !== initial.name) changes.name = data.name;
        if (data.lastname !== initial.lastname) changes.lastname = data.lastname;
        if (data.email.toLowerCase() !== initial.email.toLowerCase()) changes.email = data.email;
        if (normalizePhone(data.phone) !== normalizePhone(initial.phone)) changes.phone = normalizePhone(data.phone);
        // Nunca se envía el rol si es el propio administrador ni si es un paciente.
        if (!isPatient && !isSelf && data.role !== initial.role) changes.role = data.role;

        if (Object.keys(changes).length === 0) {
            toast("No hay cambios para guardar");
            return;
        }

        const emailChanged = isSelf && changes.email !== undefined;
        if (emailChanged) {
            if (!data.current_password) {
                setError("current_password", { message: "Ingresa tu contraseña actual para cambiar el correo" });
                return;
            }
            changes.current_password = data.current_password;
        }

        mutation.mutate(changes, {
            onSuccess: async () => {
                if (emailChanged) {
                    // El backend revoca los refresh tokens al cambiar el correo: se cierra la sesión y se inicia con el nuevo.
                    toast.success("Correo actualizado. Inicia sesión de nuevo con tu nuevo correo.", { duration: 7000 });
                    onSuccess();
                    await logOut();
                    navigate("/login", { replace: true });
                    return;
                }
                toast.success("Usuario actualizado correctamente");
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
            {selfEmailChanged && (
                <InputForm
                    label="Contraseña actual" required type="password" autoComplete="current-password"
                    hint="Por seguridad, confirma tu contraseña. Al cambiar tu correo se cerrará tu sesión y deberás iniciar de nuevo."
                    registration={register("current_password")} error={errors.current_password?.message}
                />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                    label="Teléfono" required type="tel" inputMode="tel"
                    registration={register("phone")} error={errors.phone?.message}
                />
                <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <SelectForm
                            label="Rol" required
                            data={isPatient ? PATIENT_ROLE_OPTIONS : STAFF_ROLE_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isPatient || isSelf}
                            hint={
                                isSelf ? "Tu rol no puede modificarse"
                                    : isPatient ? "El rol de un paciente no puede cambiarse." : undefined
                            }
                            error={errors.role?.message}
                        />
                    )}
                />
            </div>

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Guardar cambios
                </Button>
            </div>
        </form>
    );
}

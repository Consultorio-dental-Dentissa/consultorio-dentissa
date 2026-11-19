import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { KeyRound, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Alert } from "@/components/shared/alert.component";
import { FormRowInput } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROLE_LABELS } from "@/config/labels";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUpdateUser } from "@/features/users/hooks/use-users";
import type { User as UserModel } from "@/features/users/types/user.model";
import type { UpdateUserDto } from "@/features/users/types/update-user.dto";
import { emailSchema, normalizePhone, phoneSchema, requiredText } from "@/utils/validation";

const schema = z.object({
    name: requiredText("El nombre"),
    lastname: requiredText("El apellido"),
    email: emailSchema,
    phone: phoneSchema("El teléfono"),
    current_password: z.string().optional(),
});

type EditInput = z.infer<typeof schema>;

interface EditMyUserFormProps {
    user: UserModel;
    onSuccess: () => void;
    onCancel: () => void;
}

/**
 * "Modificar datos" del Perfil de usuario (solo ADMINISTRADOR): nombre, apellido, correo y teléfono mediante
 * PATCH /users/:id con su propio id. El rol se muestra en solo lectura y nunca se envía. Cambiar el correo exige la
 * contraseña actual y cierra la sesión (el backend revoca los refresh tokens): se vuelve a /login.
 */
export function EditMyUserForm({ user, onSuccess, onCancel }: EditMyUserFormProps) {
    const mutation = useUpdateUser(user.id);
    const { logOut } = useAuth();
    const navigate = useNavigate();
    const [formError, setFormError] = useState<string | null>(null);

    const initial: EditInput = { name: user.name, lastname: user.lastname, email: user.email, phone: user.phone };

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<EditInput>({ resolver: zodResolver(schema), defaultValues: { ...initial, current_password: "" } });

    const watchedEmail = useWatch({ control, name: "email" });
    const emailChanged = watchedEmail?.trim().toLowerCase() !== initial.email.toLowerCase();

    const onSubmit = (data: EditInput) => {
        setFormError(null);

        const changes: UpdateUserDto = {};
        if (data.name !== initial.name) changes.name = data.name;
        if (data.lastname !== initial.lastname) changes.lastname = data.lastname;
        if (data.email.toLowerCase() !== initial.email.toLowerCase()) changes.email = data.email;
        if (normalizePhone(data.phone) !== normalizePhone(initial.phone)) changes.phone = normalizePhone(data.phone);

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
            onSuccess: async () => {
                if (changes.email) {
                    toast.success("Correo actualizado. Inicia sesión de nuevo con tu nuevo correo.", { duration: 7000 });
                    onSuccess();
                    await logOut();
                    navigate("/login", { replace: true });
                    return;
                }
                toast.success("Tus datos fueron actualizados");
                onSuccess();
            },
            onError: (error) => setFormError(error.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <FormRowInput label="Nombre" icon={User} registration={register("name")} error={errors.name?.message} autoComplete="given-name" />
            <FormRowInput label="Apellido" icon={User} registration={register("lastname")} error={errors.lastname?.message} autoComplete="family-name" />
            <FormRowInput
                label="Teléfono" icon={Phone} type="tel" inputMode="tel" autoComplete="tel"
                registration={register("phone")} error={errors.phone?.message}
            />
            <FormRowInput
                label="Correo" icon={Mail} type="email" autoComplete="email"
                registration={register("email")} error={errors.email?.message}
            />
            {emailChanged && (
                <FormRowInput
                    label="Contraseña actual" icon={KeyRound} type="password" autoComplete="current-password" required
                    hint="Por seguridad, confirma tu contraseña. Al cambiar tu correo se cerrará tu sesión y deberás iniciar de nuevo."
                    registration={register("current_password")} error={errors.current_password?.message}
                />
            )}
            <FormRowInput
                label="Rol" icon={ShieldCheck} readOnlyValue={ROLE_LABELS[user.role] ?? user.role}
                hint="Tu rol no puede modificarse desde aquí."
            />

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Modificar
                </Button>
            </div>
        </form>
    );
}
